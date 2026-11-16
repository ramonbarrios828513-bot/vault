// v1229 · 🧮 calculadora rápida de compra: botón flotante en compras/Gestión de cheques, busca producto o proveedor, calcula al instante y agrega a la orden
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos [data-ar="x"]'); await p.waitForTimeout(300); await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(1200);
 ok(await p.evaluate(()=>{ const f=document.getElementById('qcFab'); return f && !f.hidden; }),'en Gestión de cheques aparece el botón flotante 🧮');
 await p.click('#qcFab'); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>document.activeElement && document.activeElement.id==='qcQ'),'abre la calculadora con el cursor en el buscador');
 await p.fill('#qcQ','indufar'); await p.waitForTimeout(200);
 const pv=await p.evaluate(()=>document.querySelector('#qcF').innerText); ok(/Proveedor: Indufar/.test(pv) && (pv.match(/Indufar/g)||[]).length>3,'buscando por PROVEEDOR muestra sus productos');
 await p.fill('#qcQ','metf'); await p.waitForTimeout(150); await p.press('#qcQ','Enter'); await p.waitForTimeout(300);
 ok(/Metformina/.test(await p.evaluate(()=>document.querySelector('.qc-x').innerText)),'Enter elige el primer producto (Metformina)');
 for(const [k,v] of [['d1','30'],['d2','10'],['bc','10'],['br','1'],['nc','3']]){ await p.fill(`#qcOv [data-qv="${k}"]`,v); }
 await p.waitForTimeout(200);
 const r=await p.evaluate(()=>document.querySelector('#qcR').innerText.replace(/\n/g,' ')); console.log('   '+r.slice(0,300));
 ok(/COSTO FINAL por caja/.test(r) && /DESCUENTO REAL/.test(r) && /Ganancia por caja/.test(r),'muestra costo final, descuento real y ganancia al instante');
 ok(await p.evaluate(()=>document.activeElement && document.activeElement.dataset.qv==='nc'),'no pierde el cursor mientras escribís');
 await p.click('#qcOv [data-qc="add"]'); await p.waitForTimeout(500);
 const ng=await p.evaluate(()=>{ const A=window.__ar.st(); return Object.values(A.negs).filter(n=>!n.del&&n.prov==='Distrimed').map(n=>n.lines.length+':'+(n.v.demo23||{}).d1); });
 ok(ng.length===1 && ng[0]==='1:30','«Agregar a la orden» crea/usa la orden del proveedor con los descuentos cargados ('+ng.join()+')');
 await p.click('#qcOv [data-qc="ords"]'); await p.waitForTimeout(800);
 ok(await p.evaluate(()=>/Distrimed/.test(document.querySelector('#articulos').innerText) && !!document.querySelector('#articulos .ng-card')),'«Ver órdenes» abre esa orden');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
