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
    {id:"av_fantasia",kind:"avatars",cat:1,price:200,ids:["princesa","rey","mago","superheroe","vampiro","vampiro_m","zombi","ninja","sirena","elfo"]},
    {id:"av_animales",kind:"avatars",cat:4,price:250,ids:["a_gato","a_perro","a_panda","a_zorro","a_conejo","a_oso","a_pinguino","a_rana","a_unicornio","a_leon","a_koala","a_tigre","a_pollito","a_dino"]},
    {id:"av_aventura",kind:"avatars",cat:2,price:120,ids:["pirata","pirata_m","vikingo","vikingo_m","vaquero"]},
    {id:"av_ocio",kind:"avatars",cat:3,price:150,ids:["rockera","dj","payaso","futbolista","surfera","gamer"]},
    {id:"cp_fiesta",kind:"cards",go:"yn-setup",price:100,decks:[["YONUNCA","fiesta",0]]},
    {id:"cp_salseo",kind:"cards",go:"yn-setup",price:100,decks:[["YONUNCA","salseo",0]]},
    {id:"cp_tablero",kind:"cards",go:"board-setup",price:200,decks:[["BOARD","yonunca",40],["BOARD","bebe",40],["BOARD","reto",40],["BOARD","verdad",40],["BOARD","votacion",40],["BOARD","evento",40]]},
    {id:"cp_botella",kind:"cards",go:"bottle-setup",price:120,decks:[["BOTELLA","verdad",40],["BOTELLA","reto",40]]}
  ];
  const item=id=>ITEMS.find(i=>i.id===id)||null;

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
    roll(W,today);
    return W;
  }
  function roll(W,today){if(W.day!==today){W.day=today;W.ads=0;W.plays=0}return W}
  const owns=(W,id)=>!!W.owned[id];

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
  const adsLeft=W=>Math.max(0,CFG.AD_DAY-W.ads);
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
  function avLocked(W,id){if(FREE_AV.indexOf(id)>=0)return false;const it=AV_ITEM[id];return it?!owns(W,it):true}
  function avItem(id){return AV_ITEM[id]?item(AV_ITEM[id]):null}
  // cartas que se pueden usar de un mazo: Infinity si no está limitado o tienes el pack
  function deckLimit(W,obj,key){
    for(const it of ITEMS){if(it.kind!=="cards")continue;
      for(const d of it.decks)if(d[0]===obj&&d[1]===key)return owns(W,it.id)?Infinity:d[2]}
    return Infinity;
  }
  function deckItem(obj,key){return ITEMS.find(it=>it.kind==="cards"&&it.decks.some(d=>d[0]===obj&&d[1]===key))||null}

  const E={CFG,FREE_AV,ITEMS,item,dayKey,prevKey,load,roll,owns,streak,claim,adsLeft,rewardAd,buy,avLocked,avItem,deckLimit,deckItem};
  if(typeof module!=="undefined"&&module.exports)module.exports=E;
  root.Economy=E;
})(typeof window!=="undefined"?window:globalThis);
