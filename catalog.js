(function(){
"use strict";
var C=window.VGL_CONFIG||{},KEY="vgl-quote-cart-v3",data=window.VGL_CATALOG||[],MK=window.VGL_MARCAS||[];
var PL={granel:"A granel · por litro",pailas:"Paila · 19 L",tambores:"Tambor · 208 L",ibc:"Tótem 1.000 L"};
var BR={p66:{n:"Phillips 66 · Kendall",f:"flag-us",o:"Estados Unidos",lg:"logo-phillips66",sub:"Lubricantes y grasas para flotas, industria y talleres"},
 ff:{n:"Fanfaro",f:"flag-de",o:"Alemania · fabricado en Lituania",lg:"logo-fanfaro",sub:"Diésel SHPD/UHPD, diésel marino, hidráulicos, compresores, turbinas y refrigerante"},
 or:{n:"Orolub",f:"flag-ve",o:"Venezuela · fabricación nacional bajo pedido",lg:"logo-orolub",sub:"Certificado de análisis por lote · paila, tambor y tótem de 1.000 L · diésel marino TBN 05 a 70"}};
var FURL="/fichas/marcas/";
function $(i){return document.getElementById(i);}
function norm(s){return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");}
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n;}
var cart=[];try{cart=JSON.parse(localStorage.getItem(KEY)||"[]");if(!Array.isArray(cart))cart=[];}catch(e){cart=[];}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart));}catch(e){}}
function find(id){var a=data.filter(function(p){return p.id===id;})[0];return a||MK.filter(function(p){return p.id===id;})[0];}
function isMk(p){return p&&p.l!==undefined;}
function pname(p){return isMk(p)?(p.b+" · "+p.n):(p.name+" "+p.ref);}
function lab(l){var p=find(l.id);if(isMk(p))return l.f;return p.family==="Grasas"&&l.f!=="granel"?(l.f==="pailas"?"Paila":"Tambor")+" · peso neto por confirmar":PL[l.f];}
function unit(l){var p=find(l.id);if(isMk(p))return /granel/i.test(l.f)?"litros":"envases";return l.f==="granel"?"litros":"envases";}
function add(id,f){var l=cart.filter(function(x){return x.id===id&&x.f===f;})[0];if(l)l.q+=1;else cart.push({id:id,f:f,q:1});save();draw();}
function report(){
  var emp=$("qc-emp").value.trim(),con=$("qc-con").value.trim(),n=$("qc-nota").value.trim();
  var L=["Hola, quisiera solicitar una cotización de los siguientes productos (vía catálogo web VGL):"];
  cart.forEach(function(l,i){var p=find(l.id);if(p)L.push((i+1)+". "+pname(p)+" · "+lab(l)+" · "+l.q+" "+(l.q===1&&unit(l)==="envases"?"envase":unit(l)));});
  if(emp)L.push("Empresa: "+emp);if(con)L.push("Contacto: "+con);if(n)L.push("Observaciones: "+n);
  return L.join("\n");
}
function draw(){
  var items=$("qcart-items");items.replaceChildren();var n=cart.length;
  $("qcart-count").textContent=n;$("qcart-fab").hidden=n===0;$("qcart-empty").hidden=n>0;$("qcart-form").hidden=n===0;
  cart.forEach(function(l,i){var p=find(l.id);if(!p)return;
    var row=el("div","qline"),d=el("div"),b=el("b",null,pname(p)),s=el("span",null,lab(l));d.append(b,s);
    var ctl=el("div"),inp=el("input");inp.type="number";inp.min="1";inp.step="1";inp.value=l.q;inp.setAttribute("aria-label","Cantidad de "+pname(p)+" ("+unit(l)+")");
    inp.addEventListener("input",function(){var v=parseInt(inp.value,10);if(v>0){l.q=v;save();upd();}});
    var rm=el("button",null,"Quitar");rm.type="button";rm.addEventListener("click",function(){cart.splice(i,1);save();draw();});
    ctl.append(inp,el("span",null," "+unit(l)),document.createElement("br"),rm);row.append(d,ctl);items.appendChild(row);});
  upd();
}
function upd(){if(!cart.length)return;var r=report();$("qc-wa").href="https://wa.me/"+(C.whatsapp||"584127753289")+"?text="+encodeURIComponent(r);
  $("qc-mail").href="mailto:"+(C.email||"")+"?subject="+encodeURIComponent("Solicitud de cotización")+"&body="+encodeURIComponent(r);}
