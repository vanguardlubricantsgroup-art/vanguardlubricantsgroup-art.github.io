(function(){
  var C=window.VGL_CONFIG||{};
  function wa(){return (C.phones&&C.phones[0]&&C.phones[0].wa)||C.whatsapp||"584127753289";}
  function labelOf(el){
    if(el.id){var l=document.querySelector('label[for="'+el.id+'"]');if(l)return l.childNodes[0]&&l.childNodes[0].textContent?l.childNodes[0].textContent.trim():l.textContent.trim();}
    var wrap=el.closest("label");if(wrap)return wrap.textContent.trim();
    var lg=el.closest("fieldset");if(lg&&lg.querySelector("legend"))return lg.querySelector("legend").textContent.trim();
    return el.name;
  }
  function collect(form){
    var lines=[], grouped={};
    Array.from(form.elements).forEach(function(el){
      if(!el.name||el.disabled)return;
      if(el.name==="bot-field"||el.name==="form-name")return;
      if(el.type==="checkbox"){
        if(!el.checked)return;
        grouped[el.name]=grouped[el.name]||[];grouped[el.name].push(el.value||"Sí");
        return;
      }
      if(el.type==="radio"){if(!el.checked)return;}
      if(el.tagName==="BUTTON")return;
      var v=(el.value||"").trim();if(!v)return;
      lines.push(labelOf(el)+": "+v);
    });
    Object.keys(grouped).forEach(function(k){
      var first=form.querySelector('[name="'+k+'"]');
      lines.push(labelOf(first)+": "+grouped[k].join(", "));
    });
    return lines.join("\n");
  }
  document.querySelectorAll("form[data-vgl-form]").forEach(function(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      if(form.getAttribute("data-vgl-form")==="cotizacion"&&!form.querySelector('input[name="productos"]:checked')){
        alert("Seleccione al menos un producto de interés.");return;
      }
      var via=(e.submitter&&e.submitter.getAttribute("data-vgl-via"))||"email";
      var to=form.getAttribute("data-vgl-to")||C.email||"ventas@vanguardlubricantsgroup.com";
      var subject=form.getAttribute("data-vgl-subject")||"Solicitud";
      var body=collect(form);
      if(!body){alert("Complete los campos de la solicitud.");return;}
      if(via==="whatsapp"){
        window.open("https://wa.me/"+wa()+"?text="+encodeURIComponent(subject+"\n\n"+body),"_blank","noopener");
      }else{
        location.href="mailto:"+to+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
      }
    });
  });
})();
