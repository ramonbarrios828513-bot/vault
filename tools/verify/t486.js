// v1262 · 📘 guía paso a paso del cierre de caja (para quien carga cierres)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(800);
 ok(await p.evaluate(()=>!!document.querySelector('#cierre .cz-metb')),'el cierre tiene el botón 📘 Cómo cargar un cierre');
 await p.click('#cierre .cz-metb'); await p.waitForTimeout(400);
 const t=await p.evaluate(()=>([...document.querySelectorAll('.ico-ov')].pop()||{}).textContent||'');
 ok(/N\.º de turno/.test(t)&&/CRÉDITO/.test(t)&&/Guardar turno/.test(t),'la guía explica desde el N.º de turno hasta guardar');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
