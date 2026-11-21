/* Catálogo VGL: filtros, búsqueda y "Mi solicitud" (localStorage). Sin precios. */
(function(){
var d=document,P=window.VGL_MARCAS||[],C=window.VGL,grid=d.getElementById('prods');if(!grid)return;
var BR={p66:{n:'Phillips 66 · Kendall',f:'flag-us.webp',c:'b-p66'},ff:{n:'Fanfaro',f:'flag-de.webp',c:'b-ff'},or:{n:'Orolub',f:'flag-ve.webp',c:'b-or'}};
var q=d.getElementById('f-q'),cat=d.getElementById('f-cat'),pres=d.getElementById('f-pres'),cnt=d.getElementById('f-count'),segs=d.querySelectorAll('#f-brand button'),brand='';
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s\-·]/g,'')}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var cats=[];P.forEach(function(p){if(cats.indexOf(p.cl)<0)cats.push(p.cl)});cats.sort().forEach(function(c){var o=d.createElement('option');o.value=c;o.textContent=c;cat.appendChild(o)});
var cart=[];try{cart=JSON.parse(localStorage.getItem('vgl-cart')||'[]')}catch(e){}
function inCart(id){return cart.some(function(c){return c.id===id})}
function save(){try{localStorage.setItem('vgl-cart',JSON.stringify(cart))}catch(e){}bar()}
function card(p){var b=BR[p.l]||{},links=[];
 if(p.f)links.push('<a href="/fichas/marcas/'+esc(p.f)+(p.fp?'#page='+p.fp:'')+'" target="_blank" rel="noopener">Ficha VGL (PDF)</a>');
 if(p.t)links.push('<a href="'+esc(p.t)+'" target="_blank" rel="noopener">Ficha del fabricante</a>');
 else if(p.w)links.push('<a href="'+esc(p.w)+'" target="_blank" rel="noopener">Página del fabricante</a>');
 return '<article class="prod '+b.c+'"><div class="im"><img src="/assets/marcas/'+esc(p.im)+'" alt="'+esc(p.logo?'Logo '+p.b:p.n)+'" loading="lazy" width="200" height="142"></div><div class="bd">'+
 '<span class="br"><img class="flag" src="/assets/marcas/'+b.f+'" alt="" width="24" height="16">'+esc(b.n)+'</span><h3>'+esc(p.n)+'</h3><span class="gr">'+esc(p.g)+'</span><span class="us">'+esc(p.u)+'</span>'+
 '<span class="pr"><b>Presentaciones:</b> '+esc((p.p||[]).join(' · '))+'</span>'+(p.pn?'<span class="pn">'+esc(p.pn)+'</span>':'')+
 '<div class="ac"><button type="button" class="add" data-id="'+p.id+'" aria-pressed="'+inCart(p.id)+'">'+(inCart(p.id)?'✓ En mi solicitud':'+ Agregar a solicitud')+'</button>'+links.join('')+'</div></div></article>'}
function render(){var k=norm(q.value),c=cat.value,pr=pres.value;
 var r=P.filter(function(p){return(!brand||p.l===brand)&&(!c||p.cl===c)&&(!pr||(p.p||[]).join(' ').toLowerCase().indexOf(pr)>-1)&&(!k||norm(p.n+' '+p.g+' '+p.u+' '+p.cl+' '+p.b).indexOf(k)>-1)});
 grid.innerHTML=r.map(card).join('')||'<p>No hay productos con esos filtros. Pruebe otra búsqueda o <a href="/#cotizar">pídanos la referencia</a>.</p>';
 cnt.textContent=r.length+' de '+P.length+' productos';}
segs.forEach(function(b){b.addEventListener('click',function(){brand=b.getAttribute('data-b');segs.forEach(function(x){x.setAttribute('aria-pressed',x===b)});render()})});
[q,cat,pres].forEach(function(el){el.addEventListener('input',render)});
grid.addEventListener('click',function(e){var b=e.target.closest('.add');if(!b)return;var id=b.getAttribute('data-id'),p=P.find(function(x){return x.id===id});
 if(inCart(id))cart=cart.filter(function(c){return c.id!==id});else cart.push({id:id,n:p.n,b:p.b});save();
 b.setAttribute('aria-pressed',inCart(id));b.textContent=inCart(id)?'✓ En mi solicitud':'+ Agregar a solicitud'});
var cb=d.getElementById('cart-bar');
function msg(){return 'Hola, quisiera cotizar estos productos (desde el catálogo web de VGL):\n'+cart.map(function(c){return '• '+c.n+' ('+c.b+')'}).join('\n')+'\n\nEmpresa:\nRIF:\nVolumen estimado:\nCiudad de entrega:'}
function bar(){if(!cb)return;cb.classList.toggle('on',cart.length>0);d.getElementById('cart-n').textContent=cart.length+(cart.length===1?' producto':' productos');}
d.getElementById('cart-wa').addEventListener('click',function(){window.open('https://wa.me/'+C.phones[0].wa+'?text='+encodeURIComponent(msg()),'_blank','noopener')});
d.getElementById('cart-mail').addEventListener('click',function(){location.href='mailto:'+C.email+'?subject='+encodeURIComponent('Solicitud de cotización — catálogo web')+'&body='+encodeURIComponent(msg())});
d.getElementById('cart-clear').addEventListener('click',function(){cart=[];save();render()});
var u=new URLSearchParams(location.search);if(u.get('q'))q.value=u.get('q');if(u.get('cat')&&cats.indexOf(u.get('cat'))>-1)cat.value=u.get('cat');
if(u.get('marca')&&BR[u.get('marca')]){brand=u.get('marca');segs.forEach(function(x){x.setAttribute('aria-pressed',x.getAttribute('data-b')===brand)})}
render();bar();
/* referencias por especificación */
var tb=d.getElementById('refs');if(tb&&window.VGL_CATALOG){tb.innerHTML=window.VGL_CATALOG.map(function(r){return '<tr><td>'+esc(r.name)+'</td><td>'+esc(r.ref)+'</td><td>'+esc(r.family)+'</td></tr>'}).join('')}
})();
