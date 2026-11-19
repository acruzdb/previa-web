// =====================================================================
// ¡ÚLTIMA! (cartas de colores): la mesa. La usan la app (anfitrión o un solo móvil)
// y los móviles invitados (remote.html). Solo pinta: las reglas las aplica el anfitrión.
// =====================================================================
window.Uno=(function(){
  const COL={r:{n:_t("Rojo"),c:"#e5383b"},y:{n:_t("Amarillo"),c:"#f4b400"},g:{n:_t("Verde"),c:"#1f9d55"},b:{n:_t("Azul"),c:"#1e6fd9"}};
  const SYM={skip:"⊘",rev:"⇄","+2":"+2",wild:"★","+4":"+4"};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const av=(p,cls)=>'<img class="av '+(cls||"")+'" alt="" src="'+avatarURL(p.av)+'" style="border-color:'+p.color+'">';
  function card(k,extra){
    const l=SYM[k.v]||k.v;
    return '<span class="uc '+k.c+(extra?" "+extra:"")+'" data-v="'+(k.v==="wild"?"":l)+'"'+(k.id!=null?' data-id="'+k.id+'"':'')+'><i>'+l+'</i></span>';
  }
  // pub: {players:[{name,av,color,n,said}],turn,dir,top,color,pend,pendT,deckN,log,over,winner,rows}
  // me:  {name,hand:[{c,v,id,ok}],drew,canShout,shout,hidden}   ui: {pick}
  function view(pub,me,ui){
    const P=pub.players,n=P.length,mi=Math.max(0,P.findIndex(p=>p.name===me.name)),cur=P[pub.turn],myTurn=cur&&cur.name===me.name&&!pub.over;
    let h='<div class="ut'+(myTurn?" my":"")+'"><div class="ut-table">';
    // los demás, alrededor de la mesa empezando por el siguiente a mí
    const others=[];for(let k=1;k<n;k++)others.push((mi+k)%n);
    others.forEach((pi,k)=>{
      const a=Math.PI-(k+1)*Math.PI/(others.length+1),x=50+42*Math.cos(a),y=46-40*Math.sin(a),p=P[pi];
      h+='<div class="ut-seat'+(pi===pub.turn&&!pub.over?" on":"")+(p.n===1?" last":"")+(pub.over&&pub.winner===p.name?" win":"")+'" style="left:'+x.toFixed(1)+_t('%;top:')+y.toFixed(1)+'%">'+av(p)+
        '<span class="nm">'+esc(p.name)+'</span><span class="ut-cnt"><i></i>'+p.n+'</span></div>';
    });
    h+='<div class="ut-center"><button class="uno-pile" data-act="draw"'+(myTurn&&!me.hidden?"":" disabled")+('>'+'<span>'+'<b>'+_t('¡Última!')+'</b>')+pub.deckN+'</span></button>'+
      card(pub.top,"top")+'<div class="uno-col"><span class="uno-dot" style="background:'+COL[pub.color].c+'"></span>'+COL[pub.color].n+'<span class="uno-dir">'+(pub.dir>0?"↻":"↺")+'</span></div></div>';
    if(pub.pend>0)h+='<div class="ut-pend">+'+pub.pend+' 🍻</div>';
    h+='<div class="ut-log">'+esc(pub.log||"")+'</div></div>';
    // estado
    if(pub.over){
      h+=('<div class="ut-end">'+'<b>'+_t('🏆 Gana '))+esc(pub.winner)+'</b>'+(pub.rows||[]).map(r=>'<div style="border-left:5px solid '+r.c+'"><span>'+esc(r.n)+' · '+esc(r.val)+'</span><span>'+esc(r.drink)+'</span></div>').join("")+(pub.note?'<small>'+esc(pub.note)+'</small>':'')+'</div>';
    } else if(myTurn&&pub.pend>0&&!me.hidden){
      h+=('<div class="uno-msg warn">'+_t('¡Te han echado un '))+pub.pendT+_t('! Devuélvelo con ')+(pub.pendT==="+4"||!pub.mix?_t("otro ")+pub.pendT:_t("un +2 o un +4"))+_t(' o bebe ')+pub.pend+'.</div>';
    } else h+='<div class="ut-turn'+(myTurn?" go":"")+'">'+(myTurn?(me.hidden?"":_t("🎯 ¡Te toca!")):(_t("⏳ Le toca a ")+"<b>")+esc(cur.name)+"</b>")+'</div>';
    // mi mano
    const me0=P[mi];
    if(me.hidden&&!pub.over){
      h+='<button class="ut-cover" data-act="see">'+av(me0,"big")+('<b>'+_t('Pásale el móvil a '))+esc(me.name)+('</b>'+'<small>'+_t('👀 Toca para ver tus cartas')+'</small>'+'</button>');
    } else if(me.hand){
      const H=me.hand.slice().sort((a,b)=>"rygbw".indexOf(a.c)-"rygbw".indexOf(b.c)||String(a.v).localeCompare(String(b.v)));
      h+='<div class="ut-hand'+(H.length>8?" tight":"")+'">'+H.map(k=>card(k,pub.over||!myTurn?"":k.ok?"ok":"no").replace('<span class="uc','<span data-act="play" class="uc')).join("")+'</div>';
      if(myTurn){
        const lbl=pub.pend>0?_t("🍻 Robar y beber ")+pub.pend:me.drew?_t("⏭️ Pasar"):_t("🃏 Robar");
        const anyOk=me.hand.some(k=>k.ok);
        h+='<div class="uno-btns">'+(me.canShout?'<button class="btn shout'+(me.shout?" done":"")+'" data-act="shout">'+(me.shout?_t("✅ ¡Dicho!"):_t("📢 ¡Última!"))+'</button>':'')+
          '<button class="btn '+(pub.pend>0||!anyOk?"primary":"")+'" data-act="draw">'+lbl+'</button></div>';
      }
    }
    // carrera del «¡Última!» (solo online): la misma carta grande en todos los móviles
    if(pub.race&&!pub.over){
      const r=pub.race,mine=r.who===me.name,seen=raceSeen[r.id]||(raceSeen[r.id]={at:Date.now(),left:r.left}),left=Math.max(0,seen.left-(Date.now()-seen.at)),tapped=raceTap===r.id;
      h+='<div class="ut-race"><h3>'+(mine?_t("¡Te queda una carta!"):_t("¡A ")+esc(r.who)+_t(" le queda una!"))+'</h3>'+
        '<button class="ut-racecard'+(tapped?" tapped":"")+('" data-act="race">'+'<b>'+_t('¡Última!')+'</b>'+'<i>')+(tapped?_t("¡Tocada!"):mine?_t("Tócala antes que nadie"):_t("Tócala para cortarle"))+'</i></button>'+
        '<div class="ut-timer"><span style="--f:'+(left/4500).toFixed(3)+_t(';animation-duration:')+left+'ms"></span></div>'+
        '<p>'+(mine?_t("Si alguien la toca antes que tú, robas 7."):_t("Si la tocas antes que ")+esc(r.who)+_t(", roba 7."))+'</p></div>';
    }
    if(ui&&ui.pick!=null)h+=('<div class="ut-pick">'+'<div>'+'<b>'+_t('🎨 Elige color')+'</b>'+'<div class="uno-colors">')+Object.keys(COL).map(c=>'<button data-act="color" data-c="'+c+'" style="background:'+COL[c].c+'">'+COL[c].n+'</button>').join("")+('</div>'+'<button class="btn sm" data-act="nopick">'+_t('Cancelar')+'</button>'+'</div>'+'</div>');
    return h+'</div>';
  }
  const raceSeen={};let raceTap=null;
  function bind(root,onAct){
    root.querySelectorAll("[data-act]").forEach(b=>{
      const go=e=>{e.stopPropagation();if(e.type==="pointerdown")e.preventDefault();if(b.disabled)return;
        if(b.dataset.act==="race"){const r=root.querySelector(".ut-race");if(raceTap&&r&&b.classList.contains("tapped"))return;raceTap=Object.keys(raceSeen).pop();b.classList.add("tapped");b.querySelector("i").textContent=_t("¡Tocada!")}
        onAct(b.dataset.act,b.dataset.id!=null?+b.dataset.id:b.dataset.c||null)};
      // la carta de la carrera responde al primer toque (sin esperar al «clic»)
      if(b.dataset.act==="race")b.onpointerdown=go;else b.onclick=go;
    });
  }
  let lastFlash=null;
  function flash(f){
    if(!f||f.id===lastFlash)return;const first=lastFlash===null;lastFlash=f.id;
    if(first&&f.t&&Date.now()-f.t>6000)return;
    const old=document.querySelector(".pv-flash");if(old)old.remove();
    const d=document.createElement("div");d.className="pv-flash uno "+(f.kind||"");
    d.innerHTML='<div class="pv-flash-card">'+(f.em?'<div class="em">'+f.em+'</div>':'')+f.lines.map(l=>'<p>'+esc(l)+'</p>').join("")+'</div>';
    d.onclick=()=>d.remove();document.body.appendChild(d);
    setTimeout(()=>{d.classList.add("out");setTimeout(()=>d.remove(),400)},2600);
  }
  return {COL,SYM,card,view,bind,flash};
})();