["qc-emp","qc-con","qc-nota"].forEach(function(i){$(i).addEventListener("input",upd);});
$("qc-copy").addEventListener("click",function(){var r=report();(navigator.clipboard?navigator.clipboard.writeText(r):Promise.reject()).then(function(){$("qc-fb").textContent="Copiado.";},function(){$("qc-fb").textContent="No se pudo copiar; use WhatsApp o correo.";});});
$("qc-clear").addEventListener("click",function(){cart=[];save();draw();$("qcart").close();});
$("qcart-fab").addEventListener("click",function(){$("qcart").showModal();});
$("qcart-close").addEventListener("click",function(){$("qcart").close();});

/* ---------- Referencias por grado (VGL) ---------- */
var fmt="",res=$("cat-results"),qI=$("cat-q"),fam=$("cat-fam");
function render(){
  var q=norm(qI.value),f=fam.value,out=data.filter(function(p){return(!q||norm(p.name+p.ref+p.family).indexOf(q)>-1)&&(!f||p.family===f)&&(!fmt||p.pres.indexOf(fmt)>-1);});
  res.replaceChildren();
  out.forEach(function(p){
    var c=el("article","cat-item"),h=el("h3",null,p.name),r=el("div","ref",p.ref),t=el("small",null,p.family);
    var s=el("select");s.setAttribute("aria-label","Presentación de "+pname(p));
    p.pres.forEach(function(x){var o=el("option",null,p.family==="Grasas"&&x!=="granel"?(x==="pailas"?"Paila":"Tambor")+" · peso neto por confirmar":PL[x]);o.value=x;if(x===fmt)o.selected=true;s.appendChild(o);});
    var b=el("button","btn btn-dark","Añadir a mi solicitud");b.type="button";
    b.addEventListener("click",function(){add(p.id,s.value);b.textContent="Añadido ✓";setTimeout(function(){b.textContent="Añadir a mi solicitud";},1200);});
    c.append(h,r,t,s,b);res.appendChild(c);});
  $("cat-count").textContent=out.length+(out.length===1?" referencia":" referencias");
  $("cat-empty").hidden=out.length>0;
}
qI.addEventListener("input",render);fam.addEventListener("change",render);
var btns=document.querySelectorAll("#cat-fmts button");
function setFmt(v,scroll){fmt=v;btns.forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.fmt===v));});render();if(scroll)$("referencias").scrollIntoView({behavior:"smooth"});}
btns.forEach(function(b){b.addEventListener("click",function(){setFmt(b.dataset.fmt,false);});});
document.querySelectorAll(".cat-fmt [data-fmt]").forEach(function(b){b.addEventListener("click",function(){setFmt(b.dataset.fmt,true);});});

