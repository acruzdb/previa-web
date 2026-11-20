// Trivial en red: dibuja el estado de la partida. Lo usan el anfitrión (dentro de la app)
// y los invitados (en el navegador de su móvil, desde el enlace o el QR).
window.NetTriv=(function(){
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const av=(p,cls)=>'<img class="av '+(cls||"")+'" alt="" src="'+avatarURL(p.av)+'" style="border-color:'+p.color+'">';
  function pie(w,cats,size){
    let h='<svg viewBox="-12 -12 24 24" width="'+(size||22)+'" height="'+(size||22)+'"><circle r="11" fill="#2a2140" stroke="#fff" stroke-width="1.2"/>';
    cats.forEach((c,i)=>{const a0=(i*60-90)*Math.PI/180,a1=((i+1)*60-90)*Math.PI/180;
      if(w.indexOf(c.k)>=0)h+='<path d="M0 0L'+(10*Math.cos(a0)).toFixed(2)+' '+(10*Math.sin(a0)).toFixed(2)+'A10 10 0 0 1 '+(10*Math.cos(a1)).toFixed(2)+' '+(10*Math.sin(a1)).toFixed(2)+'z" fill="'+c.c+'"/>'});
    return h+'</svg>';
  }
  function wheel(cats){
    let s='<svg viewBox="-110 -110 220 220">';
    cats.forEach((c,i)=>{const a0=(i*60-120)*Math.PI/180,a1=(i*60-60)*Math.PI/180,am=(i*60-90)*Math.PI/180;
      s+='<path d="M0 0L'+(100*Math.cos(a0)).toFixed(1)+' '+(100*Math.sin(a0)).toFixed(1)+'A100 100 0 0 1 '+(100*Math.cos(a1)).toFixed(1)+' '+(100*Math.sin(a1)).toFixed(1)+'z" fill="'+c.c+'" stroke="#1a1027" stroke-width="3"/>';
      const x=(64*Math.cos(am)).toFixed(1),y=(64*Math.sin(am)).toFixed(1);
      s+='<text x="'+x+'" y="'+y+'" font-size="30" text-anchor="middle" dominant-baseline="central" transform="rotate('+(i*60)+' '+x+' '+y+')">'+c.em+'</text>'});
    return s+'<circle r="18" fill="#fff" stroke="#1a1027" stroke-width="4"/><text font-size="16" text-anchor="middle" dominant-baseline="central">🧀</text></svg>';
  }
  function mount(root,opts){
    root.innerHTML='<div class="nt"><div class="nt-top"></div><div class="wedgebar nt-wedges"></div><div class="nt-msg"></div>'+
      '<div class="nt-stage"><div class="wheelwrap"><div class="pointer">▼</div><div class="nt-wheel"></div></div></div><div class="nt-panel"></div></div>';
    const ctx={root,opts,spin:null,lastMsg:null,cats:null};
    return {render:st=>render(ctx,st)};
  }
  function render(ctx,st){
    const R=ctx.root,me=ctx.opts.me,send=ctx.opts.send,$=s=>R.querySelector(s);
    if(!st||!st.players)return;
    const cur=st.players[st.turn]||st.players[0],mine=cur&&cur.id===me;
    if(!ctx.cats){ctx.cats=st.cats;$(".nt-wheel").innerHTML=wheel(st.cats)}
    $(".nt-top").innerHTML=st.phase==="end"?('<b>'+_t('🏁 Fin de la partida')+'</b>'):(cur?av(cur)+'<b>'+(mine?_t("¡Te toca!"):_t("Turno de ")+esc(cur.name))+('</b>'+'<span>'+_t('Ronda '))+st.round+' · '+st.target+(_t(' 🧀 para ganar')+'</span>'):'');
    $(".nt-wedges").innerHTML=st.players.map((p,i)=>'<span class="'+(i===st.turn&&st.phase!=="end"?"cur":"")+(p.id===me?" me":"")+'" style="--tc:'+p.color+'">'+av(p,"xs")+pie(p.wedges,st.cats)+'<b>'+p.wedges.length+'</b></span>').join("");
    // ruleta sincronizada
    const w=$(".nt-wheel");
    if(st.spin&&ctx.spin!==st.spin.id){
      if(ctx.spin===null||st.step!=="spinning"){w.style.transition="none";w.style.transform="rotate("+st.spin.rot+"deg)"}
      else{w.style.transition="transform 3.2s cubic-bezier(.15,.9,.25,1)";w.style.transform="rotate("+st.spin.rot+"deg)"}
      ctx.spin=st.spin.id;
    }
    if(st.last&&st.last.id!==ctx.lastMsg){ctx.lastMsg=st.last.id;const m=$(".nt-msg");m.textContent=st.last.text;m.className="nt-msg show "+(st.last.ok?"ok":"ko");clearTimeout(ctx.mt);ctx.mt=setTimeout(()=>m.className="nt-msg",3500);if(navigator.vibrate)try{navigator.vibrate(st.last.ok?40:150)}catch(e){}}
    const P=$(".nt-panel");$(".nt-stage").hidden=st.phase==="end"||!!(st.q&&st.q.opts&&(st.step==="question"||st.step==="reveal"));R.querySelector(".nt").classList.toggle("end",st.phase==="end");
    if(st.phase==="end"){
      const top=Math.max(...st.players.map(p=>p.wedges.length));
      const rk=st.players.slice().sort((a,b)=>b.wedges.length-a.wedges.length);
      const win=rk.filter(p=>p.wedges.length===top);
      P.innerHTML=('<div class="nt-card nt-final" style="--c1:#ff9f1c;--c2:#ff2e88">'+'<div class="final">'+'<div class="imp-tag">'+_t('🏁 Fin de la partida')+'</div>'+'<div class="fwin">'+'<span class="tro">'+'🏆'+'</span>'+'<span>')+(win.length>1?_t("¡Empate en cabeza!"):_t("Gana ")+esc(win[0].name))+'</span></div><div class="nt-podium">'+win.map(p=>av(p,"big")).join("")+'</div><div class="win-list">'+
        rk.map(p=>{const d=top-p.wedges.length;return '<div style="border-left:5px solid '+p.color+'">'+av(p,"xs")+' '+esc(p.name)+' · 🧀 '+p.wedges.length+(d?'<span style="margin-left:auto">🍻 '+d+(d>1?_t(" tragos"):_t(" trago"))+'</span>':'<span style="margin-left:auto">👑</span>')+'</div>'}).join("")+
        ('</div>'+'<div class="cfoot">'+_t('Cada uno bebe tantos tragos como quesitos le saque el ganador.')+'</div>'+'</div>'+'</div>');
      R.querySelector(".nt").classList.add("end");
      return;
    }
    if(st.step==="spin"){
      P.innerHTML=mine?('<button class="btn primary nt-big">'+_t('🎡 ¡Gira la ruleta!')+'</button>')+(st.streak?('<p class="nt-hint">'+_t('¡Acierto! Sigues tirando ('))+st.streak+'/3)</p>':''):('<p class="nt-wait">'+_t('Esperando a que '))+esc(cur.name)+(_t(' gire la ruleta…')+'</p>');
      if(mine)P.querySelector("button").onclick=e=>{e.target.disabled=true;send({t:"spin"})};
    } else if(st.step==="spinning"){
      P.innerHTML=('<p class="nt-wait">'+_t('🎡 Girando…')+'</p>');
    } else if((st.step==="question"||st.step==="reveal")&&st.q&&st.q.opts){
      // online: 3 opciones y 10 segundos para quien tiene el turno
      const c=st.cats.find(x=>x.k===st.q.cat),q=st.q,rev=st.step==="reveal";
      if(ctx.qid!==q.id){ctx.qid=q.id;ctx.qStart=Date.now();ctx.picked=null}
      clearInterval(ctx.tick);
      let h='<div class="nt-card" style="--c1:'+c.c+';--c2:#1a1027"><div class="nt-ct">'+c.em+' '+esc(c.n)+'</div><div class="nt-q">'+esc(q.text)+'</div>';
      if(!rev)h+='<div class="nt-timer"><i></i><b></b></div>';
      h+='<div class="nt-opts">'+q.opts.map((o,i)=>{let cl="nt-opt";
        if(rev){if(i===q.right)cl+=" right";else if(i===q.pick)cl+=" wrong"}else if(ctx.picked===i)cl+=" sel";
        return '<button class="'+cl+'" data-i="'+i+'"'+(!mine||rev||ctx.picked!=null?" disabled":"")+'><span>'+"ABC"[i]+'</span>'+esc(o)+'</button>'}).join("")+'</div>';
      if(rev){h+='<p class="nt-foot nt-res">'+(q.pick===q.right?_t("✅ ¡Correcto!"):q.pick<0?_t("⏱️ Se acabó el tiempo"):_t("❌ No era esa"))+'</p>';
        if(q.ans&&q.ans!==q.opts[q.right])h+='<p class="nt-foot">'+esc(q.ans)+'</p>'}
      else h+='<p class="nt-foot">'+(mine?(q.wedge&&!q.has?_t("🧀 Si aciertas te llevas el quesito"):_t("Si aciertas, sigues tirando")):'⏳ '+esc(cur.name)+_t(" está eligiendo…"))+'</p>';
      P.innerHTML=h+'</div>';
      if(!rev){
        const bar=P.querySelector(".nt-timer i"),num=P.querySelector(".nt-timer b"),secs=q.secs||10;
        const upd=()=>{const left=Math.max(0,secs-(Date.now()-ctx.qStart)/1000);bar.style.width=(left/secs*100)+"%";num.textContent=Math.ceil(left);bar.parentNode.classList.toggle("low",left<=3);if(left<=0)clearInterval(ctx.tick)};
        upd();ctx.tick=setInterval(upd,100);
        if(mine&&ctx.picked==null)P.querySelectorAll(".nt-opt").forEach(b=>b.onclick=()=>{ctx.picked=+b.dataset.i;P.querySelectorAll(".nt-opt").forEach(x=>{x.disabled=true;x.classList.toggle("sel",x===b)});send({t:"pick",i:+b.dataset.i,q:q.id})});
      }
    } else if(st.step==="question"&&st.q){
      const c=st.cats.find(x=>x.k===st.q.cat);
      let h='<div class="nt-card" style="--c1:'+c.c+';--c2:#1a1027"><div class="nt-ct">'+c.em+' '+esc(c.n)+'</div><div class="nt-q">'+esc(st.q.text)+'</div>'+
        '<p class="nt-foot">'+(st.q.wedge&&!st.q.has?_t("🧀 Si acierta se lleva el quesito"):_t("Si acierta, sigue tirando"))+'</p>';
      if(mine)h+=('<div class="nt-you">'+_t('🗣️ Responde en voz alta. Los demás tienen la respuesta.')+'</div>'+'</div>');
      else h+='<div class="answer">'+esc(st.q.ans)+('</div>'+'<div class="nt-judge">'+'<button class="btn bad" data-ok="0">'+_t('❌ Ha fallado')+'</button>'+'<button class="btn primary" data-ok="1">'+_t('✅ Ha acertado')+'</button>'+'</div>'+'</div>');
      P.innerHTML=h;
      P.querySelectorAll("[data-ok]").forEach(b=>b.onclick=()=>{P.querySelectorAll("[data-ok]").forEach(x=>x.disabled=true);send({t:"judge",ok:b.dataset.ok==="1",q:st.q.id})});
    }
  }
  return {mount,pie};
})();

