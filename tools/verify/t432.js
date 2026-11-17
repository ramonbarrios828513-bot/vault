// v1243 · ⬅ Volver dentro de una orden vuelve a los botones grandes de Compras (no sale del módulo)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos .cp-b.g'); await p.waitForTimeout(300); await p.fill('#plQ','distrimed'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200);
 ok(await p.evaluate(()=>{ const c=document.querySelector('#articulos .cp-home'); return !c || getComputedStyle(c).display==='none'; }),'dentro de la orden no se ven los botones grandes');
 await p.click('#vxBack'); await p.waitForTimeout(600);
 ok(await p.evaluate(()=>{ const a=document.getElementById('articulos'); const c=a && a.querySelector('.cp-home'); return a && !a.hidden && c && getComputedStyle(c).display!=='none'; }),'⬅ Volver (flotante) vuelve a «¿Qué querés hacer?» sin salir de Compras');
 await p.click('#articulos .cp-b.v'); await p.waitForTimeout(500); await p.click('#articulos [data-ar="x"] >> nth=0'); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>{ const a=document.getElementById('articulos'); return a && !a.hidden && !!a.querySelector('.cp-home'); }),'desde «Mis órdenes», ← Volver también vuelve a los botones');
 await p.click('#articulos [data-ar="x"] >> nth=0'); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>{ const a=document.getElementById('articulos'); return !a || a.hidden; }),'desde los botones, Volver recién sale del módulo');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
