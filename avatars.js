// Avatares originales estilo chibi (cabeza grande, ojos grandes con brillos). 20 personajes, 13 chicas y 7 chicos.
// Los id se mantienen de la versión anterior para que los jugadores guardados conserven su avatar.
(function(){
const O='#2b1d3a';
const Sw=w=>' stroke="'+O+'" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="round"';
const S=Sw(2.2);
const SK={c:'#ffe0cc',m:'#f6c39e',t:'#d79a6c',d:'#9a6444',g:'#b7e08a',p:'#f3eaf7'};

// --- piezas ---
function eye(cx,col,lash,left){
  let h='<ellipse cx="'+cx+'" cy="56.5" rx="6.1" ry="7.9" fill="'+O+'"/>'+
    '<ellipse cx="'+cx+'" cy="59.6" rx="4.7" ry="4.1" fill="'+col+'"/>'+
    '<circle cx="'+(cx-2)+'" cy="53.4" r="2.6" fill="#fff"/><circle cx="'+(cx+2.3)+'" cy="59.8" r="1.2" fill="#fff"/>';
  if(lash)h+=left?'<path d="M33.6 51.4q-2.6-.6-4.2-3.4"'+Sw(2)+' fill="none"/>':'<path d="M66.4 51.4q2.6-.6 4.2-3.4"'+Sw(2)+' fill="none"/>';
  return h;
}
function eyes(o){
  if(o.eyes==='none')return '';
  if(o.eyes==='x')return '<path d="M35 52l7 7M42 52l-7 7"'+S+' fill="none"/>'+eye(61,'#7bd389',false,false);
  if(o.eyes==='patch')return eye(39,o.eyeCol||'#5aa0ff',o.girl,true)+'<ellipse cx="61" cy="56" rx="7" ry="7.5" fill="'+O+'"/><path d="M22 40L76 60"'+S+' fill="none"/>';
  if(o.eyes==='happy')return '<path d="M34 57q5-6 10 0M56 57q5-6 10 0"'+Sw(2.6)+' fill="none"/>';
  const c=o.eyeCol||'#6a4cff';
  return eye(39,c,o.girl,true)+eye(61,c,o.girl,false);
}
function mouth(k){
  if(k==='fang')return '<path d="M45.5 64.5q4.5 4 9 0z" fill="#b5174d"'+Sw(1.8)+'/><path d="M47 65l1 2.4 1-2.2M51 65.2l1 2.2 1-2.4" fill="#fff"/>';
  if(k==='o')return '<ellipse cx="50" cy="66" rx="2.6" ry="3" fill="#b5174d"'+Sw(1.8)+'/>';
  if(k==='cat')return '<path d="M45 64.5q2.5 2.6 5 0q2.5 2.6 5 0"'+Sw(1.9)+' fill="none"/>';
  if(k==='none')return '';
  return '<path d="M45.5 64.2q4.5 5 9 0z" fill="#b5174d"'+Sw(1.8)+'/><path d="M47.6 66.4q2.4 1.2 4.8 0" fill="#ff8fa3"/>';
}
const BLUSH='<ellipse cx="30.5" cy="64" rx="4.6" ry="2.6" fill="#ff7c9c" opacity=".5"/><ellipse cx="69.5" cy="64" rx="4.6" ry="2.6" fill="#ff7c9c" opacity=".5"/>';
// pelo trasero
const BACK={
  long:c=>'<path d="M17 50Q11 86 22 98H78Q89 86 83 50Q80 17 50 16Q20 17 17 50z" fill="'+c+'"'+S+'/>',
  bob:c=>'<path d="M16 52Q14 78 27 82H73Q86 78 84 52Q81 16 50 16Q19 16 16 52z" fill="'+c+'"'+S+'/>',
  pony:c=>'<path d="M74 30Q96 34 92 62Q90 78 80 84Q86 64 78 46z" fill="'+c+'"'+S+'/>'+'<path d="M20 50Q20 18 50 17Q80 18 80 50z" fill="'+c+'"'+S+'/>',
  twin:c=>'<path d="M22 44Q4 50 8 74Q10 86 18 90Q14 72 24 58z" fill="'+c+'"'+S+'/><path d="M78 44Q96 50 92 74Q90 86 82 90Q86 72 76 58z" fill="'+c+'"'+S+'/>'+'<path d="M20 50Q20 18 50 17Q80 18 80 50z" fill="'+c+'"'+S+'/>',
  braids:c=>'<path d="M20 50Q20 18 50 17Q80 18 80 50z" fill="'+c+'"'+S+'/>'+[0,1].map(i=>{const x=i?80:20;return '<circle cx="'+x+'" cy="68" r="6" fill="'+c+'"'+S+'/><circle cx="'+x+'" cy="79" r="5.4" fill="'+c+'"'+S+'/><circle cx="'+x+'" cy="89" r="4.6" fill="'+c+'"'+S+'/>'}).join(''),
  bun:c=>'<circle cx="50" cy="15" r="10" fill="'+c+'"'+S+'/><path d="M20 50Q20 18 50 17Q80 18 80 50z" fill="'+c+'"'+S+'/>',
  short:c=>'<path d="M20 50Q20 17 50 16Q80 17 80 50z" fill="'+c+'"'+S+'/>'
};
// flequillos
const FRONT={
  girl:c=>'<path d="M21 56Q17 20 50 18Q83 20 79 56Q76 42 70 37Q66 44 58 35Q52 44 44 34Q36 44 30 37Q24 44 21 56z" fill="'+c+'"'+S+'/>',
  side:c=>'<path d="M21 56Q18 18 52 18Q83 20 79 52Q72 33 50 30Q38 46 25 46Q22 50 21 56z" fill="'+c+'"'+S+'/>',
  straight:c=>'<path d="M21 56Q18 18 50 18Q82 18 79 56V42H21z" fill="'+c+'"'+S+'/>',
  boy:c=>'<path d="M21 50Q20 17 50 17Q80 17 79 50Q74 37 66 35Q62 41 54 34Q48 41 40 34Q32 41 27 36Q23 42 21 50z" fill="'+c+'"'+S+'/>',
  spiky:c=>'<path d="M21 50Q16 30 24 26L22 14 34 20 38 6 48 17 58 5 64 19 76 12 76 27Q84 32 79 50Q74 37 64 36Q58 42 50 35Q42 42 36 36Q26 40 21 50z" fill="'+c+'"'+S+'/>',
  messy:c=>'<path d="M21 52Q14 30 26 22Q30 10 46 14Q58 6 70 16Q86 22 79 52Q76 40 68 34Q66 42 56 36Q50 44 42 36Q34 44 28 38Q24 44 21 52z" fill="'+c+'"'+S+'/>'
};
function build(o){
  const sk=SK[o.skin||'c'];
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'+
  '<defs><clipPath id="cp"><circle cx="50" cy="50" r="48"/></clipPath></defs>'+
  '<circle cx="50" cy="50" r="48" fill="'+o.bg+'"/>'+
  '<g clip-path="url(#cp)"><circle cx="22" cy="20" r="18" fill="#fff" opacity=".14"/><circle cx="84" cy="80" r="10" fill="#fff" opacity=".1"/>'+
    (o.cape||'')+(o.back?BACK[o.back](o.hair):'')+
    '<path d="M26 104Q27 82 50 80Q73 82 74 104z" fill="'+o.shirt+'"'+S+'/>'+(o.body||'')+
  '</g>'+
  (o.behind||'')+
  '<ellipse cx="50" cy="51" rx="29" ry="27" fill="'+sk+'"'+S+'/>'+
  (o.noBlush?'':BLUSH)+eyes(o)+mouth(o.mouth)+(o.face||'')+
  (o.front?FRONT[o.front](o.hair):'')+(o.hat||'')+(o.extra||'')+
  '</svg>';
}
const star=(x,y,r,c)=>{let p='';for(let i=0;i<10;i++){const a=Math.PI/5*i-Math.PI/2,rr=i%2?r*.45:r;p+=(i?'L':'M')+(x+rr*Math.cos(a)).toFixed(1)+' '+(y+rr*Math.sin(a)).toFixed(1)}return '<path d="'+p+'z" fill="'+c+'"/>'};
const A=[
 {id:'princesa',n:_t('Princesa'),girl:1,bg:'#ffc2e2',skin:'c',hair:'#ffd45c',back:'long',front:'girl',shirt:'#ff6fae',eyeCol:'#4aa3ff',
  hat:'<path d="M37 24l-2-12 7 6 8-9 8 9 7-6-2 12z" fill="#ffd60a"'+S+'/><circle cx="50" cy="15" r="2.3" fill="#ff4d8d"/>',
  body:'<circle cx="50" cy="88" r="3" fill="#fff4"/>'},
 {id:'bombero',n:_t('Bombera'),girl:1,bg:'#ff8a65',skin:'m',hair:'#7a3e1d',back:'pony',front:'girl',shirt:'#e9b44c',eyeCol:'#8b5a2b',
  body:'<path d="M26 92h48" stroke="#fff59d" stroke-width="5"/>',
  hat:'<path d="M20 38Q20 9 50 9Q80 9 80 38z" fill="#e63946"'+S+'/><path d="M13 39Q50 30 87 39L86 45Q50 37 14 45z" fill="#b5121b"'+S+'/><path d="M44 13h12v14l-6 4-6-4z" fill="#ffd166"'+S+'/>'},
 {id:'profesor',n:_t('Profesora'),girl:1,bg:'#9bd17a',skin:'c',hair:'#4a2c2a',back:'bun',front:'side',shirt:'#7d5ba6',eyeCol:'#6a994e',
  face:'<circle cx="39" cy="56" r="8" fill="none"'+S+'/><circle cx="61" cy="56" r="8" fill="none"'+S+'/><path d="M47 55h6"'+S+'/>',
  body:'<path d="M45 81l5 5 5-5" fill="#fff"'+S+'/><path d="M60 88h10v12H60z" fill="#e63946"'+S+'/>'},
 {id:'cientifica',n:_t('Científico'),bg:'#5ecbf2',skin:'t',hair:'#3d2b56',front:'messy',back:'short',shirt:'#fff',eyeCol:'#00b4d8',
  body:'<path d="M50 80v24M42 80l8 9 8-9" stroke="'+O+'" stroke-width="2.2" fill="none"/><path d="M62 88l4-6 4 6v8h-8z" fill="#7bed9f"'+S+'/>',
  hat:'<rect x="26" y="27" width="48" height="10" rx="5" fill="#3a86ff"'+S+'/><circle cx="39" cy="32" r="6" fill="#bde0fe"'+S+'/><circle cx="61" cy="32" r="6" fill="#bde0fe"'+S+'/>'},
 {id:'chef',n:_t('Chef'),girl:1,bg:'#ffd166',skin:'c',hair:'#e76f51',back:'bob',front:'girl',shirt:'#fff',eyeCol:'#e76f51',mouth:'cat',
  body:'<path d="M40 82l20 8M60 82l-20 8" stroke="#e63946" stroke-width="4"/><circle cx="46" cy="96" r="1.8" fill="'+O+'"/><circle cx="54" cy="96" r="1.8" fill="'+O+'"/>',
  hat:'<path d="M30 30Q18 24 24 13T42 9Q46 0 54 2T66 10Q80 8 80 20T70 30z" fill="#fff"'+S+'/><path d="M30 28h40v7H30z" fill="#fff"'+S+'/>'},
 {id:'pirata',n:_t('Pirata'),girl:1,bg:'#3a9ad9',skin:'m',hair:'#c1121f',back:'long',front:'side',shirt:'#f1faee',eyes:'patch',eyeCol:'#2a9d8f',
  body:'<path d="M26 92h48M26 100h48" stroke="#e63946" stroke-width="3.5"/>',
  hat:'<path d="M21 40Q21 13 50 13Q79 13 79 40Q50 30 21 40z" fill="#1d3557"'+S+'/>'+'<circle cx="38" cy="26" r="2.2" fill="#fff"/><circle cx="52" cy="21" r="2.2" fill="#fff"/><circle cx="64" cy="28" r="2.2" fill="#fff"/><path d="M78 34l9 5-4 7M78 34l10-3" fill="#1d3557"'+S+'/>',
  extra:'<circle cx="22" cy="68" r="3.2" fill="none" stroke="#ffd60a" stroke-width="2"/>'},
 {id:'astronauta',n:_t('Astronauta'),bg:'#1d3557',skin:'c',hair:'#6b4226',front:'boy',back:'short',shirt:'#e9ecef',eyeCol:'#4cc9f0',
  body:'<rect x="40" y="86" width="20" height="12" rx="3" fill="#457b9d"'+S+'/><circle cx="45" cy="92" r="2" fill="#e63946"/><circle cx="55" cy="92" r="2" fill="#ffd166"/>',
  behind:'<circle cx="50" cy="50" r="38" fill="#e9ecef"'+S+'/>',
  extra:'<circle cx="50" cy="50" r="34" fill="#a8dadc" opacity=".22"'+S+'/><path d="M26 34q8-14 26-16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>'+star(86,16,6,'#ffd60a')+star(12,84,4,'#fff')},
 {id:'policia',n:_t('Policía'),girl:1,bg:'#56c8e8',skin:'d',hair:'#1b1b1b',back:'bob',front:'girl',shirt:'#023e8a',eyeCol:'#8b5a2b',
  body:'<path d="M58 88l4-3 4 3v5l-4 3-4-3z" fill="#ffd166"'+S+'/>',
  hat:'<path d="M22 32Q22 10 50 10Q78 10 78 32z" fill="#03045e"'+S+'/><path d="M20 32h60q-2 9-30 9t-30-9z" fill="#0b090a"'+S+'/><path d="M45 14h10v8l-5 4-5-4z" fill="#ffd166"'+S+'/>'},
 {id:'vaquero',n:_t('Vaquera'),girl:1,bg:'#f4a261',skin:'m',hair:'#ffcf56',back:'braids',front:'girl',shirt:'#e76f51',eyeCol:'#2a9d8f',
  body:'<path d="M40 80l10 11 10-11" fill="#ffd166"'+S+'/>',
  hat:'<path d="M8 34Q50 44 92 34Q88 44 50 46Q12 44 8 34z" fill="#8b5a2b"'+S+'/><path d="M30 36Q27 12 38 11Q44 11 50 15Q56 11 62 11Q73 12 70 36z" fill="#a0692f"'+S+'/><path d="M31 31Q50 35 69 31V35Q50 39 31 35z" fill="#3d2314"/>'+star(50,26,3.4,'#ffd60a')},
 {id:'vikingo',n:_t('Vikinga'),girl:1,bg:'#a8dadc',skin:'c',hair:'#f77f00',back:'braids',front:'girl',shirt:'#6c584c',eyeCol:'#457b9d',
  body:'<path d="M26 88h48" stroke="#adb5bd" stroke-width="4"/>',
  hat:'<path d="M23 36Q23 11 50 11Q77 11 77 36z" fill="#adb5bd"'+S+'/><path d="M23 33h54v6H23z" fill="#6c757d"'+S+'/><path d="M23 28Q8 26 6 10Q16 20 26 20z" fill="#fefae0"'+S+'/><path d="M77 28Q92 26 94 10Q84 20 74 20z" fill="#fefae0"'+S+'/>'},
 {id:'mago',n:_t('Bruja'),girl:1,bg:'#8e44ad',skin:'c',hair:'#6a0dad',back:'long',front:'straight',shirt:'#2d1b4e',eyeCol:'#9bf6a0',mouth:'cat',
  hat:'<path d="M12 34Q50 26 88 34L86 40Q50 32 14 40z" fill="#2d1b4e"'+S+'/><path d="M26 34Q36 14 46 4Q58 -2 70 6Q60 8 62 20L72 34z" fill="#2d1b4e"'+S+'/><path d="M30 31Q50 27 70 31" stroke="#ff9f1c" stroke-width="3.5" fill="none"/>'+star(52,20,4,'#ffd60a')},
 {id:'ninja',n:_t('Ninja'),bg:'#ef476f',skin:'c',shirt:'#14213d',noBlush:1,mouth:'none',eyeCol:'#ff9f1c',
  behind:'<path d="M78 34Q94 30 98 40M78 38Q90 44 92 54" stroke="#e63946" stroke-width="4" fill="none" stroke-linecap="round"/>',
  face:'<path d="M21 51Q21 23 50 23Q79 23 79 51V58Q75 77 50 78Q25 77 21 58z" fill="#14213d"'+S+'/><rect x="25" y="46" width="50" height="19" rx="9" fill="#ffe0cc"'+S+'/>'+eye(39,'#ff9f1c',0,1)+eye(61,'#ff9f1c',0,0)+'<path d="M21 38h58" stroke="#e63946" stroke-width="4"/>'},
 {id:'rockera',n:_t('Rockera'),girl:1,bg:'#2b2d42',skin:'c',hair:'#ff2e88',back:'bob',front:'side',shirt:'#111',eyeCol:'#ff2e88',mouth:'o',
  body:'<path d="M42 80h16v4H42z" fill="'+O+'"/><circle cx="50" cy="88" r="2.4" fill="#adb5bd"/><path d="M30 92l6 6M64 92l6 6" stroke="#adb5bd" stroke-width="3"/>',
  hat:'<path d="M26 30h48l-3 8H58l-3-4h-10l-3 4H29z" fill="#111"'+S+'/>',extra:star(80,74,5,'#ffd60a')+'<path d="M16 26l5 0-3 6 6 0-9 10 3-8-5 0z" fill="#ffd60a"/>'},
 {id:'dj',n:'DJ',bg:'#06d6a0',skin:'t',hair:'#1b1b1b',front:'boy',back:'short',shirt:'#118ab2',eyeCol:'#ffd166',mouth:'cat',
  body:'<path d="M38 92q12-6 24 0" stroke="#ffd166" stroke-width="3" fill="none"/>',
  hat:'<path d="M23 36Q23 13 50 13Q77 13 77 36z" fill="#ef476f"'+S+'/><path d="M14 38Q14 32 26 33L27 39z" fill="#c9184a"'+S+'/>'+
   '<path d="M18 54Q16 16 50 16T82 54" stroke="#073b4c" stroke-width="4.5" fill="none"/><rect x="12" y="46" width="11" height="17" rx="5" fill="#073b4c"'+S+'/><rect x="77" y="46" width="11" height="17" rx="5" fill="#073b4c"'+S+'/>'},
 {id:'doctora',n:_t('Doctora'),girl:1,bg:'#c7f9cc',skin:'m',hair:'#5c3a21',back:'pony',front:'girl',shirt:'#2a9d8f',eyeCol:'#52b788',
  body:'<path d="M42 82q-5 12 0 16" stroke="#adb5bd" stroke-width="2.4" fill="none"/><circle cx="42" cy="99" r="2.6" fill="#adb5bd"/><path d="M56 90h8M60 86v8" stroke="#fff" stroke-width="3"/>',
  hat:'<path d="M26 28q24-10 48 0" stroke="#adb5bd" stroke-width="2.4" fill="none"/><circle cx="50" cy="22" r="6.5" fill="#e9ecef"'+S+'/><circle cx="50" cy="22" r="3.2" fill="#bde0fe"/>'},
 {id:'payaso',n:_t('Payaso'),bg:'#ffbe0b',skin:'p',shirt:'#3a86ff',eyeCol:'#3a86ff',
  body:'<circle cx="50" cy="90" r="4" fill="#ff006e"'+S+'/><circle cx="50" cy="100" r="4" fill="#06d6a0"'+S+'/>',
  face:'<circle cx="50" cy="61" r="4.6" fill="#ff0a54"'+S+'/><circle cx="48.6" cy="59.6" r="1.3" fill="#fff"/>',
  behind:'<circle cx="18" cy="38" r="11" fill="#fb5607"'+S+'/><circle cx="82" cy="38" r="11" fill="#8338ec"'+S+'/><circle cx="16" cy="54" r="9" fill="#06d6a0"'+S+'/><circle cx="84" cy="54" r="9" fill="#ff006e"'+S+'/>',
  hat:'<path d="M41 26l9-22 9 22z" fill="#06d6a0"'+S+'/><circle cx="50" cy="5" r="3.4" fill="#ff006e"'+S+'/>'},
 {id:'superheroe',n:_t('Superheroína'),girl:1,bg:'#ffd60a',skin:'c',hair:'#1b1b1b',back:'long',front:'side',shirt:'#3a0ca3',eyeCol:'#4361ee',
  cape:'<path d="M14 104l12-26h48l12 26z" fill="#e63946"'+S+'/>',
  body:'<path d="M43 89l7-6 7 6-7 8z" fill="#ffd60a"'+S+'/>',
  face:'<path d="M24 56Q24 45 37 46Q45 47 50 51Q55 47 63 46Q76 45 76 56Q74 63 63 63Q55 63 50 58Q45 63 37 63Q26 63 24 56z" fill="#e63946"'+S+'/>'+eye(39,'#4361ee',1,1)+eye(61,'#4361ee',1,0)},
 {id:'rey',n:_t('Rey'),bg:'#9d4edd',skin:'c',hair:'#7f4f24',front:'boy',back:'short',shirt:'#c1121f',eyeCol:'#7f4f24',
  cape:'<path d="M18 104Q20 80 50 78Q80 80 82 104z" fill="#fff"'+S+'/>',
  body:'<circle cx="50" cy="92" r="3" fill="#ffd60a"'+S+'/>',
  face:'<path d="M43 69q7 4 14 0" stroke="#7f4f24" stroke-width="3" fill="none" stroke-linecap="round"/>',
  hat:'<path d="M30 28l-3-17 9 8 6-12 8 10 8-10 6 12 9-8-3 17z" fill="#ffd60a"'+S+'/><path d="M30 26h40v6H30z" fill="#e63946"'+S+'/><circle cx="50" cy="17" r="2.6" fill="#06d6a0"/>'},
 {id:'zombi',n:_t('Zombi'),bg:'#6a994e',skin:'g',hair:'#3d405b',front:'messy',back:'short',shirt:'#6c757d',eyes:'x',mouth:'o',
  body:'<path d="M34 90l6 4-4 6M64 92l6-2" stroke="'+O+'" stroke-width="2"/>',
  face:'<path d="M66 68v8M63 70h6M63 74h6" stroke="'+O+'" stroke-width="1.6"/>',
  extra:'<path d="M76 30q8 2 8 10" stroke="#fff" stroke-width="0"/>'},
 {id:'vampiro',n:_t('Vampira'),girl:1,bg:'#5a189a',skin:'p',hair:'#111',back:'long',front:'straight',shirt:'#111',eyeCol:'#e63946',mouth:'fang',
  cape:'<path d="M20 104L22 76Q36 84 50 82Q64 84 78 76L80 104z" fill="#9d0208"'+S+'/>',
  body:'<path d="M45 81l5 8 5-8" fill="#fff"'+S+'/>',
  extra:'<path d="M80 18q4-6 8 0q4-6 8 0q-4 2-8 8q-4-6-8-8z" fill="#111"/>'}
];
// --- versiones masculinas para equilibrar (13 chicas / 13 chicos) ---
const male=(base,o)=>Object.assign({},A.find(x=>x.id===base),{girl:0,back:'short',front:'boy'},o);
A.push(
 male('bombero',{id:'bombero_m',n:_t('Bombero'),bg:'#ff7043',hair:'#3b2416',skin:'t',eyeCol:'#8b5a2b'}),
 male('pirata',{id:'pirata_m',n:_t('Pirata'),bg:'#2f80c0',hair:'#1b1b1b',skin:'m',extra:'',face:'<path d="M40 70q10 6 20 0" stroke="#3b2416" stroke-width="3" fill="none" stroke-dasharray="2 2.4"/>'}),
 male('policia',{id:'policia_m',n:_t('Policía'),bg:'#4fb3dd',hair:'#6b4226',skin:'c',eyeCol:'#3a86ff'}),
 male('chef',{id:'chef_m',n:_t('Chef'),bg:'#f9c74f',hair:'#2b2b2b',skin:'d',mouth:'',eyeCol:'#8b5a2b',face:'<path d="M41 69q-6-1-8 3 6 1 10-1 3 1 7 0 4 1 7 0 4 2 10 1-2-4-8-3-4-2-9 0-5-2-9 0z" fill="#2b2b2b"/>'}),
 male('vikingo',{id:'vikingo_m',n:_t('Vikingo'),bg:'#9cd0d4',hair:'#e85d04',skin:'c',face:'<path d="M26 60Q28 90 50 92Q72 90 74 60Q66 70 50 70Q34 70 26 60z" fill="#e85d04"'+S+'/><path d="M41 66q9-5 18 0" fill="#e85d04"'+S+'/>',mouth:'none'}),
 male('vampiro',{id:'vampiro_m',n:_t('Vampiro'),bg:'#4a0e7a',hair:'#111',front:'boy',extra:'<path d="M44 25l6 8 6-8" fill="#111"/>'})
);
// --- animales ---
function buildAnimal(o){
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><clipPath id="cp"><circle cx="50" cy="50" r="48"/></clipPath></defs>'+
  '<circle cx="50" cy="50" r="48" fill="'+o.bg+'"/><g clip-path="url(#cp)"><circle cx="22" cy="20" r="18" fill="#fff" opacity=".14"/>'+
  '<path d="M24 104Q25 80 50 78Q75 80 76 104z" fill="'+(o.bodyC||o.head)+'"'+S+'/>'+(o.belly||'')+'</g>'+
  (o.behind||'')+'<ellipse cx="50" cy="51" rx="'+(o.rx||29)+'" ry="'+(o.ry||27)+'" fill="'+o.head+'"'+S+'/>'+(o.face||'')+
  (o.noBlush?'':BLUSH)+eyes({eyeCol:o.eyeCol||'#6b3e26',eyes:o.eyes})+(o.snout||'')+mouth(o.mouth||'cat')+(o.extra||'')+'</svg>';
}
const nose=(c)=>'<path d="M47 62.5h6l-3 3z" fill="'+(c||'#ff6b8b')+'"'+Sw(1.6)+'/>';
const AN=[
 {id:'a_gato',n:_t('Gato'),bg:'#ffd6a5',head:'#f4a259',eyeCol:'#2ec27e',
  behind:'<path d="M24 40L22 14 44 28z" fill="#f4a259"'+S+'/><path d="M76 40L78 14 56 28z" fill="#f4a259"'+S+'/><path d="M27 34l-1-13 11 8z" fill="#ffb3c6"/><path d="M73 34l1-13-11 8z" fill="#ffb3c6"/>',
  face:'<path d="M44 26l3 8M50 24v9M56 26l-3 8" stroke="#c46a1e" stroke-width="2.6" stroke-linecap="round"/>',
  snout:nose()+'<path d="M28 63l-10-2M28 67l-10 2M72 63l10-2M72 67l10 2" stroke="'+O+'" stroke-width="1.6" stroke-linecap="round"/>'},
 {id:'a_perro',n:_t('Perro'),bg:'#bde0fe',head:'#e8c39e',eyeCol:'#6b3e26',mouth:'none',
  face:'<ellipse cx="50" cy="66" rx="13" ry="9.5" fill="#fff4e6"'+S+'/><circle cx="62" cy="40" r="7" fill="#b07d4f" opacity=".8"/>',
  snout:'<ellipse cx="50" cy="62.5" rx="4.6" ry="3.4" fill="'+O+'"/><path d="M50 66v3M45 69q5 4 10 0" stroke="'+O+'" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M48 71q2 5 4 0z" fill="#ff6b8b"/>',
  extra:'<path d="M22 34Q8 40 14 66Q22 72 26 58z" fill="#8b5a2b"'+S+'/><path d="M78 34Q92 40 86 66Q78 72 74 58z" fill="#8b5a2b"'+S+'/>'},
 {id:'a_panda',n:_t('Panda'),bg:'#c7f9cc',head:'#ffffff',bodyC:'#2b2b2b',eyeCol:'#2b2b2b',
  behind:'<circle cx="26" cy="28" r="9" fill="#2b2b2b"'+S+'/><circle cx="74" cy="28" r="9" fill="#2b2b2b"'+S+'/>',
  face:'<ellipse cx="38" cy="57" rx="9" ry="10.5" transform="rotate(-20 38 57)" fill="#2b2b2b"/><ellipse cx="62" cy="57" rx="9" ry="10.5" transform="rotate(20 62 57)" fill="#2b2b2b"/>',
  snout:'<ellipse cx="50" cy="65" rx="3.6" ry="2.6" fill="#2b2b2b"/>',noBlush:0},
 {id:'a_zorro',n:_t('Zorro'),bg:'#ffe5b4',head:'#ff8c42',eyeCol:'#6b3e26',
  behind:'<path d="M24 42L20 12 44 28z" fill="#ff8c42"'+S+'/><path d="M76 42L80 12 56 28z" fill="#ff8c42"'+S+'/><path d="M26 34l-2-14 10 9z" fill="#2b1d3a"/><path d="M74 34l2-14-10 9z" fill="#2b1d3a"/>',
  face:'<path d="M22 56Q30 78 50 78Q70 78 78 56Q68 64 58 62L50 70 42 62Q32 64 22 56z" fill="#fff"/>',
  snout:'<ellipse cx="50" cy="66" rx="3.6" ry="2.6" fill="'+O+'"/>',belly:'<path d="M40 82q10 8 20 0v22H40z" fill="#fff"/>'},
 {id:'a_conejo',n:_t('Conejo'),bg:'#ffc8dd',head:'#ffffff',eyeCol:'#e5383b',
  behind:'<ellipse cx="38" cy="16" rx="7.5" ry="20" transform="rotate(-10 38 16)" fill="#fff"'+S+'/><ellipse cx="62" cy="16" rx="7.5" ry="20" transform="rotate(10 62 16)" fill="#fff"'+S+'/><ellipse cx="38" cy="17" rx="3.4" ry="14" transform="rotate(-10 38 17)" fill="#ffb3c6"/><ellipse cx="62" cy="17" rx="3.4" ry="14" transform="rotate(10 62 17)" fill="#ffb3c6"/>',
  snout:nose()+'<path d="M47 69h6v4h-6z" fill="#fff"'+Sw(1.4)+'/>',mouth:'cat'},
 {id:'a_oso',n:_t('Oso'),bg:'#e9c46a',head:'#a0693c',eyeCol:'#2b1d3a',mouth:'none',
  behind:'<circle cx="26" cy="30" r="10" fill="#a0693c"'+S+'/><circle cx="74" cy="30" r="10" fill="#a0693c"'+S+'/><circle cx="26" cy="30" r="5" fill="#e0b080"/><circle cx="74" cy="30" r="5" fill="#e0b080"/>',
  snout:'<ellipse cx="50" cy="67" rx="11" ry="8" fill="#e0b080"'+S+'/><ellipse cx="50" cy="63.5" rx="4" ry="2.8" fill="'+O+'"/><path d="M46 69q4 3 8 0" stroke="'+O+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'},
 {id:'a_pinguino',n:_t('Pingüino'),bg:'#a2d2ff',head:'#2b2d42',bodyC:'#2b2d42',eyeCol:'#2b2d42',mouth:'none',noBlush:1,
  face:'<path d="M50 40Q40 30 30 42Q24 60 34 72Q42 78 50 78Q58 78 66 72Q76 60 70 42Q60 30 50 40z" fill="#fff"/>'+BLUSH,
  snout:'<path d="M44 63h12l-6 6z" fill="#ff9f1c"'+Sw(1.8)+'/>',belly:'<ellipse cx="50" cy="98" rx="16" ry="16" fill="#fff"/>'},
 {id:'a_rana',n:_t('Rana'),bg:'#ffe066',head:'#7bd389',eyeCol:'#2b1d3a',mouth:'none',
  behind:'<circle cx="34" cy="30" r="12" fill="#7bd389"'+S+'/><circle cx="66" cy="30" r="12" fill="#7bd389"'+S+'/>',
  eyes:'none',
  extra:'<circle cx="34" cy="29" r="7.5" fill="#fff"'+S+'/><circle cx="66" cy="29" r="7.5" fill="#fff"'+S+'/><circle cx="35" cy="30" r="4" fill="'+O+'"/><circle cx="67" cy="30" r="4" fill="'+O+'"/><circle cx="33.6" cy="28" r="1.4" fill="#fff"/><circle cx="65.6" cy="28" r="1.4" fill="#fff"/><path d="M34 64q16 12 32 0" stroke="'+O+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'},
 {id:'a_unicornio',n:_t('Unicornio'),bg:'#e0c3fc',head:'#ffffff',eyeCol:'#9b5de5',mouth:'cat',
  behind:'<path d="M70 26Q92 30 90 56Q86 70 78 74Q84 52 72 40z" fill="#ff8fab"'+S+'/><path d="M72 40Q90 44 88 66Q84 74 80 76" fill="#a0c4ff"'+S+'/>',
  extra:'<path d="M44 26L50 2 56 26z" fill="#ffd60a"'+S+'/><path d="M46 19l8-3M47 12l6-2" stroke="#e9a800" stroke-width="2"/><path d="M28 34Q36 20 52 24Q42 26 40 34Q34 30 28 34z" fill="#ff8fab"'+S+'/>'},
 {id:'a_leon',n:_t('León'),bg:'#ffd166',head:'#f6bd60',eyeCol:'#6b3e26',mouth:'none',
  behind:Array.from({length:14},(_,i)=>{const a=i/14*Math.PI*2,x=50+34*Math.cos(a),y=51+32*Math.sin(a);return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="11" fill="#c8661b"'+S+'/>'}).join('')+'<ellipse cx="50" cy="51" rx="33" ry="31" fill="#c8661b"/>',
  snout:'<ellipse cx="50" cy="67" rx="10" ry="7" fill="#fff1d6"/><path d="M46.5 62.5h7l-3.5 3.6z" fill="#7a3e1d"/><path d="M50 66v2.5M46 70q4 3 8 0" stroke="'+O+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'},
 {id:'a_koala',n:_t('Koala'),bg:'#cfe8d5',head:'#9aa5b1',eyeCol:'#2b1d3a',mouth:'none',
  behind:'<circle cx="22" cy="38" r="13" fill="#9aa5b1"'+S+'/><circle cx="78" cy="38" r="13" fill="#9aa5b1"'+S+'/><circle cx="22" cy="38" r="7" fill="#f1d3dc"/><circle cx="78" cy="38" r="7" fill="#f1d3dc"/>',
  snout:'<ellipse cx="50" cy="64" rx="6.5" ry="8" fill="#2b2d42"/><ellipse cx="48" cy="61" rx="1.8" ry="2.4" fill="#fff" opacity=".5"/><path d="M45 74q5 3 10 0" stroke="'+O+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'},
 {id:'a_tigre',n:_t('Tigre'),bg:'#ffd6a5',head:'#ff9f1c',eyeCol:'#2b1d3a',mouth:'none',
  behind:'<circle cx="27" cy="30" r="9" fill="#ff9f1c"'+S+'/><circle cx="73" cy="30" r="9" fill="#ff9f1c"'+S+'/><circle cx="27" cy="30" r="4" fill="#fff3e0"/><circle cx="73" cy="30" r="4" fill="#fff3e0"/>',
  face:'<path d="M46 26l2 8M50 25v9M54 26l-2 8M24 48l8 2M24 55l7 0M76 48l-8 2M76 55l-7 0" stroke="#2b1d3a" stroke-width="2.6" stroke-linecap="round"/>',
  snout:'<ellipse cx="50" cy="67" rx="11" ry="8" fill="#fff3e0"/><path d="M46.5 62.5h7l-3.5 3.6z" fill="#e5383b"/><path d="M50 66v2.5M46 70q4 3 8 0" stroke="'+O+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'},
 {id:'a_pollito',n:_t('Pollito'),bg:'#bde0fe',head:'#ffd60a',eyeCol:'#2b1d3a',mouth:'none',
  extra:'<path d="M46 26q2-10 6-8-1 4 2 8" fill="#ffd60a"'+S+'/>',
  snout:'<path d="M44 62h12l-6 6z" fill="#ff7a00"'+Sw(1.8)+'/>'},
 {id:'a_dino',n:_t('Dinosaurio'),bg:'#c7f9cc',head:'#52b788',eyeCol:'#2b1d3a',mouth:'',
  behind:'<path d="M30 28l4-12 7 9 6-13 6 13 7-9 4 12z" fill="#2d6a4f"'+S+'/>',
  face:'<circle cx="38" cy="38" r="2.4" fill="#40916c"/><circle cx="62" cy="36" r="3" fill="#40916c"/><circle cx="66" cy="44" r="2" fill="#40916c"/>',
  snout:'<circle cx="46" cy="62" r="1.4" fill="'+O+'"/><circle cx="54" cy="62" r="1.4" fill="'+O+'"/>'}
];
// --- más avatares (v1.7) ---
A.push(
 {id:'futbolista',n:_t('Futbolista'),bg:'#52b788',skin:'t',hair:'#2b1b12',front:'spiky',back:'short',shirt:'#e63946',eyeCol:'#6b3e26',
  body:'<text x="50" y="97" font-size="13" font-weight="900" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif">10</text>',
  extra:'<circle cx="84" cy="80" r="9" fill="#fff"'+S+'/><path d="M84 74l4 3-1.6 4.6h-4.8L80 77z" fill="'+O+'"/>'},
 {id:'surfera',n:_t('Surfera'),girl:1,bg:'#48cae4',skin:'m',hair:'#ffd166',back:'long',front:'side',shirt:'#ff9f1c',eyeCol:'#00b4d8',
  hat:'<g transform="translate(73 30)"><circle r="4.2" fill="#ff4d8d"/><circle cx="6" cy="-2" r="4.2" fill="#ff4d8d"/><circle cx="4" cy="5" r="4.2" fill="#ff4d8d"/><circle cx="-2" cy="6" r="4.2" fill="#ff4d8d"/><circle cx="-3" cy="-1" r="4.2" fill="#ff4d8d"/><circle cx="1.6" cy="2" r="2.6" fill="#ffd60a"/></g>',
  body:'<path d="M14 96q18-10 36-2t36-2" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>'},
 {id:'gamer',n:_t('Gamer'),girl:1,bg:'#3a0ca3',skin:'c',hair:'#b388ff',back:'bob',front:'girl',shirt:'#ef476f',eyeCol:'#7b2ff7',mouth:'cat',
  hat:'<path d="M18 54Q16 16 50 16T82 54" stroke="#111" stroke-width="4.5" fill="none"/><rect x="12" y="46" width="11" height="17" rx="5" fill="#111"'+S+'/><rect x="77" y="46" width="11" height="17" rx="5" fill="#111"'+S+'/><path d="M17 62q2 10 14 10" stroke="#111" stroke-width="2.4" fill="none"/><circle cx="32" cy="72" r="2.6" fill="#ef476f"/>',
  body:'<rect x="38" y="86" width="24" height="12" rx="6" fill="#2b2d42"'+S+'/><circle cx="56" cy="91" r="1.6" fill="#06d6a0"/><circle cx="59" cy="94" r="1.6" fill="#ffd60a"/><path d="M43 92h6M46 89v6" stroke="#fff" stroke-width="1.6"/>'},
 {id:'detective',n:_t('Detective'),bg:'#b08968',skin:'c',hair:'#4a2c2a',front:'boy',back:'short',shirt:'#7f5539',eyeCol:'#6b3e26',
  hat:'<path d="M22 36Q22 13 50 13Q78 13 78 36z" fill="#a68a64"'+S+'/><path d="M18 36h64v6H18z" fill="#7f5539"'+S+'/><path d="M30 22l40 0M28 29h44" stroke="#7f5539" stroke-width="1.6"/>',
  extra:'<circle cx="80" cy="76" r="8" fill="#bde0fe" fill-opacity=".6"'+S+'/><path d="M74 82l-8 9" stroke="'+O+'" stroke-width="4" stroke-linecap="round"/>',
  body:'<path d="M50 80l-8 24M50 80l8 24" stroke="#5c3d24" stroke-width="2.4"/>'},
 {id:'sirena',n:_t('Sirena'),girl:1,bg:'#00b4d8',skin:'c',hair:'#2ec4b6',back:'long',front:'girl',shirt:'#00b4d8',eyeCol:'#2ec4b6',
  body:'<circle cx="42" cy="90" r="6" fill="#ff8fab"'+S+'/><circle cx="58" cy="90" r="6" fill="#ff8fab"'+S+'/><path d="M42 85v10M38 88l8 4M58 85v10M54 88l8 4" stroke="#fff" stroke-width="1" opacity=".7"/>',
  hat:'<path d="M70 22l2 5 5 .6-3.8 3.4 1 5-4.2-2.6-4.4 2.4 1.2-4.8-3.6-3.6 5.2-.4z" fill="#ffd60a"'+Sw(1.4)+'/>',
  extra:'<circle cx="16" cy="30" r="3" fill="#fff" opacity=".6"/><circle cx="11" cy="40" r="2" fill="#fff" opacity=".6"/><circle cx="86" cy="62" r="2.5" fill="#fff" opacity=".6"/>'},
 {id:'elfo',n:_t('Elfo'),bg:'#2d6a4f',skin:'c',hair:'#ffd166',front:'boy',back:'short',shirt:'#40916c',eyeCol:'#52b788',
  behind:'<path d="M24 50L4 36 26 60z" fill="#ffe0cc"'+S+'/><path d="M76 50L96 36 74 60z" fill="#ffe0cc"'+S+'/>',
  hat:'<path d="M22 34Q30 10 52 4Q50 18 78 34z" fill="#1b4332"'+S+'/><circle cx="52" cy="5" r="3.4" fill="#ffd60a"'+S+'/>'}
);
const ORDER=['bombero','bombero_m','princesa','rey','pirata','pirata_m','policia','policia_m','chef','chef_m','vikingo','vikingo_m','vampiro','vampiro_m','profesor','cientifica','vaquero','astronauta','mago','ninja','rockera','dj','doctora','payaso','superheroe','zombi','futbolista','surfera','gamer','detective','sirena','elfo'];
A.sort((a,b)=>ORDER.indexOf(a.id)-ORDER.indexOf(b.id));
window.AVATARS=A.map(o=>({id:o.id,n:o.n,svg:build(o)})).concat(AN.map(o=>({id:o.id,n:o.n,svg:buildAnimal(o)})));
const cache={};
window.avatarURL=function(id){
  if(cache[id])return cache[id];
  const a=window.AVATARS.find(x=>x.id===id)||window.AVATARS[0];
  return cache[id]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(a.svg);
};

// categorías para el selector
window.AVATAR_CATS=[
 {n:_t("💼 Profesiones"),ids:["bombero","bombero_m","policia","policia_m","chef","chef_m","profesor","cientifica","doctora","astronauta","detective","futbolista"]},
 {n:_t("🧙 Fantasía"),ids:["princesa","rey","superheroe","ninja","sirena","elfo"]},
 {n:_t("🎉 Ocio"),ids:["rockera","dj","payaso","surfera","gamer"]},
 {n:_t("🐾 Animales"),ids:["a_gato","a_perro","a_panda","a_zorro","a_conejo","a_oso","a_pinguino","a_rana","a_unicornio","a_leon","a_koala","a_tigre","a_pollito"]}
];
// avatares temáticos apartados para futuros packs de temas (Halloween, piratas, oeste, vikingos, dinosaurios):
// no salen para elegir, pero se siguen dibujando si un jugador guardado ya los tenía
window.AVATAR_HIDDEN=["mago","vampiro","vampiro_m","zombi","pirata","pirata_m","vikingo","vikingo_m","vaquero","a_dino"];
})();