// =====================================================================
// PICTIONARY ONLINE: lienzo compartido. Quien dibuja manda los trazos (coordenadas
// 0-1000) y los demás escriben la palabra exacta. La usan el anfitrión y los invitados.
//   NetPicto.mount(root,{me,send,secret:st=>palabra|null}).render(st)
// =====================================================================
window.NetPicto=(function(){
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const T=s=>window._t?_t(s):s;
  const COLORS=["#111111","#e53935","#1e88e5","#43a047","#fdd835","#fb8c00","#8e24aa","#ffffff"];
  const SIZES=[6,14,30];
  function mount(root,o){
    root.innerHTML='<div class="pz">'+
      '<div class="pz-top"><img class="av" alt=""><div class="pz-who"></div><div class="pz-time"></div></div>'+
      '<div class="pz-scores"></div>'+
      '<div class="pz-word" hidden></div>'+
      '<div class="pz-canvas"><canvas width="1000" height="1000"></canvas><div class="pz-over" hidden></div></div>'+
      '<div class="pz-tools" hidden><div class="pz-cols">'+COLORS.map((c,i)=>'<button data-c="'+c+'" style="background:'+c+'"'+(i===0?' class="on"':'')+'></button>').join("")+'</div>'+
        '<div class="pz-sz">'+SIZES.map((w,i)=>'<button data-w="'+w+'"'+(i===0?' class="on"':'')+'><i style="width:'+(4+i*6)+'px;height:'+(4+i*6)+'px"></i></button>').join("")+
        '<button data-act="undo">↶</button><button data-act="clear">🗑️</button></div></div>'+
      '<form class="pz-guess" hidden><input maxlength="40" autocomplete="off" autocapitalize="none" spellcheck="false"><button class="btn primary sm">'+T("Enviar")+'</button></form>'+
      '<div class="pz-feed"></div>'+
      '<div class="pz-end" hidden></div>'+
    '</div>';
    const $=s=>root.querySelector(s),cv=$("canvas"),cx=cv.getContext("2d");
    const inp=$(".pz-guess input");$(".pz-guess input").placeholder=T("Escribe la palabra…");
    let st=null,rid=-1,ridStart=0,tick=null,mine=[],color=COLORS[0],width=SIZES[0],drawing=null,buf=[],flushT=null,amDrawer=false;
    function paint(strokes){
      cx.fillStyle="#fff";cx.fillRect(0,0,1000,1000);cx.lineCap="round";cx.lineJoin="round";
      strokes.forEach(s=>{const p=s.p;if(!p||p.length<2)return;cx.strokeStyle=s.c;cx.lineWidth=s.w;cx.beginPath();cx.moveTo(p[0],p[1]);
        if(p.length===2)cx.lineTo(p[0]+.1,p[1]);for(let i=2;i<p.length;i+=2)cx.lineTo(p[i],p[i+1]);cx.stroke()});
    }
    function pos(e){const r=cv.getBoundingClientRect();return [Math.round((e.clientX-r.left)/r.width*1000),Math.round((e.clientY-r.top)/r.height*1000)]}
    function flush(){flushT=null;if(!drawing||!buf.length)return;o.send({t:"draw",rid,s:mine.length-1,c:drawing.c,w:drawing.w,pts:buf});buf=[]}
    cv.addEventListener("pointerdown",e=>{if(!amDrawer)return;e.preventDefault();cv.setPointerCapture(e.pointerId);
      const p=pos(e);drawing={c:color,w:width,p:p.slice()};mine.push(drawing);buf=p.slice();paint(mine);flush()});
    cv.addEventListener("pointermove",e=>{if(!drawing)return;e.preventDefault();const p=pos(e),l=drawing.p;
      if(Math.abs(p[0]-l[l.length-2])+Math.abs(p[1]-l[l.length-1])<4)return;
      l.push(p[0],p[1]);buf.push(p[0],p[1]);paint(mine);if(!flushT)flushT=setTimeout(flush,90)});
    const up=()=>{if(!drawing)return;clearTimeout(flushT);flush();drawing=null};
    cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);cv.addEventListener("pointerleave",up);
    root.querySelectorAll(".pz-cols button").forEach(b=>b.onclick=()=>{color=b.dataset.c;root.querySelectorAll(".pz-cols button").forEach(x=>x.classList.toggle("on",x===b))});
    root.querySelectorAll(".pz-sz button[data-w]").forEach(b=>b.onclick=()=>{width=+b.dataset.w;root.querySelectorAll(".pz-sz button[data-w]").forEach(x=>x.classList.toggle("on",x===b))});
    $('[data-act="undo"]').onclick=()=>{if(!mine.length)return;mine.pop();paint(mine);o.send({t:"undo",rid})};
    $('[data-act="clear"]').onclick=()=>{mine=[];paint(mine);o.send({t:"clear",rid})};
    $(".pz-guess").onsubmit=e=>{e.preventDefault();const v=inp.value.trim();if(!v||!st)return;o.send({t:"guess",text:v,rid:st.rid});inp.value=""};
    function timer(){const left=Math.max(0,Math.ceil((st.secs||75)-(Date.now()-ridStart)/1000));const el=$(".pz-time");el.textContent=st.step==="draw"?left+"s":"";el.classList.toggle("low",left<=10)}
    function render(s){
      st=s;if(!s||!s.players)return;
      const cur=s.players[s.turn]||s.players[0];
      if(s.rid!==rid){rid=s.rid;ridStart=Date.now();mine=[];drawing=null;inp.value=""}
      amDrawer=s.phase==="play"&&s.step==="draw"&&cur.id===o.me;
      $(".pz-top img").src=avatarURL(cur.av);$(".pz-top img").style.borderColor=cur.color;
      $(".pz-who").innerHTML=s.phase==="end"?T("🏁 Fin de la partida"):(cur.id===o.me?T("¡Te toca dibujar!"):esc(cur.name)+T(" dibuja"))+'<small>'+T("Ronda ")+Math.min(s.round,s.rounds)+"/"+s.rounds+'</small>';
      $(".pz-scores").innerHTML=s.players.slice().sort((a,b)=>b.pts-a.pts).map(p=>'<span'+(p.id===cur.id&&s.phase==="play"?' class="cur"':'')+'><img class="av" alt="" src="'+avatarURL(p.av)+'" style="border-color:'+p.color+'">'+p.pts+'</span>').join("");
      const word=amDrawer?o.secret(s):null;
      $(".pz-word").hidden=!amDrawer;if(amDrawer)$(".pz-word").innerHTML=T("Dibuja: ")+'<b>'+esc(word||"…")+'</b>';
      $(".pz-tools").hidden=!amDrawer;
      $(".pz-guess").hidden=!(s.phase==="play"&&s.step==="draw"&&!amDrawer);
      root.querySelector(".pz").classList.toggle("drawer",amDrawer);
      if(amDrawer){if(!mine.length&&s.strokes.length&&!drawing)mine=s.strokes.map(x=>({c:x.c,w:x.w,p:x.p.slice()}));paint(mine)}else paint(s.strokes||[]);
      const ov=$(".pz-over");
      if(s.step==="reveal"||s.phase==="end"){const w=s.players.find(p=>p.id===s.winner);ov.hidden=false;
        ov.innerHTML=(w?'<b>✅ '+esc(w.name)+T(" lo ha adivinado")+'</b>':'<b>⏱️ '+T("Nadie lo ha adivinado")+'</b>')+'<span>'+T("Era: ")+'<em>'+esc(s.word||"")+'</em></span>'}
      else ov.hidden=true;
      $(".pz-feed").innerHTML=(s.feed||[]).slice().reverse().map(f=>'<div class="'+(f.ok?"ok":"")+'"><b style="color:'+f.c+'">'+esc(f.n)+'</b> '+(f.ok?T("¡lo ha adivinado! 🎉"):esc(f.t)+' ❌')+'</div>').join("");
      const end=$(".pz-end");end.hidden=s.phase!=="end";
      if(s.phase==="end"){const r=s.players.slice().sort((a,b)=>b.pts-a.pts);
        end.innerHTML='<h3>🏆 '+esc(r[0].name)+T(" gana")+'</h3>'+r.map((p,i)=>'<div class="pz-rank"><span>'+(i+1)+'</span><img class="av" alt="" src="'+avatarURL(p.av)+'" style="border-color:'+p.color+'"><b>'+esc(p.name)+'</b><em>'+p.pts+' pts</em></div>').join("")}
      clearInterval(tick);if(s.step==="draw"&&s.phase==="play"){timer();tick=setInterval(timer,500)}else timer();
    }
    return {render};
  }
  return {mount};
})();

