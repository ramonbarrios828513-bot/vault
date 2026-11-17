// v1233 · etiquetas del producto (categoría, clasificación, controlado, antibiótico, receta) · días por producto y por sucursal · giro de N días · «cubre N días» con lo pedido
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const A=window.__ar.st(); A.ven=Object.assign({},A.ven,{dias:90,s:{demo23:{'KM 7':900,'KM 8':1800}}}); A.stk=Object.assign({},A.stk,{s:{demo23:{'KM 7':300,'KM 8':0}}}); });
 await p.click('#articulos .cp-b.o'); await p.waitForTimeout(300); await p.fill('#plQ','distrimed'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200); await p.click('#articulos [data-ng="view"][data-v="tab2"]').catch(()=>{}); await p.waitForTimeout(500);
 const r='#articulos [data-ngrowid="demo23"]';
 const bd=await p.evaluate(r=>document.querySelector(r+' .ng-bdg').innerText,r); console.log('   '+bd.replace(/\n/g,' '));
 ok(/Medicamento/.test(bd)&&/Diabetes/.test(bd)&&/Receta simple/.test(bd),'al lado del producto: categoría, clasificación y tipo de receta');
 const bq=await p.evaluate(()=>{ const x=[...document.querySelectorAll('#articulos .ng-p2')].find(e=>/Quetiapina/.test(e.innerText)); return x? x.querySelector('.ng-bdg').innerText:''; });
 ok(/Controlado/.test(bq)&&/cuadruplicada/i.test(bq),'controlado con receta cuadruplicada se ve en la fila');
 const lab=()=>p.evaluate(r=>[...document.querySelectorAll(r+' .ng-f small, '+r+' .ng-gc small')].map(x=>x.innerText).join('|'),r);
 ok(/Giro mes/.test(await lab()) && /Sugerido 90 d/.test(await lab()),'el giro se muestra por mes y el sugerido para los días elegidos (90)');
 await p.fill(r+' [data-k="dias"]','30'); await p.waitForTimeout(300);
 ok(/Sugerido 30 d/.test(await lab()),'cambiando los días de ESTE producto a 30 cambia su sugerido al instante');
 const g30=await p.evaluate(r=>document.querySelector(r+' [data-ngi$="|i:giro"]').innerText,r); console.log('   giro 30 d: '+g30);
 ok(g30==='90','Metformina: vende 270 cajas en 90 días → 90 cajas en 30 días');
 // por sucursal: KM 8 vende 1800/90 = 20 u/día = 0,67 cj/día; días KM 8 = 45 → venta 30 cj
 await p.fill(r+' [data-k="qd:KM 8"]','45'); await p.waitForTimeout(300);
 const v8=await p.evaluate(r=>document.querySelector(r+' [data-ngi$="|i:sucn:KM 8"]').innerText,r), ph=await p.getAttribute(r+' [data-k="qs:KM 8"]','placeholder');
 console.log('   KM 8 venta en 45 d: '+v8+' · '+ph); ok(v8==='30' && ph==='sug. 30','cada sucursal con sus días: KM 8 a 45 días → venta 30 cajas y sugiere 30');
 await p.fill(r+' [data-k="qs:KM 8"]','30'); await p.fill(r+' [data-k="qs:KM 7"]','0'); await p.waitForTimeout(300);
 const cb=await p.evaluate(r=>[document.querySelector(r+' [data-ngi$="|qc:KM 8"]').innerText, document.querySelector(r+' [data-ngi$="|i:cub"]').innerText],r); console.log('   cubre KM 8: '+cb[0]+' · total: '+cb[1]);
 ok(cb[0]==='45 d' && /\d+ d/.test(cb[1]),'con lo pedido muestra para cuántos días cubre (KM 8: 45 d) y el total');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
