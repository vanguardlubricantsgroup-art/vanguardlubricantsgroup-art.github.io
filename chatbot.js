"use strict";
/* Asistente VGL — por reglas y base de conocimiento (kb.json). Sin llamadas a IA por defecto. */
(function(){
  var C=window.VGL_CONFIG||{},CB=C.chatbot||{},WA=C.whatsapp||"584127753289",PHONE=C.phoneDisplay||"",EMAIL=C.email||"";
  var kb=null,kbPromise=null,aiCount=0,quote=null,greeted=false;
  function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n;}
  function norm(s){return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s\-\.]/g," ").replace(/\s+/g," ").trim();}
  function waUrl(t){return "https://wa.me/"+WA+(t?"?text="+encodeURIComponent(t):"");}
  function loadKB(){if(kbPromise)return kbPromise;kbPromise=fetch(CB.kbUrl||"/kb.json").then(function(r){return r.json();}).then(function(j){kb=j;return j;}).catch(function(){kb=null;});return kbPromise;}

  var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 10.5h7M8.5 13.5h4.5"/></svg>';
  var root=el("div","vb");
  var launcher=el("button","vb-launch");launcher.type="button";launcher.setAttribute("aria-label","Abrir asistente VGL");launcher.setAttribute("aria-expanded","false");launcher.setAttribute("aria-controls","vb-panel");launcher.innerHTML=ICON;
  var panel=el("section","vb-panel");panel.id="vb-panel";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Asistente VGL");
  var head=el("div","vb-head");var tt=el("div");tt.append(el("strong",null,"Asistente VGL"),el("small",null,"Respuestas automáticas · Ventas por WhatsApp"));
  var close=el("button","vb-close","×");close.type="button";close.setAttribute("aria-label","Cerrar asistente");head.append(tt,close);
  var log=el("div","vb-log");log.setAttribute("role","log");log.setAttribute("aria-live","polite");
  var form=el("form","vb-form");var input=el("input");input.type="text";input.placeholder="Escriba su consulta…";input.maxLength=300;input.autocomplete="off";input.setAttribute("aria-label","Escriba su consulta");
  var send=el("button",null,"Enviar");send.type="submit";form.append(input,send);
  panel.append(head,log,form);root.append(panel,launcher);document.body.appendChild(root);

  function scroll(){log.scrollTop=log.scrollHeight;}
  function bot(parts){var m=el("div","vb-msg bot");parts.forEach(function(p){
    if(typeof p==="string"){var d=el("p",null,p);d.style.whiteSpace="pre-line";m.appendChild(d);return;}
    var a=el("a",p.cta?"vb-cta"+(p.ghost?" ghost":""):null,p.label);a.href=p.href;if(p.ext){a.target="_blank";a.rel="noopener noreferrer";}
    if(p.cta)m.appendChild(a);else{var l=el("p");if(p.before)l.append(p.before);l.appendChild(a);m.appendChild(l);}});
    log.appendChild(m);scroll();}
  function user(t){log.appendChild(el("div","vb-msg user",t));scroll();}
  function chips(list){var c=el("div","vb-chips");(list||[]).forEach(function(l){var b=el("button","vb-chip",l);b.type="button";b.addEventListener("click",function(){handle(l);});c.appendChild(b);});log.appendChild(c);scroll();}
  function clearChips(){log.querySelectorAll(".vb-chips").forEach(function(c){c.remove();});}
  function phones(){return C.phones||[{display:PHONE,e164:"+"+WA,wa:WA}];}
  function contactParts(){var parts=[];phones().forEach(function(p,i){parts.push({href:"https://wa.me/"+p.wa+"?text="+encodeURIComponent("Hola, quisiera hablar con el equipo comercial de VGL."),label:"WhatsApp "+p.display,cta:i===0,ext:true});parts.push({before:"Teléfono: ",href:"tel:"+p.e164,label:p.display});});parts.push({before:"Ventas: ",href:"mailto:"+EMAIL,label:EMAIL});parts.push({before:"Presidencia / entes: ",href:"mailto:"+(C.emailInstitucional||EMAIL),label:C.emailInstitucional||EMAIL});return parts;}

  /* --- Flujo de cotización (3 preguntas) --- */
  var STEPS=[{k:"producto",q:"1/3 · ¿Qué producto o línea necesita? (p. ej. diésel CI-4 15W40, hidráulico AW 68, grasas…)"},{k:"volumen",q:"2/3 · ¿Qué volumen aproximado? (p. ej. 10 pailas al mes, 2 tambores, 1 tótem)"},{k:"empresa",q:"3/3 · ¿Nombre de su empresa?"}];
  function startQuote(price){quote={i:0,d:{}};bot([(price?"No publicamos precios: cada cotización es formal y se prepara según producto, volumen y ubicación. ":"")+"Le hago 3 preguntas rápidas. Escriba «cancelar» para salir."]);askStep();}
  function askStep(){bot([STEPS[quote.i].q]);input.focus({preventScroll:true});}
  function quoteAnswer(t){
    if(/^(cancelar|salir|cancel)$/.test(norm(t))){quote=null;bot(["Listo, cancelé la solicitud."]);chips(kb&&kb.chips);return;}
    quote.d[STEPS[quote.i].k]=t.slice(0,200);quote.i++;if(quote.i<STEPS.length){askStep();return;}
    var d=quote.d;quote=null;
    var msg="Hola, quisiera solicitar una cotización (vía Asistente VGL).\nProducto/línea: "+d.producto+"\nVolumen aproximado: "+d.volumen+"\nEmpresa: "+d.empresa;
    bot(["Resumen:","• Producto/línea: "+d.producto+"\n• Volumen: "+d.volumen+"\n• Empresa: "+d.empresa,"Envíelo a nuestro equipo comercial; el mensaje ya incluye sus datos.",
      {href:waUrl(msg),label:"Enviar por WhatsApp",cta:true,ext:true},{href:"/#cotizacion",label:"Completar el formulario de cotización",cta:true,ghost:true},
      {before:"O por correo: ",href:"mailto:"+EMAIL+"?subject="+encodeURIComponent("Solicitud de cotización — "+d.empresa)+"&body="+encodeURIComponent(msg),label:EMAIL}]);
    chips(["Registro de proveedor","Hablar con ventas"]);
  }

  /* --- Búsqueda de referencias en el catálogo público --- */
  function keysOf(str){var t=norm(str).replace(/-/g," ").split(" ").filter(Boolean),k={};t.forEach(function(x,i){k[x]=1;if(i>0)k[t[i-1]+x]=1;});return {t:t,k:k};}
  function findProducts(n){
    var cat=window.VGL_CATALOG;if(!cat)return [];
    var q=keysOf(n),sig=q.t.map(function(x,i){return {x:x,i:i};}).filter(function(o){return /\d/.test(o.x);});
    if(!sig.length)return [];
    var codes=q.t.filter(function(x){return /^(sl|sn|cf|ci|aw|ep|iso|sae|to|mos2|br)$/.test(x);});
    return cat.filter(function(p){var pk=keysOf(p.name+" "+p.ref).k;
      return codes.every(function(c){return !!pk[c];})&&sig.every(function(o){var mixed=/[a-z]/.test(o.x)&&/\d/.test(o.x);
        if(mixed)return !!pk[o.x];
        return o.i>0&&!!pk[q.t[o.i-1]+o.x];});}).slice(0,6);
  }
  var PL={granel:"granel",pailas:"paila 19 L",tambores:"tambor 208 L",ibc:"tótem 1.000 L"};

  /* --- Coincidencia de intenciones --- */
  function score(it,n){var s=0,padded=" "+n+" ";it.kw.forEach(function(k){var kk=" "+k+" ";if(padded.indexOf(kk)>-1)s+=1+k.length/10;else if(k.length>=6&&padded.indexOf(" "+k)>-1)s+=0.6;});return s;}
  function match(n){var best=null,bs=0;kb.intents.forEach(function(it){var s=score(it,n);if(s>bs){bs=s;best=it;}});return bs>0?best:null;}
  function answerIntent(it){
    if(it.flow==="quote"){startQuote(!!it.price);return;}
    if(it.flow==="contact"){bot(["Con gusto le conecto con nuestro equipo comercial:"].concat(contactParts()));chips(["Solicitar cotización"]);return;}
    if(it.flow==="greet"){bot(["¡Hola! Soy el asistente de Vanguard Lubricants Group. ¿En qué puedo ayudarle?"]);chips(kb.chips);return;}
    var parts=it.a.slice();(it.links||[]).forEach(function(l){parts.push({href:l.href,label:l.label,cta:true,ghost:true});});
    bot(parts);chips(it.chips);
  }
  function aiFallback(text){
    if(!CB.aiMode||aiCount>=(CB.aiMaxPerSession||5))return false;
    aiCount++;bot(["Un momento…"]);
    fetch(CB.aiEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({q:text.slice(0,300)})})
      .then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){log.lastChild.remove();bot([String(j.answer||"").slice(0,900),{href:waUrl(),label:"Hablar con ventas",cta:true,ext:true,ghost:true}]);chips(kb.chips);})
      .catch(function(){log.lastChild.remove();fallback();});
    return true;
  }
  function fallback(){bot([kb.fallback].concat(contactParts()));chips(kb.chips);}
  function handle(text){
    text=String(text).trim();if(!text)return;user(text);clearChips();
    loadKB().then(function(){
      if(!kb){bot(["Por ahora no puedo cargar mis respuestas. Escríbanos:"].concat(contactParts()));return;}
      if(quote){quoteAnswer(text);return;}
      var n=norm(text);
      var it=match(n);
      if(it&&(it.flow==="quote"||it.id==="precio")){answerIntent(it);return;}
      var prods=findProducts(n);
      if(prods.length){
        bot(["Encontré estas referencias en el catálogo:"].concat(prods.map(function(p){return "• "+p.name+" "+p.ref+" ("+p.pres.map(function(x){return PL[x];}).join(", ")+")";})).concat(["La disponibilidad se confirma al cotizar."]).concat([{href:"/catalogo.html?q="+encodeURIComponent(text),label:"Ver en el catálogo",cta:true,ghost:true}]));
        chips(["Solicitar cotización","Fichas técnicas"]);return;}
      loadMarcas().then(function(){
        var mp=(it&&!/\d/.test(n))?[]:findBrandProducts(n);
        if(mp.length){
          bot(["Encontré estos productos por marca (todos se cotizan, no publicamos precios):"].concat(mp.map(function(p){return "• "+p.b+" — "+p.n+" · "+p.g;})).concat([{href:"/catalogo.html?q="+encodeURIComponent(text)+"#catalogo-marcas",label:"Ver en el catálogo por marca",cta:true,ghost:true}]));
          chips(["Solicitar cotización","Fichas técnicas"]);return;}
        if(it){answerIntent(it);return;}
        if(!aiFallback(text))fallback();
      });
    });
  }
  function loadMarcas(){
    if(window.VGL_MARCAS)return Promise.resolve();
    return new Promise(function(res){var sc=document.createElement("script");sc.src="/marcas-data.js";sc.onload=res;sc.onerror=res;document.head.appendChild(sc);});
  }
  var STOP={de:1,del:1,la:1,el:1,los:1,las:1,para:1,con:1,que:1,tienen:1,tiene:1,aceite:1,aceites:1,producto:1,productos:1,marca:1,marcas:1,una:1,uno:1,por:1,favor:1,quiero:1,necesito:1,busco:1,phillips:1,kendall:1,fanfaro:1,orolub:1,"66":1};
  function findBrandProducts(n){
    var m=window.VGL_MARCAS;if(!m)return [];
    var toks=n.split(" ").filter(function(t){return t.length>=2&&!STOP[t];});
    if(!toks.length)return [];
    var strong=toks.some(function(t){return /\d/.test(t)||t.length>=5;});
    if(!strong)return [];
    return m.filter(function(p){var h=" "+norm(p.b+" "+p.n+" "+p.g+" "+p.cl).replace(/-/g," ")+" ";
      return toks.every(function(t){return h.indexOf(t.replace(/-/g," "))>-1;});}).slice(0,5);
  }
  function toggle(open){panel.hidden=!open;root.classList.toggle("open",open);launcher.setAttribute("aria-expanded",String(open));
    if(open){loadKB().then(function(){if(!greeted&&kb){greeted=true;bot(["¡Hola! Soy el asistente de Vanguard Lubricants Group. Le ayudo con productos, presentaciones, registro de proveedor y cotizaciones. No publicamos precios: las cotizaciones son formales."]);chips(kb.chips);}});
      if(!window.matchMedia("(max-width:640px)").matches)input.focus({preventScroll:true});}else launcher.focus({preventScroll:true});}
  launcher.addEventListener("click",function(){toggle(panel.hidden);});
  close.addEventListener("click",function(){toggle(false);});
  panel.addEventListener("keydown",function(e){if(e.key==="Escape"){e.stopPropagation();toggle(false);}});
  form.addEventListener("submit",function(e){e.preventDefault();var v=input.value;input.value="";handle(v);});
})();
