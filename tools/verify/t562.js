// v1311 · Gastos: «Buscá el concepto» ya trae cargados los gastos comunes de una empresa (una sola vez, sin duplicar ni pisar los propios, ninguno como pago fijo)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const r0=await p.evaluate(()=>{ const T=window.__tes.st(); T.gcon=[{id:'gMio',n:'Internet',rub:'Otros gastos',fijo:true,m:250000}]; T.cfg.gconSeed=0; const u=window.__tes.ui; window.__tes.open(); u.tab='gasto'; u.solo='gasto'; window.__tes.draw(); return true; });
 await p.waitForTimeout(600);
 const r=await p.evaluate(()=>{ const T=window.__tes.st(); const chips=[...document.querySelectorAll('#tesoreria .tg-chip')].map(x=>x.textContent.trim()); return {n:T.gcon.length, chips:chips.length, inet:T.gcon.filter(c=>/^internet$/i.test(c.n)).map(c=>c.id+':'+c.m).join(), fijos:T.gcon.filter(c=>c.fijo).map(c=>c.n).join(), has:['ANDE (luz)','Alquiler del local','IPS (aporte patronal)','Regencia farmacéutica','Combustible','Pago mínimo de tarjeta de crédito'].every(n=>T.gcon.some(c=>c.n===n)), vacio:/Todavía no hay conceptos/.test(document.getElementById('tesoreria').innerText), seed:T.cfg.gconSeed}; });
 console.log(JSON.stringify(r));
 ok(r.n>=50&&r.chips>=50&&!r.vacio&&r.has,'ya vienen cargados los conceptos comunes ('+r.n+'): ANDE, alquiler, IPS, regencia, combustible, tarjeta…');
 ok(r.inet==='gMio:250000','el concepto «Internet» que ya era del usuario no se duplica ni se pisa');
 ok(r.fijos==='Internet','ninguno de los cargados entra como 📌 pago fijo (solo el que el usuario ya tenía)');
 // buscar
 await p.evaluate(()=>{ const q=document.getElementById('tgQ'); q.value='luz'; q.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(300);
 const vis=await p.evaluate(()=>[...document.querySelectorAll('#tesoreria .tg-chip')].filter(x=>x.offsetParent!==null&&getComputedStyle(x).display!=='none').map(x=>x.textContent.trim()).join(' | ')); ok(/ANDE \(luz\)/.test(vis)&&!/Combustible/.test(vis),'al escribir «luz» queda ANDE (luz): '+vis.slice(0,80));
 // no se vuelven a agregar los que el usuario borra
 const n2=await p.evaluate(()=>{ const T=window.__tes.st(); T.gcon=T.gcon.filter(c=>c.n!=='Fumigación'); window.__tes.draw(); return T.gcon.some(c=>c.n==='Fumigación'); });
 ok(n2===false,'un concepto que el usuario borró no vuelve a aparecer solo');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
