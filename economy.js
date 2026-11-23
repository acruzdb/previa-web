// =====================================================================
// ECONOMÍA DE LA EDICIÓN TIENDA: monedas, racha diaria, anuncios y compras.
// Solo lógica pura (sin pantalla ni almacenamiento) para poder probarla con
// tests: el monedero W es un objeto plano y "today" es una clave AAAA-MM-DD.
// En el navegador queda en window.Economy; en Node se exporta con module.exports.
// =====================================================================
(function(root){
  const CFG={
    START:50,          // monedas al instalar
    AD_COINS:20,AD_DAY:3,       // vídeos con recompensa: los únicos anuncios de la app
    STREAK:[10,15,20,25,30,40,60] // premio diario según el día de la racha (ciclo de 7)
  };
  // Profesiones es gratis; el resto de avatares va por packs
  const FREE_AV=["bombero","bombero_m","policia","policia_m","chef","chef_m","profesor","cientifica","doctora","astronauta","detective"];
  // cada pack de cartas desbloquea mazos completos: [objeto, mazo, cartas gratis sin el pack]
  const ITEMS=[
    {id:"hot",kind:"game",go:"hot-setup",price:300},
    {id:"culo",kind:"game",go:"cg:culo",price:300},
    {id:"bj",kind:"game",go:"cg:bj",price:400},
    {id:"pk",kind:"game",go:"cg:pk",price:500},
    // juegos nuevos: bloqueados por defecto (200 de momento)
    {id:"imp",kind:"game",go:"imp-setup",price:200},
    {id:"pc",kind:"game",go:"pc-setup",price:200},
    {id:"geo",kind:"game",go:"tg:geo",price:200},
    {id:"pueblo",kind:"game",go:"pueblo-setup",price:200},
    // categorías sueltas: Trivial «Érase una vez», Tabú e Impostor
    {id:"tr_anim",kind:"cat",game:"trivial",key:"anim",go:"tg:trivial",price:200},
    ...["lugares","profesiones","deportes","fiesta","famosos","vida","conceptos"].map(k=>({id:"tc_"+k,kind:"cat",game:"tabu",key:k,go:"tg:tabu",price:100})),
    ...["dibujos","peliculas","series","famosos","marcas","fiesta","videojuegos"].map(k=>({id:"ic_"+k,kind:"cat",game:"imp",key:k,go:"imp-setup",price:100})),
    {id:"av_fantasia",kind:"avatars",cat:1,price:200,ids:["princesa","rey","mago","superheroe","vampiro","vampiro_m","zombi","ninja","sirena","elfo"]},
    {id:"av_animales",kind:"avatars",cat:4,price:250,ids:["a_gato","a_perro","a_panda","a_zorro","a_conejo","a_oso","a_pinguino","a_rana","a_unicornio","a_leon","a_koala","a_tigre","a_pollito","a_dino"]},
    {id:"av_aventura",kind:"avatars",cat:2,price:120,ids:["pirata","pirata_m","vikingo","vikingo_m","vaquero"]},
    {id:"av_ocio",kind:"avatars",cat:3,price:150,ids:["rockera","dj","payaso","futbolista","surfera","gamer"]},
    {id:"cp_fiesta",kind:"cards",go:"yn-setup",price:100,decks:[["YONUNCA","fiesta",0]]},
    {id:"cp_salseo",kind:"cards",go:"yn-setup",price:100,decks:[["YONUNCA","salseo",0]]},
    {id:"cp_tablero",kind:"cards",go:"board-setup",price:200,decks:[["BOARD","yonunca",40],["BOARD","bebe",40],["BOARD","reto",40],["BOARD","verdad",40],["BOARD","votacion",40],["BOARD","evento",40]]},
    {id:"cp_botella",kind:"cards",go:"bottle-setup",price:120,decks:[["BOTELLA","verdad",40],["BOTELLA","reto",40]]},
    // temas de la app (el clásico oscuro/claro es gratis)
    {id:"th_periodico",kind:"theme",key:"periodico",go:"settings",price:150},
    {id:"th_arcade",kind:"theme",key:"arcade",go:"settings",price:150}
  ];
  const item=id=>ITEMS.find(i=>i.id===id)||null;

  // ---- código VIP: todo desbloqueado y sin anuncios. Solo se guarda su huella SHA-256 ----
  const VIP_HASH="7874ca0c8e5087b59010a7bb75a1295867c9a3ab2454c4676930b7321d9d489b";
  function sha256(str){
    const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const b=Array.from(new TextEncoder().encode(str)),l=b.length*8;b.push(0x80);while(b.length%64!==56)b.push(0);
    for(let i=7;i>=0;i--)b.push(i>3?0:(l>>>(i*8))&255);
    let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const r=(x,n)=>(x>>>n)|(x<<(32-n));
    for(let o=0;o<b.length;o+=64){
      const w=new Array(64);for(let i=0;i<16;i++)w[i]=(b[o+i*4]<<24)|(b[o+i*4+1]<<16)|(b[o+i*4+2]<<8)|b[o+i*4+3];
      for(let i=16;i<64;i++){const s0=r(w[i-15],7)^r(w[i-15],18)^(w[i-15]>>>3),s1=r(w[i-2],17)^r(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0}
      let [a,bb,c,d,e,f,g,h]=H;
      for(let i=0;i<64;i++){const S1=r(e,6)^r(e,11)^r(e,25),ch=(e&f)^(~e&g),t1=(h+S1+ch+K[i]+w[i])|0,S0=r(a,2)^r(a,13)^r(a,22),mj=(a&bb)^(a&c)^(bb&c),t2=(S0+mj)|0;
        h=g;g=f;f=e;e=(d+t1)|0;d=c;c=bb;bb=a;a=(t1+t2)|0}
      H=[a,bb,c,d,e,f,g,h].map((x,i)=>(x+H[i])|0);
    }
    return H.map(x=>(x>>>0).toString(16).padStart(8,"0")).join("");
  }
  const vipNorm=c=>String(c||"").toUpperCase().normalize("NFD").replace(/[^A-Z0-9]/g,"");
  const isVipCode=c=>sha256(vipNorm(c))===VIP_HASH;
  function redeem(W,code){if(!isVipCode(code))return false;W.vip=true;return true}

  // ---- fechas (clave local AAAA-MM-DD) ----
  const pad=n=>(n<10?"0":"")+n;
  function dayKey(d){d=d||new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
  function prevKey(k){const p=k.split("-").map(Number);const d=new Date(Date.UTC(p[0],p[1]-1,p[2]-1));return d.getUTCFullYear()+"-"+pad(d.getUTCMonth()+1)+"-"+pad(d.getUTCDate())}

  // ---- monedero ----
  // raw: lo guardado (o nada). Pone valores por defecto y reinicia los contadores del día.
  function load(raw,today){
    const W=Object.assign({coins:CFG.START,owned:{},day:"",ads:0,plays:0,starts:0,run:0,last:""},raw||{});
    if(!W.owned||typeof W.owned!=="object")W.owned={};
    if(typeof W.coins!=="number"||!(W.coins>=0))W.coins=0;
    // temas renombrados en la v5.5 (lo comprado se conserva)
    if(W.owned.th_verbena){W.owned.th_periodico=1;delete W.owned.th_verbena}
    if(W.owned.th_bloques){W.owned.th_arcade=1;delete W.owned.th_bloques}
    roll(W,today);
    return W;
  }
  function roll(W,today){if(W.day!==today){W.day=today;W.ads=0;W.plays=0}return W}
  const owns=(W,id)=>!!W.vip||!!W.owned[id];

  // ---- racha diaria ----
  // devuelve {claimable, run (días seguidos contando hoy si se recoge), idx (0-6 del premio de hoy), reward}
  function streak(W,today){
    let run;
    if(W.last===today)run=W.run;
    else if(W.last&&W.last===prevKey(today))run=W.run+1;
    else run=1;
    const idx=(run-1)%CFG.STREAK.length;
    return {claimable:W.last!==today,run,idx,reward:CFG.STREAK[idx]};
  }
  function claim(W,today){
    const s=streak(W,today);if(!s.claimable)return 0;
    W.run=s.run;W.last=today;W.coins+=s.reward;return s.reward;
  }

  // ---- ganar monedas ----
  const adsLeft=W=>W.vip?0:Math.max(0,CFG.AD_DAY-W.ads);
  function rewardAd(W){if(adsLeft(W)<=0)return 0;W.ads++;W.coins+=CFG.AD_COINS;return CFG.AD_COINS}

  // ---- compras ----
  function buy(W,id){
    const it=item(id);
    if(!it)return {ok:false,err:"unknown"};
    if(owns(W,id))return {ok:false,err:"owned"};
    if(W.coins<it.price)return {ok:false,err:"coins",missing:it.price-W.coins};
    W.coins-=it.price;W.owned[id]=1;return {ok:true,item:it};
  }

  // ---- qué está bloqueado ----
  const AV_ITEM={};ITEMS.forEach(i=>{if(i.kind==="avatars")i.ids.forEach(a=>{AV_ITEM[a]=i.id})});
  // un avatar que no es de Profesiones y cuyo pack no tienes
  function avLocked(W,id){if(W.vip||FREE_AV.indexOf(id)>=0)return false;const it=AV_ITEM[id];return it?!owns(W,it):true}
  function avItem(id){return AV_ITEM[id]?item(AV_ITEM[id]):null}
  // cartas que se pueden usar de un mazo: Infinity si no está limitado o tienes el pack
  function deckLimit(W,obj,key){
    for(const it of ITEMS){if(it.kind!=="cards")continue;
      for(const d of it.decks)if(d[0]===obj&&d[1]===key)return owns(W,it.id)?Infinity:d[2]}
    return Infinity;
  }
  // categorías de un juego: bloqueada si hay artículo para ella y no lo tienes
  function catItem(game,key){return ITEMS.find(it=>it.kind==="cat"&&it.game===game&&it.key===key)||null}
  function catLocked(W,game,key){const it=catItem(game,key);return !!it&&!owns(W,it.id)}
  function deckItem(obj,key){return ITEMS.find(it=>it.kind==="cards"&&it.decks.some(d=>d[0]===obj&&d[1]===key))||null}

  function themeItem(key){return ITEMS.find(it=>it.kind==="theme"&&it.key===key)||null}
  function themeLocked(W,key){const it=themeItem(key);return !!it&&!owns(W,it.id)}
  const E={themeItem,themeLocked,sha256,isVipCode,redeem,CFG,FREE_AV,ITEMS,item,dayKey,prevKey,load,roll,owns,streak,claim,adsLeft,rewardAd,buy,avLocked,avItem,deckLimit,deckItem,catItem,catLocked};
  if(typeof module!=="undefined"&&module.exports)module.exports=E;
  root.Economy=E;
})(typeof window!=="undefined"?window:globalThis);