/* ---------- Catálogo por marca ---------- */
var mb="",mq=$("mk-q"),mc=$("mk-cat"),mr=$("mk-results"),expanded={};
var LIMIT=8,cats=[];
MK.forEach(function(p){if(!cats.some(function(c){return c[0]===p.c;}))cats.push([p.c,p.cl]);});
cats.forEach(function(c){var o=el("option",null,c[1]);o.value=c[0];mc.appendChild(o);});
function card(p){
  var a=el("article","pcard b-"+p.l);
  var ph=el("div","pph"+(p.logo?" lg":""));var im=el("img");im.src="/assets/marcas/"+p.im;im.alt=p.logo?"Logo "+p.b:p.n;im.loading="lazy";im.decoding="async";im.width=160;im.height=154;ph.appendChild(im);
  var fl=el("img","flag");fl.src="/assets/marcas/"+BR[p.l].f+".webp";fl.alt="Origen: "+BR[p.l].o.split(" ·")[0];fl.width=26;fl.height=17;ph.appendChild(fl);a.appendChild(ph);
  var b=el("div","pbody");b.appendChild(el("h4",null,p.n));
  if(p.b==="Kendall")b.appendChild(el("span","ktag","Marca Kendall"));
  b.appendChild(el("div","spec",p.g));if(p.u)b.appendChild(el("p","use",p.u));
  if(p.pn)b.appendChild(el("p","ph-note",p.pn));
  var ul=el("ul","pres-list");p.p.forEach(function(x){var li=el("li");li.append(el("span",null,x),el("b",null,"A cotizar"));ul.appendChild(li);});b.appendChild(ul);
  var lk=el("div","plinks");
  function link(h,t){var x=el("a",null,t);x.href=h;x.target="_blank";x.rel="noopener";lk.appendChild(x);}
  if(p.t)link(p.t,"TDS oficial");
  if(p.of)link(FURL+p.of,"Ficha técnica");
  if(p.w)link(p.w,"Ficha web oficial");
  if(p.s)link(p.s,"SDS oficial");
  if(p.f)link(FURL+p.f+"#page="+p.fp,"Ficha VGL");
  if(!p.t&&!p.of&&!p.f){lk.appendChild(el("span",null,"Ficha técnica a solicitud"));}
  if(!p.s)lk.appendChild(el("span",null,"SDS a solicitud"));
  b.appendChild(lk);if(p.k)b.appendChild(el("div","psku","Cód. "+p.k));
  var act=el("div","pact"),sel=el("select");sel.setAttribute("aria-label","Presentación de "+pname(p));p.p.forEach(function(x){var o=el("option",null,x);o.value=x;sel.appendChild(o);});
  var bt=el("button","btn btn-dark","Agregar a mi solicitud");bt.type="button";bt.addEventListener("click",function(){add(p.id,sel.value);bt.textContent="Agregado ✓";setTimeout(function(){bt.textContent="Agregar a mi solicitud";},1200);});
  act.append(sel,bt);b.appendChild(act);a.appendChild(b);return a;
}
function renderMk(){
  var q=norm(mq.value),c=mc.value,filtering=!!(q||c),total=0;
  mr.replaceChildren();
  ["p66","ff","or"].forEach(function(k){
    if(mb&&mb!==k)return;
    var items=MK.filter(function(p){return p.l===k&&(!c||p.c===c)&&(!q||norm(p.b+p.n+p.g+p.u+p.cl+(p.k||"")).indexOf(q)>-1);});
    if(!items.length)return;total+=items.length;
    var sec=el("section","b-"+k),band=el("div","mk-band b-"+k),h=el("h3");
    var fl=el("img","flag");fl.src="/assets/marcas/"+BR[k].f+".webp";fl.alt="";fl.width=30;fl.height=20;h.append(fl,document.createTextNode(BR[k].n));
    band.appendChild(h);var lg=el("div","lg"),li=el("img");li.src="/assets/marcas/"+BR[k].lg+".webp";li.alt="Logo "+BR[k].n;li.height=40;lg.appendChild(li);band.appendChild(lg);
    band.appendChild(el("small",null,"Marca que distribuimos · "+BR[k].o+" · "+BR[k].sub));sec.appendChild(band);
    if(k==="or")sec.appendChild(el("p","mk-note","A la medida: fabricación bajo ficha técnica y formulaciones específicas a la medida del cliente."));
    var show=(filtering||expanded[k])?items:items.slice(0,LIMIT);
    var last="",grid=null;
    show.forEach(function(p){
      if(p.c!==last){last=p.c;sec.appendChild(el("h4","mk-sub",p.cl));grid=el("div","mk-grid");sec.appendChild(grid);}
      grid.appendChild(card(p));});
    if(show.length<items.length){var m=el("div","mk-more"),bt=el("button","btn","Mostrar los "+items.length+" productos de "+BR[k].n);bt.type="button";bt.addEventListener("click",function(){expanded[k]=true;renderMk();});m.appendChild(bt);sec.appendChild(m);}
    mr.appendChild(sec);
  });
  $("mk-count").textContent=total+(total===1?" producto":" productos");$("mk-empty").hidden=total>0;
}
var mbtns=document.querySelectorAll("#mk-brands button");
function setBrand(v,scroll){mb=v;mbtns.forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.b===v));});renderMk();if(scroll)$("catalogo-marcas").scrollIntoView({behavior:"smooth"});}
mbtns.forEach(function(b){b.addEventListener("click",function(){setBrand(b.dataset.b,false);});});
mq.addEventListener("input",renderMk);mc.addEventListener("change",renderMk);
document.querySelectorAll(".brand-card a[href*='marca=']").forEach(function(a){a.addEventListener("click",function(e){var m=/marca=([a-z0-9]+)/.exec(a.getAttribute("href"));if(m){e.preventDefault();setBrand(m[1],true);history.replaceState(null,"","?marca="+m[1]+"#catalogo-marcas");}});});

var sp=new URLSearchParams(location.search),qs=sp.get("q"),mk=sp.get("marca");
if(qs){qI.value=qs.slice(0,120);mq.value=qs.slice(0,120);}
if(mk&&BR[mk]){mb=mk;mbtns.forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.b===mk));});}
render();renderMk();draw();
if(mk&&BR[mk]&&location.hash==="#catalogo-marcas"){setTimeout(function(){$("catalogo-marcas").scrollIntoView();},300);}
})();
