(function(){var e=window.VGL;document.querySelectorAll("form[data-vgl-form]").forEach(function(a){a.addEventListener("submit",function(n){n.preventDefault();var m=n.submitter&&n.submitter.getAttribute("data-via")||"email",i=a.getAttribute("data-vgl-subject")||"Solicitud",r=[];[].forEach.call(a.elements,function(t){if(!(!t.name||t.tagName==="BUTTON")){var o=(t.value||"").trim();o&&r.push(t.name+": "+o)}});var u=i+`

`+r.join(`
`)+`

Enviado desde vanguardlubricantsgroup.com`;m==="wa"?e.wa(0,u):e.mail(i,u)})})})();
