/* Asistente VGL: 100 % en el navegador. Base de conocimiento kb.json + motor de recomendación + búsqueda en catálogo. Traspaso a WhatsApp. */
(function(){
var d=document,C=window.VGL,A=window.VGL_ADVISOR,KB=null,hist=[],mode=null,ctx={};
var fab=d.getElementById('ai-fab'),box=d.getElementById('chat');if(!fab||!box)return;
var log=box.querySelector('.chat-log'),chips=box.querySelector('.chips'),form=box.querySelector('form'),inp=form.querySelector('input');
function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9ñ\-\s\.]/g,' ').replace(/\s+/g,' ').trim()}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function add(who,html,links){var m=d.createElement('div');m.className='msg '+who;m.innerHTML=html;
 if(links&&links.length){var l=d.createElement('div');l.className='lk';links.forEach(function(k){var a=d.createElement('a');a.href=k.href;a.textContent=k.label;if(/^https?:/.test(k.href)){a.target='_blank';a.rel='noopener'}if(k.on)a.addEventListener('click',k.on);l.appendChild(a)});m.appendChild(l)}
 log.appendChild(m);log.scrollTop=log.scrollHeight;return m}
function bot(text,links,ch){var t=add('bot','<span class="typing" aria-label="Escribiendo"><i></i><i></i><i></i></span>');
 setTimeout(function(){t.remove();add('bot',Array.isArray(text)?text.map(esc).join('\n\n'):text,links);setChips(ch||(KB&&KB.chips)||[])},420)}
function setChips(a){chips.innerHTML='';a.forEach(function(c){var b=d.createElement('button');b.type='button';b.textContent=c;b.addEventListener('click',function(){send(c)});chips.appendChild(b)})}
function load(){if(KB)return Promise.resolve(KB);return fetch('/kb.json').then(function(r){return r.json()}).then(function(j){KB=j;return j})}
var catP=null;function loadCat(){if(window.VGL_MARCAS)return Promise.resolve(window.VGL_MARCAS);if(catP)return catP;catP=new Promise(function(res){var s=d.createElement('script');s.src='/js/marcas-data.js';s.onload=function(){res(window.VGL_MARCAS||[])};s.onerror=function(){res([])};d.head.appendChild(s)});return catP}
function hasKw(t,k){k=norm(k);return new RegExp('(^|[^a-z0-9])'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z0-9]|$)').test(t)}
function match(t){var best=null,bs=0;KB.intents.forEach(function(it){var s=0;it.kw.forEach(function(k){if(hasKw(t,k))s+=k.length>4?2:1});if(s>bs){bs=s;best=it}});return best}
var GR=/\b(\d{1,2}w-?\d{2}|sae ?\d{2}|aw ?\d{2,3}|iso ?vg ?\d{2,3}|agma ?\d{3}|ep ?\d{1,3}|80w-?90|85w-?140|tbn ?\d{2}|ck-?4|ci-?4|cf-?4|to-?4|dexron)\b/i;
function grade(t){var m=t.match(GR);return m?m[0]:null}
function searchCat(q){return loadCat().then(function(list){var k=norm(q).replace(/[\s-]/g,'');return list.filter(function(p){return norm(p.n+' '+p.g).replace(/[\s-]/g,'').indexOf(k)>-1}).slice(0,4)})}
function waLink(n,msg){return 'https://wa.me/'+C.phones[n].wa+'?text='+encodeURIComponent(msg)}
function summary(){var u=hist.filter(function(h){return h.w==='me'}).slice(-5).map(function(h){return '• '+h.t});return 'Hola, vengo del asistente de vanguardlubricantsgroup.com.'+(u.length?'\nMi consulta:\n'+u.join('\n'):'')}
function handoff(){var s=summary();bot(['Le paso con nuestro equipo comercial. Elija una línea; el mensaje ya incluye su consulta.','Correo: '+C.email],[{label:'WhatsApp '+C.phones[0].display,href:waLink(0,s)},{label:'WhatsApp '+C.phones[1].display,href:waLink(1,s)},{label:'Enviar correo',href:'mailto:'+C.email+'?subject='+encodeURIComponent('Consulta desde el sitio web')+'&body='+encodeURIComponent(s)}],['Recomendar lubricante','Cotizar'])}
function advisorStart(){mode='sector';ctx={};bot('Perfecto. ¿En qué sector opera su empresa?',null,A.sectors.map(function(s){return s.n}))}
function advisorStep(t){
 if(mode==='sector'){var s=A.sectors.find(function(x){return norm(x.n)===t})||A.sectors.find(function(x){return t.indexOf(norm(x.n).split(' ')[0])>-1});
  if(!s){bot('Elija una de las opciones, por favor.',null,A.sectors.map(function(x){return x.n}));return}
  ctx.s=s;mode='equipo';bot('¿Qué equipo quiere lubricar?',null,s.eq.map(function(e){return e.n}));return}
 if(mode==='equipo'){var e=ctx.s.eq.find(function(x){return norm(x.n)===t});
  if(!e){bot('Elija uno de los equipos de la lista.',null,ctx.s.eq.map(function(x){return x.n}));return}
  mode=null;var r=A.recommend(ctx.s.id,[e.id]);
  var txt='<b>Recomendación preliminar para '+esc(e.n.toLowerCase())+'</b>\n'+r.map(function(x){return '• '+esc(x.n)+' — '+esc(x.s)}).join('\n')+'\n\nLa referencia exacta la confirma nuestro equipo técnico con el manual del fabricante de su equipo.';
  var links=r.slice(0,2).map(function(x){return {label:'Ver '+x.n.toLowerCase(),href:x.url}});
  var sid=ctx.s.id;links.push({label:'Cotizar esto',href:'/#cotizar-'+sid,on:function(ev){if(window.VGL_QUOTE){ev.preventDefault();close();window.VGL_QUOTE.sector(sid)}}});
  hist.push({w:'me',t:'Recomendación para '+ctx.s.n+' / '+e.n+': '+r.map(function(x){return x.n}).join(', ')});
  bot(txt,links,['Presentaciones','Hablar con un asesor','Recomendar lubricante'])}}
