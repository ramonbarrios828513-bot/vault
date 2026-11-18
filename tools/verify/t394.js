// v1227 · proveedores de Gestión de cheques en el extracto (lista visible) y en negociaciones; botón 🤝 Negociaciones dentro de Gestión de cheques → Proveedores
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1300,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(); T.chq.push({id:'pp1',prov:'DISTRIMED',cta:'Basa-G',num:'9',monto:1000,co:'2026-12-01',st:'pend'}); T.cfg.provc=T.cfg.provc||{}; T.cfg.provc['PROVEEDOR SIN CHEQUES']={}; window.__tes.save(); });
 await p.evaluate(()=>window.__ex.open()); await p.waitForTimeout(800);
 const opts=await p.evaluate(()=>[...document.querySelectorAll('#extracto [data-exprovsel] option')].map(o=>o.value)); ok(opts.includes('DISTRIMED') && opts.includes('PROVEEDOR SIN CHEQUES'),'el extracto muestra la lista de proveedores de Gestión de cheques');
 await p.selectOption('#extracto [data-exprovsel]','DISTRIMED'); await p.waitForTimeout(500); ok(await p.evaluate(()=>document.querySelector('#extracto [data-exk="prov"]').value)==='DISTRIMED','elegir de la lista completa el proveedor');
 await p.evaluate(()=>document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true)); await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(800);
 const bt=await p.$('#tesoreria [data-arneg]'); ok(!!bt,'botón 🤝 Negociaciones en Gestión de cheques → Proveedores'); if(bt){ await bt.click(); await p.waitForTimeout(1500); }
 ok(await p.evaluate(()=>!document.getElementById('articulos').hidden && /Negociaciones y órdenes de compra/.test(document.getElementById('articulos').innerText)),'abre Negociaciones');
 await p.click('#articulos [data-ng="new"]'); await p.waitForTimeout(300); ok(await p.evaluate(()=>[...document.querySelectorAll('#ngProvL option')].some(o=>o.value==='DISTRIMED')),'en la negociación aparecen los proveedores de Gestión de cheques');
 await p.evaluate(()=>document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true)); await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(800);
 await p.click('#tesoreria [data-rucb="emps"]'); await p.waitForTimeout(600); const ft=await p.evaluate(()=>document.body.innerText); ok(/Mis empresas/.test(ft) && /Agregar otra empresa/.test(ft),'«🏢 Mis empresas» pide nombre, razón social, titular, RUC y dígito de las dos empresas');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
