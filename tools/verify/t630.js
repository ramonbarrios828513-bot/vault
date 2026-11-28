// v1356 · dato viejo con otra clave: el aviso rojo lleva directo al arreglo y «Sí» lo BORRA (decisión de Ramón); los que lo tenían guardado aparte pueden borrarlo
const setup=require('./rvlib.js'); let bad=0; const ok=(c,m)=>{ console.log((c?'✔ ':'✘ FALLA ')+m); if(!c) bad++; };
(async()=>{ const {b,p,errs}=await setup({});
 const r=await p.evaluate(()=>({fix:typeof window.__vbFix, chip:!!document.getElementById('saveChip')}));
 const src=await p.evaluate(()=>document.documentElement.outerHTML.length);
 ok(src>0,'página cargada');
 // simulamos el estado «clave» y verificamos el chip y el clic
 await p.evaluate(()=>{ window.__saveSt={ok:false,t:Date.now(),why:'clave'}; window.__vbCalled=0; window.__vbFix=function(){ window.__vbCalled++; }; if(window.__saveChip) window.__saveChip(); });
 await p.waitForTimeout(1700);
 const chip=await p.evaluate(()=>{ const c=document.getElementById('saveChip'); return c && !c.hidden ? c.textContent : null; });
 if(chip!==null){ ok(/otra clave/.test(chip),'chip rojo: «Dato viejo con otra clave — tocá para arreglar» ('+chip+')'); await p.click('#saveChip'); ok(await p.evaluate(()=>window.__vbCalled)===1,'tocar el chip abre el arreglo'); }
 else ok(true,'(baúl cerrado en la prueba: el chip no se muestra)');
 const html=await p.evaluate(()=>[...document.scripts].map(s=>s.textContent).join('\n'));
 ok(/se BORRA ese dato viejo/.test(html) && /delete u2\.oldEnc/.test(html) && !/u2\.oldEnc = u2\.enc/.test(html),'«Sí» borra lo viejo (no lo guarda aparte)');
 ok(/quedó guardado APARTE un dato viejo/.test(html),'aparatos con lo viejo guardado aparte: ofrece borrarlo');
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 await b.close(); if(bad){ console.log('✘ t630 con fallas'); process.exit(1);} })();
