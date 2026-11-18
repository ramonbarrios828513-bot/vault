// v1261 · 📘 Metodología paso a paso (de crear un funcionario hasta pagarle) y guía 👁 de botones de los días
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1200); await p.evaluate(()=>document.querySelectorAll('.k-party').forEach(x=>x.remove()));
 ok(await p.evaluate(()=>!!document.querySelector('#planilla .pl-metb')),'la planilla tiene el botón 📘 Metodología');
 ok(await p.evaluate(()=>!!document.querySelector('#planilla details.pl-leg')),'la planilla de días tiene la guía 👁 de botones');
 await p.evaluate(()=>document.querySelector('#planilla .pl-metb').click()); await p.waitForTimeout(400);
 const t=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); return o?o.textContent:''; });
 ok(/Crear el funcionario/.test(t)&&/Pagar/.test(t)&&/Aplicar/.test(t),'la metodología explica desde crear el funcionario hasta pagarle');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
