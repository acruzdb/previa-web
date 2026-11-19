// =====================================================================
// EL PUEBLO DUERME: roles y pantalla de la partida. Lo usan la app (anfitrión o un solo móvil)
// y los invitados del juego en red (remote.html).
// =====================================================================
window.Pueblo=(function(){
  const ROLES={
    asesino:{n:_t("Asesino"),em:"🔪",c1:"#9d0208",c2:"#370617",desc:_t("Cada noche, con los otros asesinos, elegís en silencio a quién matar. De día, disimula todo lo que puedas.")},
    medico:{n:_t("Médico"),em:"💊",c1:"#0077b6",c2:"#023e8a",desc:_t("Cada noche eliges a alguien para salvarle la vida. Puedes elegirte a ti.")},
    policia:{n:_t("Policía"),em:"🕵️",c1:"#3a0ca3",c2:"#240046",desc:_t("Cada noche señalas a alguien y el narrador te dice con la cabeza si es asesino.")},
    pueblo:{n:_t("Del pueblo"),em:"🧑‍🌾",c1:"#2b9348",c2:"#005f45",desc:_t("No tienes poderes: de día, descubre a los asesinos y vota con cabeza.")},
    narrador:{n:_t("Narrador"),em:"🎙️",c1:"#ff9f1c",c2:"#c2187f",desc:_t("Diriges la partida: despiertas a cada uno por la noche y vas marcando quién muere, quién se salva y a quién ejecuta el pueblo.")}
  };
  const SCRIPT={
    night:[_t("🌙 «El pueblo duerme»: todos cierran los ojos."),_t("🔪 «Asesinos, abrid los ojos y elegid una víctima.» Recuerda a quién señalan."),_t("💊 «Médico, elige a quién salvar.»"),_t("🕵️ «Policía, señala a alguien.» Asiente si es asesino o niega con la cabeza."),_t("Ve apuntando: ☠️ la víctima, 💊 a quién salva el médico y 🚔 a quién señala la policía. Nadie más lo ve."),_t("☀️ Pulsa «Amanece»: se anuncia quién ha muerto y si la policía ha pillado a un asesino.")],
    day:[_t("☀️ «El pueblo despierta»: el aviso ya ha dicho quién ha muerto esta noche."),_t("🗣️ Que debatan y voten a quién ejecutar."),_t("⚖️ Marca con ⚖️ al ejecutado: se verá si era asesino."),_t("🌙 Pulsa «Anochece» para la siguiente noche.")]
  };
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const av=(p,cls)=>'<img class="av '+(cls||"")+'" alt="" src="'+avatarURL(p.av)+'" style="border-color:'+p.color+'">';
  // cifrado sencillo para que cada móvil solo pueda leer su propio rol
  function enc(str,key){let o=[];for(let i=0;i<str.length;i++)o.push((str.charCodeAt(i)^((key.charCodeAt(i%key.length)*31+i*7)&0xffff)).toString(36));return o.join(".")}
  function dec(s,key){try{return s.split(".").map((x,i)=>String.fromCharCode(parseInt(x,36)^((key.charCodeAt(i%key.length)*31+i*7)&0xffff))).join("")}catch(e){return ""}}
  // st: estado público {phase,n,winner,narrator,players:[{name,av,color,st,role?}],msg}
  // me: {name,role,mates,isNarr,roles}  ·  ui: {open} (rol destapado)
  function view(st,me,ui){
    const P=st.players,R=me.isNarr?me.roles||{}:{};
    let h='<div class="pv">';
    h+='<div class="pv-phase '+st.phase+'">'+(st.phase==="end"?_t("🏁 Fin de la partida"):st.phase==="night"?_t("🌙 Noche ")+st.n:_t("☀️ Día ")+st.n)+('<small>'+_t('Narra '))+esc(st.narrator)+'</small></div>';
    if(st.phase==="end"){
      h+='<div class="pv-win '+st.winner+'"><div class="em">'+(st.winner==="pueblo"?"🎉":"🔪")+'</div><b>'+(st.winner==="pueblo"?_t("¡Gana el pueblo!"):_t("¡Ganan los asesinos!"))+'</b><span>'+(st.winner==="pueblo"?_t("Los asesinos beben 3 tragos cada uno."):_t("Todo el pueblo bebe 2 tragos."))+'</span></div>';
    }
    if(!me.isNarr&&me.role){
      const r=ROLES[me.role];
      h+='<button class="pv-role'+(ui&&ui.open?" open":"")+'" data-act="reveal" style="--c1:'+r.c1+';--c2:'+r.c2+'">'+(ui&&ui.open?
        '<span class="em">'+r.em+'</span><b>'+r.n+'</b><span class="d">'+r.desc+'</span>'+(me.mates&&me.mates.length?('<span class="d">'+_t('Tus compañeros: ')+'<b>')+me.mates.map(esc).join(", ")+'</b></span>':'')+('<small>'+_t('Toca para taparlo')+'</small>'):
        ('<span class="em">'+'🂠'+'</span>'+'<b>'+_t('Tu rol')+'</b>'+'<small>'+_t('Toca para verlo (que no miren)')+'</small>'))+'</button>';
    }
    if(me.isNarr&&st.phase!=="end"){
      h+='<div class="pv-script"><b>'+(st.phase==="night"?_t("Guion de la noche"):_t("Guion del día"))+'</b><ol>'+SCRIPT[st.phase].filter(x=>!(me.cfg&&((!me.cfg.med&&x.indexOf(_t("💊 «Médico"))===0)||(!me.cfg.pol&&x.indexOf(_t("🕵️ «Policía"))===0)))).map(x=>'<li>'+x+'</li>').join("")+(me.cfg&&st.phase==="night"&&(!me.cfg.med||!me.cfg.pol)?'<li class="pv-gone">'+[!me.cfg.med?_t("💊 El médico ya no está"):"",!me.cfg.pol?_t("🕵️ La policía ya no está"):""].filter(Boolean).join(" · ")+(_t(': esta noche no se despierta.')+'</li>'):"")+'</ol>'+
        '<button class="btn primary sm" data-act="phase">'+(st.phase==="night"?_t("☀️ Amanece"):_t("🌙 Anochece"))+'</button></div>';
    }
    if(st.msg&&st.phase==="end")h+='<div class="pv-msg">'+esc(st.msg)+'</div>';
    h+='<div class="pv-list">';
    P.forEach(p=>{
      const role=p.role||R[p.name],out=p.st!=="alive",rv=p.role||(st.phase==="end"&&role),M=me.marks||{},cfg=me.cfg||{med:true,pol:true};
      h+='<div class="pv-p '+p.st+(p.name===me.name?" me":"")+'">'+av(p)+'<span class="nm">'+esc(p.name)+(p.name===me.name?_t(" (tú)"):"")+'</span>'+
        (me.isNarr&&role?'<span class="pv-r" title="'+ROLES[role].n+'">'+ROLES[role].em+'</span>':rv?'<span class="pv-r">'+ROLES[rv].em+'</span>':'')+
        '<span class="pv-st">'+(p.st==="dead"?"💀":p.st==="exiled"?"⚖️":p.st==="jailed"?"🚔":"")+'</span>';
      if(me.isNarr&&st.phase!=="end"&&!out){
        // cada marca nocturna es para una sola persona: si ya está puesta en otra, aquí se desactiva
        const mk=(act,slot,em,lbl)=>{const taken=slot&&M[slot]&&M[slot]!==p.name;
          return '<button data-act="'+act+'" data-n="'+esc(p.name)+'" aria-label="'+lbl+'" class="'+(M[slot]===p.name?"on "+act:"")+'"'+(taken?" disabled":"")+'>'+em+'</button>'};
        h+='<span class="pv-acts">'+(st.phase==="night"?mk("dead","kill","☠️",_t("Víctima"))+(cfg.med?mk("save","save","💊",_t("Salva el médico")):"")+(cfg.pol?mk("cop","cop","🚔",_t("Señala la policía")):""):mk("exiled","","⚖️",_t("Ejecutar")))+'</span>';
      }
      h+='</div>';
    });
    h+='</div>';
    if(me.isNarr&&st.phase!=="end")h+='<p class="pv-help">'+(st.phase==="night"?_t("☠️ víctima · 💊 salva el médico · 🚔 señala la policía. Toca otra vez para quitarlo. Se anuncia al amanecer."):_t("⚖️ lo ejecuta el pueblo y se descubre si era asesino."))+'</p>';
    return h+'</div>';
  }
  function bind(root,onAct){root.querySelectorAll("[data-act]").forEach(b=>b.onclick=e=>{e.stopPropagation();if(b.disabled)return;
    const a=b.dataset.act,n=b.dataset.n||null;
    if(a==="exiled")return confirmVote(n,()=>onAct(a,n));
    onAct(a,n)})}
  // antes de ejecutar, confirmar la votación para no eliminar a quien no toca por un toque sin querer
  function confirmVote(name,ok){
    const old=document.querySelector(".pv-confirm");if(old)old.remove();
    const d=document.createElement("div");d.className="pv-confirm";
    d.innerHTML=('<div class="pv-confirm-card">'+'<div class="em">'+'⚖️'+'</div>'+'<b>'+_t('¿Estáis seguros de la votación?')+'</b>'+'<p>'+_t('El pueblo ejecuta a ')+'<strong>')+esc(name)+('</strong>'+_t('. Después se descubre si era asesino.')+'</p>'+'<div class="pv-confirm-btns">'+'<button class="btn" data-x="no">'+_t('No, volver')+'</button>'+'<button class="btn primary" data-x="si">'+_t('Sí, ejecutar')+'</button>'+'</div>'+'</div>');
    d.onclick=e=>{const x=e.target.closest("[data-x]");if(e.target===d||x&&x.dataset.x==="no")d.remove();else if(x&&x.dataset.x==="si"){d.remove();ok()}};
    document.body.appendChild(d);
  }
  // aviso a pantalla completa que dura unos segundos (amanecer, ejecución…)
  let lastFlash=null;
  function flash(f){
    if(!f||f.id===lastFlash)return;lastFlash=f.id;
    const old=document.querySelector(".pv-flash");if(old)old.remove();
    const d=document.createElement("div");d.className="pv-flash "+(f.kind||"");
    d.innerHTML='<div class="pv-flash-card">'+(f.kind==="dawn"?('<div class="em">'+'☀️'+'</div>'+'<b>'+_t('Amanece')+'</b>'):f.kind==="night"?'<div class="em">🌙</div>':'')+f.lines.map(l=>'<p>'+esc(l)+'</p>').join("")+'</div>';
    d.onclick=()=>d.remove();document.body.appendChild(d);
    setTimeout(()=>{d.classList.add("out");setTimeout(()=>d.remove(),400)},f.kind==="night"?1800:3200);
  }
  return {ROLES,view,bind,enc,dec,flash};
})();
