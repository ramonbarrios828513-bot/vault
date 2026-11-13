const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(); T.cfg.emp=Object.assign(T.cfg.emp||{},{nom:'RAMON',ruc:'1234567',dv:'1'}); T.cfg.emp2={nom:'GISELE',ruc:'7654321',dv:'2'}; T.cfg.provRuc={'DROGUERIA B':'80033333-3'}; window.__ex.open(); }); await p.waitForTimeout(500);
 await p.setInputFiles('#extracto [data-exfile="xl"]',''+__dirname+'/fix/extB.xlsx'); await p.waitForTimeout(3500);
 const L=await p.evaluate(()=>window.__ex.d().L.map(l=>l.tipo+'|'+l.n+'|'+l.f+'|'+l.m)); console.log(L, await p.evaluate(()=>document.querySelector('#exInMsg').innerText));
 ok(L.length===2 && L[0]==='Factura|001-002-0000500|2026-09-03|4500000' && /^Nota de crédito\|001-002-0000020/.test(L[1]),'Excel .xlsx con Débito/Crédito y fechas');
 // foto sin escáner → mensaje claro
 await p.evaluate(()=>{ window.__aiVision=null; window.__aiVisionK=null; });
 await p.setInputFiles('#extracto [data-exfile="img"]',__dirname+'/fix/foto.png').catch(()=>{}); await p.waitForTimeout(1500);
 console.log(await p.evaluate(()=>document.querySelector('#exInMsg').innerText)); ok(await p.evaluate(()=>/escáner|leer|foto/i.test(document.querySelector('#exInMsg').innerText)),'foto: avisa si el aparato no tiene escáner');
 // factura con 4 fechas: RUC se completa solo; sin receptor no guarda
 await p.evaluate(()=>window.__ex.fac()); await p.waitForTimeout(400);
 await p.fill('.ico-ov [data-k="prov"]','DROGUERIA B'); await p.dispatchEvent('.ico-ov [data-k="prov"]','input'); await p.waitForTimeout(200);
 ok(await p.evaluate(()=>document.querySelector('.ico-ov [data-k="rucE"]').value==='80033333-3'),'RUC del proveedor se completa solo');
 await p.evaluate(()=>{ const o=document.querySelector('.ico-ov'); const s=(k,v)=>{ const e=o.querySelector('[data-k="'+k+'"]'); e.value=v; }; s('num','001-002-0000900'); s('monto','1.000.000'); s('f','2026-10-01'); s('vence','2026-11-30'); o.querySelector('[data-tx="ok"]').click(); }); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>/A NOMBRE DE QUIÉN/.test(document.querySelector('#txErr').textContent)),'sin «a nombre de» no guarda');
 await p.evaluate(()=>{ const o=document.querySelector('.ico-ov'); const sel=o.querySelector('[data-k="empR"]'); sel.selectedIndex=2; o.querySelector('[data-tx="ok"]').click(); }); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>{ const f=window.__tes.st().fac.find(x=>x.num==='001-002-0000900'); return f && f.rucR==='7654321-2' && f.rucE==='80033333-3'; }),'guardada a nombre de GISELE con RUC emisor');
 // lote con campos RUC
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(o=>o.remove()); window.__ex.open(); }); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>!!document.querySelector('#extracto [data-exk="rucE"]') && !!document.querySelector('#extracto [data-exk="rucR"]') && !!document.querySelector('#extracto [data-exk="L.0.ni"]') && !!document.querySelector('#extracto [data-exk="L.0.ent"]')),'una sola pantalla: RUC emisor y receptor + entrega + NC en la fila');
 // mis 2 empresas
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(o=>o.remove()); window.__tes.ui.tab='prov'; document.querySelectorAll('.big-ov').forEach(a=>a.hidden=true); window.__tes.open(); }); await p.waitForTimeout(600);
 const hasB=await p.evaluate(()=>!!document.querySelector('[data-rucb="emps"]')); ok(hasB,'botón 🏢 Mis 2 empresas en Proveedores');
 if(hasB){ await p.evaluate(()=>document.querySelector('[data-rucb="emps"]').click()); await p.waitForTimeout(400); ok(await p.evaluate(()=>document.querySelector('.ico-ov [data-k="r2"]').value==='7654321'),'formulario de 2 empresas con datos'); }
 console.log('errs',errs,'fallas',fail); await b.close(); })();
