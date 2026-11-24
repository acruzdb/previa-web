// =====================================================================
// CABEZA DE RON (baraja española): la mesa. La usan la app (anfitrión o un solo móvil)
// y los móviles invitados (remote.html). Solo pinta: las reglas las aplica el anfitrión.
// =====================================================================
window.Ron=(function(){
  const SUIT={o:{n:_t("Oros"),em:"🪙",c:"#b8860b"},c:{n:_t("Copas"),em:"🏆",c:"#c1121f"},e:{n:_t("Espadas"),em:"⚔️",c:"#1d4e89"},b:{n:_t("Bastos"),em:"🌿",c:"#2b7a3e"}};
  const FIG={10:_t("Sota"),11:_t("Caballo"),12:_t("Rey")};
  // el basto dibujado: un garrote de madera con nudos, como en la baraja
  const BASTO='<svg class="basto" viewBox="0 0 40 40" aria-hidden="true"><g transform="rotate(30 20 20)"><path d="M16.6 38 13.2 14C12.3 6.4 15.4 1.8 20 1.8s7.7 4.6 6.8 12.2L23.4 38c-2.2 1.4-4.6 1.4-6.8 0z" fill="#3d8b37" stroke="#1d5220" stroke-width="1.5"/><path d="M18.3 4.6c-2 2.2-2.7 5.8-2.3 10.4" fill="none" stroke="#a6d98f" stroke-width="1.6" stroke-linecap="round"/><path d="M13.6 13.6c-2.2-1-3.6-.4-4.1 1.1M26.4 19.4c2.1-.8 3.6-.2 4.1 1.2M14.5 24.5c-1.8-.6-2.9-.1-3.2 1" fill="none" stroke="#1d5220" stroke-width="2" stroke-linecap="round"/><ellipse cx="17.6" cy="16" rx="1.6" ry="2.1" fill="#1d5220"/><ellipse cx="22.6" cy="23" rx="1.5" ry="2" fill="#1d5220"/><ellipse cx="18.6" cy="30" rx="1.3" ry="1.7" fill="#1d5220"/><path d="M16 34.2h8" stroke="#d4a017" stroke-width="2.8"/><path d="M16.4 36.8h7.2" stroke="#c1121f" stroke-width="1.8"/></g></svg>';
  // orden de menor a mayor: 4 5 6 7 8 9 10 11 12 2 1 3
  const ORDER=[4,5,6,7,8,9,10,11,12,2,1,3];
  const SPECIAL={8:_t("Salta al siguiente"),10:_t("Cierra el montón"),11:_t("Cambia el sentido"),2:_t("Reinicia"),1:_t("Comodín: responde o te lo comes"),3:_t("Comodín máximo")};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const av=(p,cls)=>'<img class="av '+(cls||"")+'" alt="" src="'+avatarURL(p.av)+'" style="border-color:'+p.color+'">';
  function card(k,extra,act){
    const S=SUIT[k.s];
    return '<span class="rc '+k.s+(extra?" "+extra:"")+'"'+(act?' data-act="'+act+'"':'')+(k.id!=null?' data-id="'+k.id+'"':'')+' style="--sc:'+S.c+'">'+
      '<b class="rn">'+k.n+'</b><span class="rs">'+(k.s==="b"?BASTO:S.em)+'</span>'+(FIG[k.n]?'<small class="rf">'+FIG[k.n]+'</small>':'')+'<b class="rn2">'+k.n+'</b></span>';
  }
  const back=extra=>'<span class="rc back'+(extra?" "+extra:"")+'"><span class="rbk">'+(window.__na?'🃏':'🥃')+'</span></span>';
  // pub: {players:[{name,av,color,n,up:[cards],down,out}],turn,dir,pile:[top cards],pileN,deckN,discN,attack,log,over,loser,rank,rows,note}
  // me:  {name,hand:[{n,s,id,ok}],up,down,stage,more,four:[n],mustEat,canEat,hidden,needFlip}   ui: {sel:[ids]}
  function view(pub,me,ui){
    const P=pub.players,n=P.length,mi=Math.max(0,P.findIndex(p=>p.name===me.name)),cur=P[pub.turn],myTurn=!pub.over&&cur&&cur.name===me.name;
    let h='<div class="ut rt'+(myTurn?" my":"")+'"><div class="ut-table rt-table">';
    const others=[];for(let k=1;k<n;k++)others.push((mi+k)%n);
    others.forEach((pi,k)=>{
      const a=Math.PI-(k+1)*Math.PI/(others.length+1),x=50+42*Math.cos(a),y=50-34*Math.sin(a),p=P[pi];
      h+='<div class="ut-seat rt-seat'+(pi===pub.turn&&!pub.over?" on":"")+(p.out?" done":"")+(pub.loser===p.name?" lose":"")+'" style="left:'+x.toFixed(1)+_t('%;top:')+y.toFixed(1)+'%">'+av(p)+
        '<span class="nm">'+esc(p.name)+'</span>'+(p.out?'<span class="ut-cnt">🏁 '+p.out+'º</span>':'<span class="ut-cnt"><i></i>'+p.n+'</span>')+
        (p.out?'':'<span class="rt-mini">'+p.up.map(c=>'<em style="--sc:'+SUIT[c.s].c+'">'+c.n+'</em>').join("")+(p.down?'<em class="bk">'+p.down+'</em>':'')+'</span>')+'</div>';
    });
    // centro: robar, montón y descartes
    const pile=pub.pile||[];
    h+='<div class="ut-center rt-center"><div class="rt-deck"><span class="rc back"><span class="rbk">'+(window.__na?'🃏':'🥃')+'</span></span><small>'+pub.deckN+'</small></div>'+
      '<div class="rt-pile">'+(pile.length?pile.map((c,i)=>card(c,"p"+(pile.length-1-i))).join(""):('<span class="rc empty">'+_t('vacío')+'</span>'))+'</div>'+
      ('<div class="rt-info">'+'<span>'+_t('Montón '))+(pub.pileN||0)+('</span>'+'<span>'+_t('Fuera '))+(pub.discN||0)+'</span><span class="uno-dir">'+(pub.dir>0?"↻":"↺")+'</span></div></div>';
    if(pub.attack)h+='<div class="ut-pend rt-att">'+(pub.attack===3?_t("⚠️ Solo vale un 3"):_t("⚠️ Responde con un 1 o un 3"))+'</div>';
    h+='<div class="ut-log">'+esc(pub.log||"")+'</div></div>';
    // estado
    if(pub.over){
      h+=('<div class="ut-end">'+'<b>'+_t('🥃 Cabeza de ron: '))+esc(pub.loser||"")+'</b>'+(pub.rows||[]).map(r=>'<div style="border-left:5px solid '+r.c+'"><span>'+esc(r.n)+' · '+esc(r.val)+'</span><span>'+esc(r.drink)+'</span></div>').join("")+(pub.note?'<small>'+esc(pub.note)+'</small>':'')+'</div>';
    } else if(myTurn&&!me.hidden){
      h+='<div class="ut-turn go">'+(me.needFlip&&me.stage==="more"?_t("🔁 Destapa la siguiente: si es ")+[].concat(me.more).join(_t(" o "))+_t(", la echas. O termina el turno"):me.needFlip?_t("👇 Te has quedado sin cartas: destapa una de la mesa"):me.stage==="more"?_t("🔁 Puedes echar otro ")+[].concat(me.more).join(_t(" o un "))+_t(" o terminar"):pub.attack?"⚠️ "+(pub.attack===3?_t("Te han echado un 3"):_t("Te han echado un 1"))+_t(": responde o cómete el montón"):me.mustEat?_t("😬 No puedes echar nada: te toca comerte el montón"):_t("🎯 ¡Te toca! Elige cartas del mismo número"))+'</div>';
    } else if(!myTurn) h+=('<div class="ut-turn">'+_t('⏳ Le toca a ')+'<b>')+esc(cur.name)+'</b></div>';
    // mi zona
    const me0=P[mi];
    if(me.hidden&&!pub.over){
      h+='<button class="ut-cover" data-act="see">'+av(me0,"big")+('<b>'+_t('Pásale el móvil a '))+esc(me.name)+('</b>'+'<small>'+_t('👀 Toca para ver tus cartas')+'</small>'+'</button>');
    } else if(me.hand){
      // mis cartas de la mesa (3 boca abajo con 3 boca arriba encima)
      const up=me.up||[],dn=me.down||0;
      if(!me0.out)h+='<div class="rt-mine'+(me.needFlip?" flip":"")+'"><small>'+(me.needFlip?_t("👇 Elige qué carta boca abajo destapas"):_t("Tu mesa"))+'</small><div class="rt-slots">'+[0,1,2].map(i=>'<span class="rt-slot"'+(me.needFlip&&i<dn?' data-act="flip" data-c="'+i+'"':'')+'>'+(i<dn?back("sm"+(me.needFlip?" pickme":"")):'<span class="rc ghost sm"></span>')+(up[i]?card(up[i],"sm up"):'')+'</span>').join("")+'</div>'+
        (me.deckLeft?('<small class="rt-lock">'+_t('🔒 No se tocan hasta que se acabe el montón de robar')+'</small>'):up.length?('<small class="rt-lock">'+_t('Al echar cartas, robas de aquí')+'</small>'):dn?('<small class="rt-lock">'+_t('Cuando te quedes sin cartas, destapas una')+'</small>'):'')+'</div>';
      const sel=new Set((ui&&ui.sel)||[]);
      const H=me.hand.slice().sort((a,b)=>ORDER.indexOf(a.n)-ORDER.indexOf(b.n)||a.s.localeCompare(b.s));
      h+='<div class="ut-hand rt-hand'+(H.length>9?" tight":"")+'">'+H.map(k=>card(k,(sel.has(k.id)?"sel ":"")+(pub.over||!myTurn?"":k.ok?"ok":"no"),"pick")).join("")+(!H.length&&!me0.out?('<p class="rt-empty">'+_t('Sin cartas en la mano')+'</p>'):'')+'</div>';
      if(myTurn){
        const nSel=sel.size;
        h+='<div class="uno-btns rt-btns">';

        if(nSel)h+=('<button class="btn primary" data-act="play">'+_t('Echar '))+nSel+(nSel>1?_t(" cartas"):_t(" carta"))+'</button>';
        if(me.stage==="more")h+=('<button class="btn" data-act="end">'+_t('⏭️ Terminar turno')+'</button>');
        else if(me.canEat&&!me.needFlip)h+='<button class="btn'+(me.mustEat?" primary":"")+('" data-act="eat">'+(window.__na?_t('🃏 Comerme el montón'):_t('🍻 Comerme el montón'))+'</button>');
        if(me.four&&me.four.length&&me.stage!=="more")h+='<button class="btn ghost" data-act="four" data-c="'+me.four[0]+('">'+_t('🗑️ Descartar cuatro '))+me.four[0]+'</button>';
        h+='</div>';
      }
    }
    return h+'</div>';
  }
  function bind(root,onAct){
    root.querySelectorAll("[data-act]").forEach(b=>b.onclick=e=>{e.stopPropagation();if(b.disabled)return;onAct(b.dataset.act,b.dataset.id!=null?+b.dataset.id:b.dataset.c!=null?+b.dataset.c:null)});
  }
  // selección: solo cartas del mismo número que se puedan echar
  function toggleSel(ui,me,id){
    const k=(me.hand||[]).find(x=>x.id===id);if(!k||!k.ok)return false;
    let sel=(ui.sel||[]).slice();const first=sel.length&&(me.hand.find(x=>x.id===sel[0])||{}).n;
    if(first&&first!==k.n)sel=[];
    const i=sel.indexOf(id);if(i>=0)sel.splice(i,1);else sel.push(id);
    ui.sel=sel;return true;
  }
  return {SUIT,ORDER,SPECIAL,card,view,bind,toggleSel,flash:(f)=>Uno.flash(f)};
})();