// =====================================================================
// IMPOSTOR ONLINE: cada uno ve su rol en su móvil y pulsa «Listo». Cuando
// están todos, a todos les sale quién empieza. La usan anfitrión e invitados.
//   ImpOnline.view(pub,priv,ui) → html ;  ImpOnline.bind(root,ui,cb)
// =====================================================================
window.ImpOnline=(function(){
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const T=s=>window._t?_t(s):s;
  const av=p=>'<img class="av" alt="" src="'+avatarURL(p.av)+'" style="border-color:'+p.color+'">';
  function view(pub,priv,ui){
    const me=priv&&priv.name,seats=pub.seats||[];
    let h='<div class="io">';
    if(pub.step==="roles"){
      const isImp=priv.role==="imp",open=!!ui.open,ready=(pub.ready||[]).indexOf(me)>=0;
      h+='<div class="io-card'+(open?" open":"")+(open?(isImp?" imp":" word"):"")+'" data-act="flip">';
      if(!open)h+='<div class="io-tag">'+T("Ronda ")+pub.round+'</div><div style="font-size:64px">🤫</div><div class="io-big">'+T("Toca para ver tu rol")+'</div><div class="io-foot">'+T("Que nadie más mire 👀")+'</div>';
      else if(isImp){h+='<div class="io-tag">'+esc(me)+T(", eres…")+'</div><div style="font-size:56px">🕵️</div><div class="io-big">'+T("EL IMPOSTOR")+'</div>';
        if(priv.cat)h+='<div class="io-foot">'+T("Categoría: ")+'<b>'+esc(priv.cat)+'</b></div>';
        h+=priv.hint?'<div class="io-foot">'+T("Tu pista: ")+'<b>'+esc(priv.hint)+'</b></div>':'<div class="io-foot">'+T("Sin pista: ¡a improvisar!")+'</div>';
        if(priv.n>1)h+='<div class="io-foot">'+T("Hay ")+priv.n+T(" impostores. No sabes quiénes son los demás.")+'</div>'}
      else{h+='<div class="io-tag">'+esc(me)+T(", tu palabra es")+'</div><div class="io-big">'+esc(priv.word)+'</div>';
        if(priv.cat)h+='<div class="io-foot">'+T("Categoría: ")+'<b>'+esc(priv.cat)+'</b></div>';
        h+='<div class="io-foot">'+T("Descríbela sin decirla, pero sin ponérselo fácil al impostor.")+'</div>'}
      if(open)h+='<div class="io-foot" style="opacity:.7">'+T("Toca otra vez para taparla")+'</div>';
      h+='</div>';
      h+=ready?'<div class="io-wait">✅ '+T("Listo. Esperando a los demás…")+'</div>':'<button class="btn primary io-ready'+(ui.seen?"":" dim")+'" data-act="ready">'+T("✅ Listo")+'</button>';
      h+='<div class="io-seats">'+seats.map(p=>'<span class="'+((pub.ready||[]).indexOf(p.name)>=0?"ok":"")+'">'+av(p)+esc(p.name)+'</span>').join("")+'</div>';
    } else if(pub.step==="go"){
      const st=seats.find(p=>p.name===pub.starter)||{name:pub.starter,av:"bombero",color:"#fff"};
      h+='<div class="io-card open go"><div class="io-tag">'+T("¡Todos tenéis vuestra palabra!")+'</div>'+av(st)+'<div class="io-big">'+T("Empieza ")+esc(st.name)+'</div>'+
        '<div class="io-foot" style="text-align:left">'+T("1️⃣ Por turnos, cada uno dice una palabra relacionada.")+'<br>'+T("2️⃣ Después, votad quién creéis que es el impostor.")+'</div></div>';
      if(priv&&priv.role)h+='<div class="io-mine">'+(priv.role==="imp"?'🕵️ '+T("Eres el impostor"):T("Tu palabra: ")+'<b>'+esc(priv.word)+'</b>')+'</div>';
    } else if(pub.step==="end"){
      const list=seats.filter(p=>(pub.imps||[]).indexOf(p.name)>=0);
      h+='<div class="io-card open end"><div class="io-tag">'+(list.length>1?T("Los impostores eran"):T("El impostor era"))+'</div><div class="io-list">'+list.map(p=>'<div>'+av(p)+esc(p.name)+'</div>').join("")+'</div><div class="io-foot">'+T("La palabra era ")+'<b>'+esc(pub.word||"")+'</b></div></div>';
    }
    return h+'</div>';
  }
  function bind(root,ui,cb){
    const c=root.querySelector('[data-act="flip"]');if(c)c.onclick=()=>{ui.open=!ui.open;if(ui.open)ui.seen=true;cb("flip")};
    const r=root.querySelector('[data-act="ready"]');if(r)r.onclick=()=>{if(!ui.seen){cb("needsee");return}cb("ready")};
  }
  return {view,bind};
})();
