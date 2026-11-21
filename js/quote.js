/* Cotizador inteligente: sector → equipos → recomendación → volumen → datos → solicitud (correo o WhatsApp). Sin servidor. */
(function(){
var root=document.getElementById('qb');if(!root||!window.VGL_ADVISOR)return;
var A=window.VGL_ADVISOR,C=window.VGL,st={sector:null,eq:[],recs:[],lines:[]};
var steps=root.querySelectorAll('.qb-step'),prog=root.querySelectorAll('.qb-prog i'),lab=root.querySelector('#qb-lab'),cur=0;
function $(s){return root.querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var names=["Sector","Equipos","Recomendación","Volumen y entrega","Datos de su empresa","Solicitud lista"];
function go(i,nf){cur=i;steps.forEach(function(s,k){s.classList.toggle('on',k===i)});prog.forEach(function(p,k){p.classList.toggle('on',k<=i)});
 lab.textContent="Paso "+(i+1)+" de "+steps.length+" · "+names[i];var h=steps[i].querySelector('h3');if(h&&!nf){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}}
/* step 1 */
var sWrap=$('#qb-sectors');
A.sectors.forEach(function(s){sWrap.insertAdjacentHTML('beforeend','<div class="opt"><input type="radio" name="qb-sector" id="qs-'+s.id+'" value="'+s.id+'"><label for="qs-'+s.id+'">'+esc(s.n)+'<small>'+esc(s.d)+'</small></label></div>')});
sWrap.addEventListener('change',function(e){st.sector=e.target.value;buildEq();});
function buildEq(){var s=A.sectors.find(function(x){return x.id===st.sector});var w=$('#qb-eq');w.innerHTML='';st.eq=[];
 $('#qb-eq-t').textContent='¿Qué equipos lubrica en '+s.n.toLowerCase()+'?';
 s.eq.forEach(function(e){w.insertAdjacentHTML('beforeend','<div class="opt"><input type="checkbox" name="qb-eq" id="qe-'+e.id+'" value="'+e.id+'"><label for="qe-'+e.id+'">'+esc(e.n)+'</label></div>')});}
/* step 3 */
function buildRec(){st.eq=[].map.call(root.querySelectorAll('input[name=qb-eq]:checked'),function(x){return x.value});
 var r=A.recommend(st.sector,st.eq),w=$('#qb-rec');var h='<div class="rec"><div class="h"><span class="ai-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg></span>Recomendación técnica preliminar</div><p style="margin:0 0 8px;color:#bfc4c9;font-size:.88rem">Según su sector y equipos, estas son las familias que suelen aplicar. Desmarque las que no necesite.</p></div><div class="opts">';
 r.forEach(function(x,i){h+='<div class="opt"><input type="checkbox" name="qb-rec" id="qr-'+i+'" value="'+i+'" checked><label for="qr-'+i+'">'+esc(x.n)+'<small>'+esc(x.s)+'</small></label></div>'});
 h+='</div>';w.innerHTML=h;st.recs=r;}
var lw=$('#qb-lines');
A.lines.filter(function(l){return l.soon}).forEach(function(l){lw.insertAdjacentHTML('beforeend','<div class="opt"><input type="checkbox" name="qb-line" id="ql-'+l.id+'" value="'+esc(l.n)+'"><label for="ql-'+l.id+'">'+esc(l.n)+'<small>Próximamente · avisarme</small></label></div>')});
/* step 4 */
var vol=$('#qb-vol'),pr=$('#qb-pres');
function sugg(){var p=A.presentation(vol.value);$('#qb-pres-hint').textContent='Sugerencia: '+p;}
vol.addEventListener('input',sugg);
/* nav */
function err(m){var e=steps[cur].querySelector('.err');if(e)e.textContent=m||'';}
root.addEventListener('click',function(e){var b=e.target.closest('[data-go]');if(!b)return;var dir=b.getAttribute('data-go');
 if(dir==='back'){err();go(Math.max(0,cur-1));return;}
 if(cur===0&&!st.sector)return err('Seleccione un sector.');
 if(cur===1){if(!root.querySelector('input[name=qb-eq]:checked'))return err('Seleccione al menos un equipo.');buildRec();}
 if(cur===2&&!root.querySelector('input[name=qb-rec]:checked')&&!root.querySelector('input[name=qb-line]:checked')&&!$('#qb-ref').value.trim())return err('Seleccione al menos una familia o indique una referencia.');
 if(cur===4){var f=steps[4].querySelectorAll('[required]');for(var i=0;i<f.length;i++){if(!f[i].checkValidity()){f[i].reportValidity();return;}}build();}
 err();go(Math.min(steps.length-1,cur+1));});
/* build */
var text='',subj='';
function rid(){var d=new Date();function p(n){return(n<10?'0':'')+n}return 'VGL-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+Math.random().toString(36).slice(2,6).toUpperCase();}
function v(id){var el=$('#'+id);return el?el.value.trim():''}
function build(){var s=A.sectors.find(function(x){return x.id===st.sector});
 var eqN=s.eq.filter(function(e){return st.eq.indexOf(e.id)>-1}).map(function(e){return e.n});
 var recs=[].map.call(root.querySelectorAll('input[name=qb-rec]:checked'),function(x){var r=st.recs[+x.value];return r.n+' ('+r.s+')'});
 var soon=[].map.call(root.querySelectorAll('input[name=qb-line]:checked'),function(x){return x.value});
 var cart=[];try{cart=JSON.parse(localStorage.getItem('vgl-cart')||'[]')}catch(e){}
 var id=rid();subj='Solicitud de cotización '+id+' — '+v('qb-emp');
 var L=['SOLICITUD DE COTIZACIÓN · '+id,'','EMPRESA','Empresa: '+v('qb-emp'),'RIF: '+v('qb-rif'),'Contacto: '+v('qb-con')+(v('qb-car')?' · '+v('qb-car'):''),'Teléfono: '+v('qb-tel'),'Correo: '+v('qb-mail'),'',
 'OPERACIÓN','Sector: '+s.n,'Equipos: '+eqN.join('; '),'','PRODUCTOS'];
 recs.forEach(function(r){L.push('• '+r)});
 if(v('qb-ref'))L.push('• Referencia indicada: '+v('qb-ref'));
 cart.forEach(function(c){L.push('• Catálogo: '+c.n+' ('+c.b+')')});
 if(soon.length)L.push('Interés en líneas próximas: '+soon.join(', '));
 L.push('','LOGÍSTICA','Consumo estimado: '+(v('qb-vol')?v('qb-vol')+' L/mes':'Por definir'),'Presentación: '+(pr.value||A.presentation(vol.value)),'Frecuencia: '+(v('qb-freq')||'Por definir'),'Entrega: '+(v('qb-city')||'Por definir'));
 if(v('qb-notes'))L.push('','NOTAS',v('qb-notes'));
 L.push('','Enviado desde vanguardlubricantsgroup.com');text=L.join('\n');
 $('#qb-sum').textContent=text;$('#qb-id').textContent=id;}
function wa(n){window.open('https://wa.me/'+C.phones[n].wa+'?text='+encodeURIComponent(text),'_blank','noopener');}
$('#qb-mail-btn').addEventListener('click',function(){location.href='mailto:'+C.email+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(text);});
$('#qb-wa1').addEventListener('click',function(){wa(0)});$('#qb-wa2').addEventListener('click',function(){wa(1)});
$('#qb-copy').addEventListener('click',function(e){var b=e.currentTarget;(navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).then(function(){b.textContent='Copiado ✓'},function(){b.textContent='Seleccione y copie el texto'});});
/* public: preselect sector */
window.VGL_QUOTE={sector:function(id){var r=document.getElementById('qs-'+id);if(r){r.checked=true;st.sector=id;buildEq();go(1);}document.getElementById('cotizar').scrollIntoView({behavior:'smooth'});}};
document.querySelectorAll('[data-sector]').forEach(function(b){b.addEventListener('click',function(){window.VGL_QUOTE.sector(b.getAttribute('data-sector'))})});
var m=location.hash.match(/^#cotizar-(\w+)/);go(0,1);
if(m)window.VGL_QUOTE.sector(m[1]);
})();