function send(raw){var t=norm(raw);if(!t)return;add('me',esc(raw));hist.push({w:'me',t:raw});setChips([]);
 load().then(function(){
  if(mode){advisorStep(t);return}
  if(t==='catalogo'){bot('Aquí está el catálogo completo: 104 productos de tres marcas, con fichas técnicas.',[{label:'Abrir catálogo',href:'/catalogo.html'}]);return}
  var it=match(t),g=grade(raw);
  if(g&&(!it||['diesel','gasolina','hidraulico','engranajes','marinos','productos'].indexOf(it.id)>-1)){
   searchCat(g).then(function(res){if(!res.length){reply(it);return}
    bot('Encontré estas referencias con <b>'+esc(g.toUpperCase())+'</b> en el catálogo:\n'+res.map(function(p){return '• '+esc(p.n)+' ('+esc(p.b)+') — '+esc(p.g)}).join('\n'),[{label:'Ver en el catálogo',href:'/catalogo.html?q='+encodeURIComponent(g)+'#productos'},{label:'Cotizar',href:'/#cotizar'}],['Presentaciones','Hablar con un asesor'])});return}
  reply(it)})}
function reply(it){if(!it){bot(KB.fallback,null,['Recomendar lubricante','Hablar con un asesor']);return}
 if(it.flow==='advisor')return advisorStart();if(it.flow==='handoff')return handoff();
 var links=(it.links||[]).map(function(l){var o={label:l.label,href:l.href};if(l.href==='/#cotizar'&&d.getElementById('cotizar'))o.on=function(ev){ev.preventDefault();close();d.getElementById('cotizar').scrollIntoView({behavior:'smooth'})};return o});
 bot(it.a,links,it.chips)}
function open(){box.classList.add('open');fab.setAttribute('aria-expanded','true');if(!log.children.length)load().then(function(k){bot(k.saludo,null,k.chips)});setTimeout(function(){inp.focus()},50)}
function close(){box.classList.remove('open');fab.setAttribute('aria-expanded','false')}
fab.addEventListener('click',function(){box.classList.contains('open')?close():open()});
box.querySelector('.chat-x').addEventListener('click',function(){close();fab.focus()});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&box.classList.contains('open')){close();fab.focus()}});
form.addEventListener('submit',function(e){e.preventDefault();var v=inp.value;inp.value='';send(v)});
d.querySelectorAll('[data-open-ai]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();open();var q=b.getAttribute('data-open-ai');if(q)setTimeout(function(){send(q)},600)})});
})();
