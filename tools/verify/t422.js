// v1236 · un descuento de 1 % es 1 % (antes 1 se tomaba como 100 % y borraba el costo)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos .cp-b.g'); await p.waitForTimeout(300); await p.fill('#plQ','distrimed'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200);
 const r='#articulos [data-ngrowid="demo23"]';
 await p.fill(r+' [data-k="q"]','1'); await p.fill(r+' [data-k="pvp"]','10000'); await p.selectOption(r+' [data-k="pago"]','contado'); await p.fill(r+' [data-k="cd"]','1'); await p.waitForTimeout(300);
 const f=await p.evaluate(r=>document.querySelector(r+' [data-ngcv$="|fac"]').innerText,r); console.log('   costo con contado 1 %: '+f);
 ok(f==='9.900','contado 1 % → costo 9.900 (no borra el costo)');
 await p.fill(r+' [data-k="d1"]','1'); await p.waitForTimeout(300);
 const f2=await p.evaluate(r=>document.querySelector(r+' [data-ngcv$="|fac"]').innerText,r); console.log('   + desc. 1 de 1 %: '+f2);
 ok(f2==='9.801','desc. 1 de 1 % + contado 1 % → 9.801');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
