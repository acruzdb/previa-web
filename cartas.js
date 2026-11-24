// =====================================================================
// JUEGOS DE CARTAS: Culo (baraja española), Blackjack y Póker (baraja americana).
// Solo pintan la mesa y evalúan manos de póker; las reglas las aplica el anfitrión (app.js).
// Los usan la app (anfitrión o un solo móvil) y los móviles invitados (remote.html).
// =====================================================================
window.Cartas=(function(){
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const av=(p,cls)=>'<img class="av '+(cls||"")+'" alt="" src="'+avatarURL(p.av)+'" style="border-color:'+p.color+'">';
  const back=extra=>'<span class="rc back'+(extra?" "+extra:"")+'"><span class="rbk">'+(window.__na?'🃏':'🥃')+'</span></span>';
  // ---------- baraja americana ----------
  const FS={s:{em:"♠",c:"#1a1a2e"},h:{em:"♥",c:"#d00000"},d:{em:"♦",c:"#d00000"},c:{em:"♣",c:"#1a1a2e"}};
  const RL={11:"J",12:"Q",13:"K",14:"A"};
  const rl=r=>RL[r]||String(r);
  function fr(k,extra,act){
    if(!k)return back(extra);
    const S=FS[k.s];
    return '<span class="rc fr '+k.s+(extra?" "+extra:"")+'"'+(act?' data-act="'+act+'"':'')+(k.id!=null?' data-id="'+k.id+'"':'')+' style="--sc:'+S.c+'">'+
      '<b class="rn">'+rl(k.r)+'<i>'+S.em+'</i></b><span class="rs">'+S.em+'</span><b class="rn2">'+rl(k.r)+'<i>'+S.em+'</i></b></span>';
  }
  // ---------- mesa con asientos (como Cabeza de ron) ----------
  function seats(P,mi,turn,over,extra){
    const n=P.length,others=[];for(let k=1;k<n;k++)others.push((mi+k)%n);
    let h="";
    others.forEach((pi,k)=>{
      const a=Math.PI-(k+1)*Math.PI/(others.length+1),x=50+42*Math.cos(a),y=50-34*Math.sin(a),p=P[pi];
      h+='<div class="ut-seat rt-seat'+(pi===turn&&!over?" on":"")+(p.out||p.folded?" done":"")+'" style="left:'+x.toFixed(1)+_t('%;top:')+y.toFixed(1)+'%">'+av(p)+'<span class="nm">'+esc(p.name)+'</span>'+(extra?extra(p,pi):"")+'</div>';
    });
    return h;
  }
  const ROLE={pres:_t("👑 Presidente"),vice:_t("🎩 Vicepresidente"),neutro:_t("🙂 Pueblo"),viceculo:_t("😬 Viceculo"),culo:_t("🍑 Culo")};
  // ================= CULO =================
  // orden de menor a mayor: 2 3 4 5 6 7 sota caballo rey as
  const CU_ORDER=[2,3,4,5,6,7,10,11,12,1];
  function culoView(pub,me,ui){
    const P=pub.players,mi=Math.max(0,P.findIndex(p=>p.name===me.name)),cur=P[pub.turn],myTurn=pub.stage==="play"&&cur&&cur.name===me.name;
    let h='<div class="ut rt cg'+(myTurn?" my":"")+'"><div class="ut-table rt-table">';
    h+=seats(P,mi,pub.turn,pub.stage!=="play",p=>(p.out?'<span class="ut-cnt">🏁 '+p.out+'º</span>':'<span class="ut-cnt"><i></i>'+p.n+'</span>')+(p.role?'<span class="cg-role">'+ROLE[p.role].split(" ")[0]+'</span>':''));
    const t=pub.trick;
    h+='<div class="ut-center cg-center">'+(t?'<div class="cg-trick">'+t.cards.map(c=>Ron.card(c)).join("")+'</div><small class="cg-by">'+esc(t.by)+'</small>':'<span class="cg-empty">'+(pub.stage==="play"?_t("Mesa limpia: sale ")+esc(cur?cur.name:""):_t("Fin de la mano"))+'</span>')+'</div>';
    h+='<div class="ut-log">'+esc(pub.log||"")+'</div></div>';
    if(pub.stage!=="play"){
      h+=('<div class="ut-end">'+'<b>'+_t('🍑 Mano '))+pub.mano+': '+esc(pub.culo||"")+(_t(' es el culo')+'</b>')+(pub.rows||[]).map(r=>'<div style="border-left:5px solid '+r.c+'"><span>'+esc(r.n)+' · '+esc(r.val)+'</span><span>'+esc(r.drink)+'</span></div>').join("")+(pub.note?'<small>'+esc(pub.note)+'</small>':'')+(me.isHost?'':('<small>'+_t('⏳ Esperando a que el anfitrión reparta otra mano')+'</small>'))+'</div>'+
        (me.isHost?('<div class="uno-btns">'+'<button class="btn primary" data-act="next">'+_t('🃏 Siguiente mano')+'</button>'+'</div>'):'');
    } else if(myTurn&&!me.hidden){
      h+='<div class="ut-turn go">'+(t?_t("🎯 Echa ")+(t.cards.length===1?_t("una carta"):t.cards.length+_t(" cartas iguales"))+(t.cards.length>1?_t(" más altas"):_t(" más alta"))+_t(" o pasa"):_t("🎯 Sales tú: echa 1, 2, 3 o 4 cartas iguales"))+'</div>';
    } else if(!myTurn)h+=('<div class="ut-turn">'+_t('⏳ Le toca a ')+'<b>')+esc(cur?cur.name:"")+'</b>'+(pub.passes?' · '+pub.passes+(pub.passes>1?_t(" han pasado"):_t(" ha pasado")):"")+'</div>';
    const me0=P[mi];
    if(pub.stage!=="play"){}
    else if(me.hidden){
      h+='<button class="ut-cover" data-act="see">'+av(me0,"big")+('<b>'+_t('Pásale el móvil a '))+esc(me.name)+('</b>'+'<small>'+_t('👀 Toca para ver tus cartas')+'</small>'+'</button>');
    } else if(me.hand){
      if(me.role)h+=('<p class="cg-myrole">'+_t('Eres '))+ROLE[me.role]+'</p>';
      const sel=new Set((ui&&ui.sel)||[]);
      const H=me.hand.slice().sort((a,b)=>CU_ORDER.indexOf(a.n)-CU_ORDER.indexOf(b.n)||a.s.localeCompare(b.s));
      h+='<div class="ut-hand rt-hand'+(H.length>9?" tight":"")+'">'+H.map(k=>Ron.card(k,(sel.has(k.id)?"sel ":"")+(!myTurn?"":k.ok?"ok":"no"),"pick")).join("")+(!H.length&&me0&&me0.out?('<p class="rt-empty">'+_t('🏁 Ya te has librado')+'</p>'):'')+'</div>';
      if(myTurn){
        h+='<div class="uno-btns rt-btns">';
        if(sel.size)h+=('<button class="btn primary" data-act="play">'+_t('Echar '))+sel.size+(sel.size>1?_t(" cartas"):_t(" carta"))+'</button>';
        if(me.canPass)h+='<button class="btn'+(me.mustPass?" primary":"")+('" data-act="pass">'+_t('✋ Paso')+'</button>');
        h+='</div>';
      }
    }
    return h+'</div>';
  }
  // selección: cartas del mismo número que se puedan echar
  function selSame(ui,me,id){
    const k=(me.hand||[]).find(x=>x.id===id);if(!k||!k.ok)return false;
    let sel=(ui.sel||[]).slice();const first=sel.length&&(me.hand.find(x=>x.id===sel[0])||{}).n;
    if(first&&first!==k.n)sel=[];
    const i=sel.indexOf(id);if(i>=0)sel.splice(i,1);else{sel.push(id);if(me.need&&sel.length>me.need)sel.shift()}
    ui.sel=sel;return true;
  }
  // ================= BLACKJACK =================
  function bjVal(cards){let v=0,a=0;cards.forEach(c=>{if(c.r===14){a++;v+=11}else v+=Math.min(10,c.r)});while(v>21&&a){v-=10;a--}return v}
  function bjView(pub,me,ui){
    const P=pub.players,cur=P[pub.turn],myTurn=pub.stage==="play"&&cur&&(me.local||cur.name===me.name);
    let h='<div class="ut cg bj">';
    // la banca
    h+=('<div class="bj-dealer">'+'<span class="bj-lbl">'+_t('🎩 La banca'))+(pub.dealerVal!=null?' · <b>'+pub.dealerVal+'</b>':'')+'</span><div class="bj-cards">'+(pub.dealer||[]).map(c=>c?fr(c):back()).join("")+'</div>'+
      ('<small>'+_t('La banca pide hasta 17 · Blackjack paga doble')+'</small>'+'</div>');
    h+='<div class="ut-log">'+esc(pub.log||"")+'</div>';
    h+='<div class="bj-list">'+P.map((p,i)=>{
      const on=pub.stage==="play"&&i===pub.turn,mine=p.name===me.name;
      let st=p.res?'<span class="bj-res '+p.res+'">'+esc(p.resT)+'</span>':p.st==="bust"?('<span class="bj-res lose">'+_t('💥 Se pasa')+'</span>'):p.st==="bj"?('<span class="bj-res bj">'+_t('⭐ Blackjack')+'</span>'):p.st==="stand"?('<span class="bj-res st">'+_t('✋ Se planta')+'</span>'):'';
      let bet="";
      if(pub.stage==="bet"){
        if(me.local||mine)bet='<span class="bj-bet"><button data-act="bet" data-c="'+(i*10+Math.max(1,p.bet-1))+'"'+(p.bet<=1?" disabled":"")+'>−</button><b>'+(window.__na?'🔘 ':'🥃 ')+p.bet+'</b><button data-act="bet" data-c="'+(i*10+Math.min(3,p.bet+1))+'"'+(p.bet>=3?" disabled":"")+'>+</button></span>'+(!me.local?'<button class="bj-ready'+(p.ready?" on":"")+'" data-act="ready">'+(p.ready?_t("✅ Listo"):_t("Listo"))+'</button>':"");
        else bet='<span class="bj-bet"><b>'+(window.__na?'🔘 ':'🥃 ')+p.bet+'</b>'+(p.ready?' ✅':' ⏳')+'</span>';
      } else bet='<span class="bj-bet"><b>'+(window.__na?'🔘 ':'🥃 ')+p.bet+'</b></span>';
      return '<div class="bj-p'+(on?" on":"")+(mine&&!me.local?" mine":"")+'">'+av(p,"xs")+'<div class="bj-pi"><span class="bj-n">'+esc(p.name)+(p.cards.length?' · <b>'+p.val+'</b>':'')+'</span><div class="bj-cards sm">'+p.cards.map(c=>fr(c,"sm")).join("")+'</div></div><div class="bj-side">'+bet+st+(p.drink?'<small>'+esc(p.drink)+'</small>':'')+'</div></div>';
    }).join("")+'</div>';
    if(pub.stage==="bet")h+='<div class="ut-turn">'+(window.__na?(me.local?_t("🔘 Cada uno elige cuántas fichas apuesta (1 a 3)"):_t("🔘 Elige cuántas fichas apuestas y pulsa «Listo»")):me.local?_t("🥃 Cada uno elige cuántos tragos apuesta (1 a 3)"):_t("🥃 Elige cuántos tragos apuestas y pulsa «Listo»"))+'</div>';
    if(pub.stage==="bet"&&(me.local||me.isHost))h+='<div class="uno-btns"><button class="btn primary" data-act="deal"'+(me.local||pub.allReady?"":" disabled")+(_t('>🃏 Repartir')+'</button>'+'</div>');
    if(myTurn&&!me.hidden){
      const p=cur;
      h+='<div class="ut-turn go">🎯 '+(me.local?esc(p.name)+_t(", tienes "):_t("Tienes "))+p.val+(_t(': ¿pides o te plantas?')+'</div>'+'<div class="uno-btns rt-btns">'+'<button class="btn primary" data-act="hit">'+_t('🃏 Pedir')+'</button>'+'<button class="btn" data-act="stand">'+_t('✋ Plantarse')+'</button>')+(p.cards.length===2&&p.bet<=3?('<button class="btn ghost" data-act="double">'+_t('✖️2 Doblar')+'</button>'):'')+'</div>';
    } else if(pub.stage==="play"&&cur)h+=('<div class="ut-turn">'+_t('⏳ Le toca a ')+'<b>')+esc(cur.name)+'</b></div>';
    if(pub.stage==="res"){
      h+=(me.local||me.isHost)?('<div class="uno-btns">'+'<button class="btn primary" data-act="again">'+_t('🔁 Otra ronda')+'</button>'+'</div>'):('<div class="ut-turn">'+_t('⏳ Esperando a que la banca reparta otra ronda')+'</div>');
    }
    return h+'</div>';
  }
  // ================= PÓKER =================
  const HN=[_t("Carta alta"),_t("Pareja"),_t("Doble pareja"),_t("Trío"),_t("Escalera"),_t("Color"),_t("Full"),_t("Póker"),_t("Escalera de color"),_t("Escalera real")];
  // puntuación de 5 cartas: [categoría, desempates…] (mayor gana)
  function eval5(cs){
    const r=cs.map(c=>c.r).sort((a,b)=>b-a),cnt={};r.forEach(x=>cnt[x]=(cnt[x]||0)+1);
    const fl=cs.every(c=>c.s===cs[0].s);
    const u=[...new Set(r)];let st=0;
    if(u.length===5){if(u[0]-u[4]===4)st=u[0];else if(u.join()==="14,5,4,3,2")st=5}
    const g=Object.keys(cnt).map(Number).sort((a,b)=>cnt[b]-cnt[a]||b-a),c=g.map(x=>cnt[x]);
    if(st&&fl)return [st===14?9:8,st];
    if(c[0]===4)return [7,g[0],g[1]];
    if(c[0]===3&&c[1]===2)return [6,g[0],g[1]];
    if(fl)return [5].concat(r);
    if(st)return [4,st];
    if(c[0]===3)return [3].concat(g);
    if(c[0]===2&&c[1]===2)return [2].concat(g);
    if(c[0]===2)return [1].concat(g);
    return [0].concat(r);
  }
  function cmp(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d}return 0}
  function combos(arr,k){const out=[];(function go(s,acc){if(acc.length===k){out.push(acc.slice());return}for(let i=s;i<arr.length;i++){acc.push(arr[i]);go(i+1,acc);acc.pop()}})(0,[]);return out}
  // mejor mano: Hold'em con cualquier 5 de 7; Omaha con exactamente 2 de la mano y 3 de la mesa
  function best(hole,board,omaha){
    let bestS=null,bestC=null;
    const tries=omaha?[].concat(...combos(hole,2).map(h=>combos(board,3).map(b=>h.concat(b)))):combos(hole.concat(board),5);
    tries.forEach(cs=>{const s=eval5(cs);if(!bestS||cmp(s,bestS)>0){bestS=s;bestC=cs}});
    return {score:bestS,cards:bestC,name:bestS?handName(bestS):""};
  }
  const RN={2:_t("doses"),3:_t("treses"),4:_t("cuatros"),5:_t("cincos"),6:_t("seises"),7:_t("sietes"),8:_t("ochos"),9:_t("nueves"),10:_t("dieces"),11:_t("jotas"),12:_t("reinas"),13:_t("reyes"),14:_t("ases")};
  function handName(s){
    const c=s[0];
    if(c===1)return _t("Pareja de ")+RN[s[1]];
    if(c===2)return _t("Doble pareja: ")+RN[s[1]]+_t(" y ")+RN[s[2]];
    if(c===3)return _t("Trío de ")+RN[s[1]];
    if(c===7)return _t("Póker de ")+RN[s[1]];
    if(c===6)return _t("Full: ")+RN[s[1]]+_t(" y ")+RN[s[2]];
    if(c===0)return _t("Carta alta: ")+rl(s[1]);
    return HN[c];
  }
  function pkView(pub,me,ui){
    const P=pub.players,mi=Math.max(0,P.findIndex(p=>p.name===me.name)),cur=P[pub.turn],myTurn=pub.stage==="play"&&cur&&cur.name===me.name;
    let h='<div class="ut rt cg pk'+(myTurn?" my":"")+'"><div class="ut-table rt-table pk-table">';
    h+=seats(P,mi,pub.turn,pub.stage!=="play",p=>(p.tags?'<span class="pk-tag">'+p.tags+'</span>':'')+(p.folded?('<span class="ut-cnt">'+_t('Fuera')+'</span>'):'<span class="ut-cnt pk-chip">'+(window.__na?'🔘 ':'🥃 ')+p.tot+'</span>')+(p.show?'<span class="pk-show">'+p.show.map(c=>fr(c,"xs")).join("")+'</span>':''));
    const B=pub.board||[];
    h+='<div class="ut-center pk-center"><div class="pk-board">'+[0,1,2,3,4].map(i=>B[i]?fr(B[i],"md"):'<span class="rc ghost md"></span>').join("")+('</div>'+'<small class="pk-pot">'+_t('Bote: '))+pub.pot+(pub.pot===1?_t(" trago"):_t(" tragos"))+' · '+[_t("Antes del flop"),_t("Flop"),_t("Turn"),_t("River"),_t("Enseñar")][pub.street]+'</small></div>';
    h+='<div class="ut-log">'+esc(pub.log||"")+'</div></div>';
    if(pub.stage==="show"){
      h+='<div class="ut-end"><b>'+esc(pub.winT||"")+'</b>'+(pub.rows||[]).map(r=>'<div style="border-left:5px solid '+r.c+'"><span>'+esc(r.n)+' · '+esc(r.val)+'</span><span>'+esc(r.drink)+'</span></div>').join("")+(me.isHost?'':('<small>'+_t('⏳ Esperando a que el anfitrión reparta otra mano')+'</small>'))+'</div>'+
        (me.isHost?('<div class="uno-btns">'+'<button class="btn primary" data-act="next">'+_t('🃏 Siguiente mano')+'</button>'+'</div>'):'');
    } else if(myTurn&&!me.hidden){
      h+='<div class="ut-turn go">🎯 '+(me.toCall?_t("Te toca: ")+me.toCall+(window.__na?(me.toCall>1?_t(" fichas"):_t(" ficha")):me.toCall>1?_t(" tragos"):_t(" trago"))+_t(" para seguir"):_t("Te toca: puedes pasar"))+'</div>';
    } else if(!myTurn&&cur)h+=('<div class="ut-turn">'+_t('⏳ Le toca a ')+'<b>')+esc(cur.name)+'</b></div>';
    const me0=P[mi];
    if(pub.stage!=="play"&&me.local){}
    else if(me.hidden&&pub.stage==="play"){
      h+='<button class="ut-cover" data-act="see">'+av(me0,"big")+('<b>'+_t('Pásale el móvil a '))+esc(me.name)+('</b>'+'<small>'+_t('👀 Toca para ver tus cartas')+'</small>'+'</button>');
    } else if(me.hole){
      h+='<div class="pk-mine"><div class="pk-hole">'+me.hole.map(c=>fr(c,"lg")).join("")+'</div>'+(me.best?('<small>'+_t('Llevas: ')+'<b>')+esc(me.best)+'</b></small>':'')+(me0&&me0.folded?('<small>'+_t('Te has retirado esta mano')+'</small>'):'')+'</div>';
      if(myTurn){
        h+=('<div class="uno-btns rt-btns">'+'<button class="btn" data-act="fold">'+_t('🏳️ Retirarse')+'</button>')+
          '<button class="btn primary" data-act="call">'+(me.toCall?_t("Igualar ")+me.toCall:_t("✋ Pasar"))+'</button>'+
          (me.canRaise?('<button class="btn ghost" data-act="raise">'+_t('⬆️ Subir 1')+'</button>'):'')+'</div>';
      }
    }
    return h+'</div>';
  }
  function bind(root,onAct){
    root.querySelectorAll("[data-act]").forEach(b=>b.onclick=e=>{e.stopPropagation();if(b.disabled)return;onAct(b.dataset.act,b.dataset.id!=null?+b.dataset.id:b.dataset.c!=null?+b.dataset.c:null)});
  }
  return {fr,rl,back,eval5,cmp,best,handName,bjVal,CU_ORDER,ROLE,selSame,bind,
    views:{culo:culoView,bj:bjView,pk:pkView},flash:f=>Uno.flash(f)};
})();
