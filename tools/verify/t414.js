// v1233 · 🤝 bloque «Negociación del pedido» en el encabezado (contado y retorno generales, condiciones con alcance y ⭐ trato especial) · Enter salta dentro del producto
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos .cp-b.g'); await p.waitForTimeout(300); await p.fill('#plQ','distri'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200); await p.click('#articulos [data-ng="view"][data-v="tab2"]').catch(()=>{}); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>{ const h=document.querySelector('#articulos .ng-hneg'); return h && /NEGOCIACIÓN DEL PEDIDO/.test(h.innerText) && h.getBoundingClientRect().top < document.querySelector('#articulos .ng-two').getBoundingClientRect().top; }),'arriba de los productos hay un bloque aparte (violeta) «NEGOCIACIÓN DEL PEDIDO»');
 const ids=await p.evaluate(()=>[...document.querySelectorAll('#articulos .ng-p2')].map(x=>x.dataset.ngrowid));
 const r=id=>`#articulos [data-ngrowid="${id}"]`;
 await p.fill(r(ids[0])+' [data-k="pvp"]','10000'); await p.press(r(ids[0])+' [data-k="pvp"]','Enter'); await p.waitForTimeout(200);
 const nxt=await p.evaluate(()=>{ const a=document.activeElement; return a.dataset.k+'|'+a.closest('[data-ngrowid]').dataset.ngrowid; });
 ok(nxt.split('|')[1]===ids[0] && nxt.split('|')[0]!=='pvp','Enter salta al campo siguiente DEL MISMO producto ('+nxt.split('|')[0]+')');
 // política: d1 30 a todos
 await p.evaluate(()=>{ const d=document.querySelector('#articulos details[data-ngdt="pol"]'); d.open=true; });
 await p.fill('#articulos [data-ngpol="d1"]','30'); await p.click('#articulos [data-ng="pol"][data-m="vac"]'); await p.waitForTimeout(600);
 // contado general
 await p.selectOption('#articulos .ng-hneg [data-ngh="contado"]','1'); await p.waitForTimeout(500);
 await p.fill('#articulos .ng-hneg [data-ngh="hcd"]','5'); await p.press('#articulos .ng-hneg [data-ngh="hcd"]','Tab'); await p.waitForTimeout(600);
 const fac0=await p.evaluate(id=>document.querySelector(`#articulos [data-ngrowid="${id}"] [data-ngcv$="|fac"]`).innerText,ids[0]); console.log('   costo con contado general: '+fac0);
 ok(fac0==='6.650','el desc. contado general 5 % se aplica a los productos sin su propio % (10.000 −30 % −5 % = 6.650)');
 // trato especial en producto 1 con mínimo 50 y cantidad 10
 await p.click(r(ids[0])+' [data-ngesp]'); await p.waitForTimeout(500); /* v1343: ⭐ especial vacía los descuentos y el trato se carga en los mismos cuadros */ await p.fill(r(ids[0])+' [data-k="d1"]','30'); await p.press(r(ids[0])+' [data-k="d1"]','Tab'); await p.waitForTimeout(300); await p.fill(r(ids[0])+' [data-k="min"]','50'); await p.press(r(ids[0])+' [data-k="min"]','Tab'); await p.waitForTimeout(300);
 await p.fill(r(ids[0])+' [data-k="q"]','10'); await p.press(r(ids[0])+' [data-k="q"]','Tab'); await p.waitForTimeout(300);
 // condición: si total llega a 1 → 3 % factura a todos menos especiales; y además especiales deben llegar
 await p.fill('#articulos .ng-hneg [data-ngc="0"][data-k="d"]','1'); await p.press('#articulos .ng-hneg [data-ngc="0"][data-k="d"]','Tab'); await p.waitForTimeout(400);
 await p.fill('#articulos .ng-hneg [data-ngc="0"][data-k="p"]','3'); await p.press('#articulos .ng-hneg [data-ngc="0"][data-k="p"]','Tab'); await p.waitForTimeout(400);
 await p.selectOption('#articulos .ng-hneg [data-ngc="0"][data-k="req"]','espmin'); await p.waitForTimeout(600);
 let t=await p.evaluate(()=>document.querySelector('#articulos .ng-hneg').innerText.replace(/\n/g,' ')); console.log('   '+t.slice(-220));
 ok(/no llegan a su cantidad/.test(t),'si un ⭐ especial no llega a su cantidad, la condición no se cumple y avisa cuál');
 await p.fill(r(ids[0])+' [data-k="q"]','50'); await p.press(r(ids[0])+' [data-k="q"]','Tab'); await p.waitForTimeout(300); await p.evaluate(()=>window.__ar.st()&&0); await p.click('#articulos [data-ng="save"]').catch(()=>{}); await p.waitForTimeout(600);
 await p.selectOption('#articulos .ng-hneg [data-ngc="0"][data-k="ap"]','sinesp'); await p.waitForTimeout(600);
 t=await p.evaluate(()=>document.querySelector('#articulos .ng-hneg').innerText.replace(/\n/g,' '));
 ok(/Se cumple: −3% en la factura/.test(t) && /aplica a \d+ de \d+ productos/.test(t),'cuando llega: −3 % a todos MENOS los especiales');
 const f0=await p.evaluate(id=>document.querySelector(`#articulos [data-ngrowid="${id}"] [data-ngcv$="|fac"]`).innerText,ids[0]), f1=await p.evaluate(id=>document.querySelector(`#articulos [data-ngrowid="${id}"] [data-ngcv$="|fac"]`).innerText,ids[1]);
 console.log('   especial: '+f0+' · otro: '+f1); ok(f0==='6.650','el ⭐ especial NO recibe el 3 % extra');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
