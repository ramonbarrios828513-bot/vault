// v1299 · gastos, préstamos y alquileres: cargar → aparece en compromisos por día y por mes, en la agenda de 8 semanas; editar desde la lista; pagar cuota baja el saldo y pasa al mes siguiente
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 p.on('dialog',d=>d.dismiss().catch(()=>{}));
 const open=async()=>{ await p.evaluate(()=>{ const u=window.__tes.ui; window.__tes.open(); u.tab='gasto'; u.solo='gasto'; window.__tes.draw(); }); await p.waitForTimeout(400); };
 const fill=async(vals)=>p.evaluate((vals)=>{ const ov=[...document.querySelectorAll('.ico-ov')].pop(); const miss=[]; for(const [k,v] of Object.entries(vals)){ const i=[...ov.querySelectorAll('[data-k="'+k+'"]')].pop(); if(!i){miss.push(k);continue;} i.value=v; i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); } const bs=[...ov.querySelectorAll('button')].filter(x=>/Guardar/.test(x.textContent)); bs[bs.length-1].click(); return miss; },vals);
 await open();
 await p.click('#tesoreria .tg-wz[data-tx2="deu"]'); await p.waitForTimeout(300);
 let miss=await fill({acr:'Coomecipar T537',tipo:'Cooperativa',saldo:'24.000.000',cuota:'1.200.000',dia:'15',fini:'2026-01-15',ncuo:'24'}); await p.waitForTimeout(500);
 ok(!miss.length,'préstamo: todos los campos '+miss);
 let d=await p.evaluate(()=>window.__tes.st().deu.find(x=>x.acr==='Coomecipar T537')); ok(d&&+d.faltan>0&&d.ffin&&d.prox,'con inicio y plazo calcula cuotas que faltan ('+(d&&d.faltan)+'), fecha fin ('+(d&&d.ffin)+') y próxima cuota ('+(d&&d.prox)+')');
 await open(); await p.click('#tesoreria .tg-wz[data-tx2="fijA"]'); await p.waitForTimeout(300);
 miss=await fill({suc:'KM 7',det:'Inmobiliaria Atlántica T537',m:'5.000.000',dia:'5',desde:'2025-03-01',hasta:'2027-03-01'}); await p.waitForTimeout(500); ok(!miss.length,'alquiler: todos los campos '+miss);
 await open(); await p.click('#tesoreria .tg-wz[data-tx2="fijS"]'); await p.waitForTimeout(300);
 miss=await fill({suc:'KM 8',det:'ANDE KM 8 T537',m:'1.100.000',dia:'22'}); await p.waitForTimeout(500); ok(!miss.length,'ANDE: todos los campos '+miss);
 await open();
 const tx=await p.evaluate(()=>document.getElementById('tesoreria').innerText.replace(/\s+/g,' '));
 ok(/Coomecipar T537/.test(tx)&&/Atlántica T537/.test(tx)&&/ANDE KM 8 T537/.test(tx),'los tres aparecen en Compromisos registrados');
 ok(/7\.300\.000/.test(tx),'total por mes 1.200.000 + 5.000.000 + ≈1.100.000 = 7.300.000');
 // editar desde la lista
 await p.evaluate(()=>{ const tr=[...document.querySelectorAll('#tesoreria table.tes-t tr')].find(r=>/Atlántica T537/.test(r.textContent)); tr.querySelector('button').click(); }); await p.waitForTimeout(300);
 await fill({m:'5.500.000'}); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>window.__tes.st().cos.find(c=>/Atlántica T537/.test(c.det)).m)===5500000,'✏️ Editar desde la lista guarda el nuevo monto');
 // aparece en compromisos por semana / previsión
 const sem=await p.evaluate(()=>{ const u=window.__tes.ui; u.solo=''; u.tab='sem'; window.__tes.draw(); return document.getElementById('tesoreria').innerText; });
 ok(/1,2 M/.test(sem)&&/5,5 M/.test(sem),'la cuota del préstamo (1,2 M) y el alquiler (5,5 M) aparecen en 📆 Compromisos por semana');
 // pagar cuota
 const before=await p.evaluate(()=>{ const d=window.__tes.st().deu.find(x=>x.acr==='Coomecipar T537'); return {s:+d.saldo,f:+d.faltan,p:d.prox}; });
 await p.evaluate(()=>{ const u=window.__tes.ui; u.tab='deu'; window.__tes.draw(); }); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const T=window.__tes.st(); const i=T.deu.findIndex(x=>x.acr==='Coomecipar T537'); document.querySelector('#tesoreria [data-tx2="cuota"][data-i="'+i+'"]').click(); }); await p.waitForTimeout(300);
 miss=await fill({cta:'Efectivo / caja'}); await p.waitForTimeout(500);
 const after=await p.evaluate(()=>{ const d=window.__tes.st().deu.find(x=>x.acr==='Coomecipar T537'); return {s:+d.saldo,f:+d.faltan,p:d.prox}; });
 ok(after.s===before.s-1200000&&after.f===before.f-1&&after.p>before.p,'✅ Pagar cuota: baja el saldo, resta una cuota y pasa la próxima al mes siguiente '+JSON.stringify([before,after]));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
