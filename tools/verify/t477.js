// v1261 · 🧮 contador de billetes en Efectivo, Inicio del turno y Deja para el próximo turno
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(700);
 const n=await p.evaluate(()=>['v.ef','ini','deja'].filter(k=>document.querySelector('#cierre [data-czden="'+k+'"]')).join(','));
 ok(n==='v.ef,ini,deja','los tres campos tienen «🧮 Contar billetes» ('+n+')');
 await p.click('#cierre [data-czden="v.ef"]'); await p.waitForTimeout(300);
 await p.fill('.ico-ov [data-dnd="100000"]','3'); await p.fill('.ico-ov [data-dnd="5000"]','2'); await p.waitForTimeout(200);
 await p.click('.ico-ov [data-dn="ok"]'); await p.waitForTimeout(700);
 const v=await p.evaluate(()=>document.querySelector('#cierre input[data-czk="v.ef"]').value);
 ok(/310\.000/.test(v),'el total (3×100.000 + 2×5.000) pasó a Efectivo ('+v+')');
 await p.click('#cierre [data-czden="deja"]'); await p.waitForTimeout(300); await p.fill('.ico-ov [data-dnd="50000"]','1'); await p.click('.ico-ov [data-dn="ok"]'); await p.waitForTimeout(700);
 const d=await p.evaluate(()=>document.querySelector('#cierre input[data-czk="deja"]').value+'|'+document.querySelector('#cierre input[data-czk="v.ef"]').value);
 ok(/^50\.000\|310\.000/.test(d),'«Deja para el próximo turno» con su propio conteo, sin tocar Efectivo ('+d+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
