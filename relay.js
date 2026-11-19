// =====================================================================
// SALAS ONLINE: conecta los móviles por internet a través de un servidor MQTT
// (por WebSocket). El anfitrión publica el estado de la partida y los invitados
// sus acciones; el servidor solo reenvía mensajes. Sin librerías: cliente
// MQTT 3.1.1 mínimo (QoS 0, mensajes retenidos para el estado).
//
//   const r=Relay.open({room:"KX7P2",sub:["act"],onMsg:(kind,obj)=>…,onStatus:s=>…});
//   r.pub("state",obj,true); r.close();
//
// Servidor: el primero de BROKERS que responda. Se puede cambiar con ?broker=wss://…
// en la dirección o guardándolo en localStorage "previa_broker" (lo usan los tests).
// =====================================================================
(function(root){
  const BROKERS=["wss://broker.emqx.io:8084/mqtt","wss://broker.hivemq.com:8884/mqtt"];
  const PREFIX="previa/r1/";
  const CODE_CHARS="ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const enc=new TextEncoder(),dec=new TextDecoder();

  function brokers(){
    let custom=null;
    try{const m=/[?&]broker=([^&]+)/.exec(location.search);if(m)custom=decodeURIComponent(m[1]);else{const v=localStorage.getItem("previa_broker");if(v)custom=JSON.parse(v)}}catch(e){}
    return custom?[custom]:BROKERS.slice();
  }
  function newCode(){let s="";const a=new Uint32Array(5);(root.crypto||{getRandomValues:x=>x.map(()=>Math.random()*4e9)}).getRandomValues(a);for(let i=0;i<5;i++)s+=CODE_CHARS[a[i]%CODE_CHARS.length];return s}
  function cleanCode(s){return String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8)}

  // ---- paquetes MQTT ----
  function str(s){const b=enc.encode(s);return [b.length>>8,b.length&255,...b]}
  function remLen(n){const o=[];do{let d=n%128;n=Math.floor(n/128);if(n>0)d|=128;o.push(d)}while(n>0);return o}
  function pkt(type,body){return new Uint8Array([type,...remLen(body.length),...body])}
  const CONNECT=id=>pkt(0x10,[...str("MQTT"),4,0x02,0,30,...str(id)]);
  const SUBSCRIBE=(pid,topics)=>pkt(0x82,[pid>>8,pid&255,...topics.flatMap(t=>[...str(t),0])]);
  function PUBLISH(topic,payload,retain){const p=typeof payload==="string"?enc.encode(payload):payload;
    const t=str(topic),body=new Uint8Array(t.length+p.length);body.set(t,0);body.set(p,t.length);
    return new Uint8Array([0x30|(retain?1:0),...remLen(body.length),...body])}
  const PING=new Uint8Array([0xC0,0]),DISCONNECT=new Uint8Array([0xE0,0]);

  // lee paquetes completos de un flujo de bytes
  function parser(onPacket){
    let buf=new Uint8Array(0);
    return function(chunk){
      const n=new Uint8Array(buf.length+chunk.length);n.set(buf);n.set(chunk,buf.length);buf=n;
      for(;;){
        if(buf.length<2)return;
        let mul=1,len=0,i=1,b;
        do{if(i>=buf.length)return;b=buf[i++];len+=(b&127)*mul;mul*=128}while(b&128);
        if(buf.length<i+len)return;
        onPacket(buf[0],buf.subarray(i,i+len));
        buf=buf.slice(i+len);
      }
    };
  }

  function open(o){
    const room=cleanCode(o.room),list=brokers(),subs=(o.sub||[]).map(k=>PREFIX+room+"/"+k);
    const clientId="pv"+Math.random().toString(36).slice(2,12);
    let ws=null,ok=false,closed=false,bi=0,tries=0,ping=null,retry=null,queue=[],pid=1;
    const status=s=>{try{o.onStatus&&o.onStatus(s)}catch(e){}};
    function onPacket(type,body){
      const t=type>>4;
      if(t===2){ // CONNACK
        if(body[1]!==0){ws.close();return}
        ok=true;tries=0;status("online");
        if(subs.length)ws.send(SUBSCRIBE(pid++,subs));
        const q=queue;queue=[];q.forEach(p=>ws.send(p));
        try{o.onConnect&&o.onConnect()}catch(e){}
      }else if(t===3){ // PUBLISH
        const tl=(body[0]<<8)|body[1],topic=dec.decode(body.subarray(2,2+tl));
        let off=2+tl;if((type>>1)&3)off+=2; // QoS>0 trae id
        const raw=dec.decode(body.subarray(off));if(!raw)return; // retenido borrado
        const kind=topic.slice((PREFIX+room+"/").length);
        let obj;try{obj=JSON.parse(raw)}catch(e){return}
        try{o.onMsg&&o.onMsg(kind,obj)}catch(e){console.error(e)}
      }
    }
    function connect(){
      if(closed)return;
      const url=list[bi%list.length];status(tries?"retry":"connecting");
      try{ws=new WebSocket(url,["mqtt"])}catch(e){return later()}
      ws.binaryType="arraybuffer";
      const feed=parser(onPacket);
      const to=setTimeout(()=>{if(!ok)try{ws.close()}catch(e){}},8000);
      ws.onopen=()=>ws.send(CONNECT(clientId));
      ws.onmessage=e=>feed(new Uint8Array(e.data));
      ws.onclose=ws.onerror=()=>{clearTimeout(to);if(ws._done)return;ws._done=true;
        const was=ok;ok=false;clearInterval(ping);if(closed)return;
        if(!was)bi++; // este servidor no responde: probar el siguiente
        later()};
      clearInterval(ping);ping=setInterval(()=>{if(ok)try{ws.send(PING)}catch(e){}},20000);
    }
    function later(){if(closed)return;status("retry");tries++;clearTimeout(retry);retry=setTimeout(connect,Math.min(8000,600*tries))}
    connect();
    return {
      room,
      get online(){return ok},
      pub(kind,obj,retain){const p=PUBLISH(PREFIX+room+"/"+kind,obj==null?"":JSON.stringify(obj),retain);if(ok)try{ws.send(p);return}catch(e){}
        if(retain)queue=queue.filter(x=>x._k!==kind);p._k=kind;queue.push(p);if(queue.length>50)queue.shift()},
      clear(kind){this.pub(kind,null,true)},
      close(){closed=true;clearInterval(ping);clearTimeout(retry);try{if(ok)ws.send(DISCONNECT);ws.close()}catch(e){}status("closed")}
    };
  }
  root.Relay={open,newCode,cleanCode,brokers,PREFIX};
})(typeof window!=="undefined"?window:globalThis);
