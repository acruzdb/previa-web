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
    const P=$(".nt-panel");$(".nt-stage").hidden=st.phase==="end";R.querySelector(".nt").classList.toggle("end",st.phase==="end");
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
