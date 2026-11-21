/* Formularios sin servidor: arman un correo o un WhatsApp con los datos. */
(function(){var C=window.VGL;
document.querySelectorAll('form[data-vgl-form]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();
 var via=(e.submitter&&e.submitter.getAttribute('data-via'))||'email',subj=f.getAttribute('data-vgl-subject')||'Solicitud',L=[];
 [].forEach.call(f.elements,function(el){if(!el.name||el.tagName==='BUTTON')return;var v=(el.value||'').trim();if(v)L.push(el.name+': '+v)});
 var body=subj+'\n\n'+L.join('\n')+'\n\nEnviado desde vanguardlubricantsgroup.com';
 if(via==='wa')window.open('https://wa.me/'+C.phones[0].wa+'?text='+encodeURIComponent(body),'_blank','noopener');
 else location.href='mailto:'+C.email+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);});});})();
