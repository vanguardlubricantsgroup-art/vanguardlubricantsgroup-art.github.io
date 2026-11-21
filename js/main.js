(function(){var d=document;d.documentElement.classList.add('js');
var t=d.querySelector('.tgl'),n=d.getElementById('nav');
if(t&&n){t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',o);t.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');});
n.addEventListener('click',function(e){if(e.target.closest('a')){n.classList.remove('open');t.setAttribute('aria-expanded','false');}});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&n.classList.contains('open')){n.classList.remove('open');t.setAttribute('aria-expanded','false');t.focus();}});}
var els=d.querySelectorAll('.rv');
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -6% 0px'});els.forEach(function(el){io.observe(el);});}
else els.forEach(function(el){el.classList.add('in');});
var y=d.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
/* hero typing demo */
var tw=d.getElementById('ai-demo');
if(tw){var demos=[
 ["Tengo 12 camiones diésel y gasto unos 400 L al mes.","<b>Motor diésel API CK-4 / CI-4 15W-40</b> en <b>tambor de 208 L</b>, más grasa EP2 para chasis. Le preparo la solicitud."],
 ["¿Qué hidráulico para una prensa industrial?","<b>Hidráulico antidesgaste AW ISO VG 46 o 68</b>, según el manual del equipo. Presentación sugerida: <b>tambor de 208 L</b>."],
 ["Necesito aceite para un transformador.","<b>Aceite dieléctrico para transformadores</b>. Le enviamos la ficha técnica junto con la cotización formal."]],i=0;
 var q=tw.querySelector('.q'),a=tw.querySelector('.a');
 function show(){var x=demos[i%demos.length];q.textContent=x[0];a.innerHTML='<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span>';
  setTimeout(function(){a.innerHTML=x[1];},1100);i++;}
 show();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(show,6500);}
})();
