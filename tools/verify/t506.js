// v1273 · Orden de compra: cada fila elige si se negocia desde el PÚBLICO o desde el COSTO; la factura viene a nombre de una de tus empresas (con RUC). Factura: escribir el RUC receptor elige la empresa sola y el RUC emisor completa el proveedor
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(); T.cfg.emp=Object.assign(T.cfg.emp||{},{nom:'RAMON',ruc:'1234567',dv:'1'}); T.cfg.emp2={nom:'GISELE',ruc:'7654321',dv:'2'}; T.cfg.provRuc={'DROGUERIA B':'80033333-3'}; });
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos .cp-b.g'); await p.waitForTimeout(300); await p.fill('#plQ','distri'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200); await p.click('#articulos [data-ng="view"][data-v="tab2"]').catch(()=>{}); await p.waitForTimeout(500);
 const emp=await p.evaluate(()=>[...document.querySelectorAll('#articulos [data-ngh="emp"] option')].map(o=>o.textContent)); ok(emp.some(x=>/RAMON · RUC 1234567-1/.test(x))&&emp.some(x=>/GISELE · RUC 7654321-2/.test(x)),'«La factura viene a nombre de» = elegir Ramón o Gisele con su RUC '+JSON.stringify(emp));
 await p.selectOption('#articulos [data-ngh="emp"]','GISELE'); await p.waitForTimeout(300);
 const nr=await p.evaluate(()=>{ const N=(window.__ar.st().negs||{}); const k=Object.keys(N); const x=k.map(i=>N[i]).find(n=>n.emp==='GISELE'); return x&&x.rucR; }); ok(nr==='7654321-2','la orden guarda el RUC receptor de Gisele ('+nr+')');
 const ids=await p.evaluate(()=>[...document.querySelectorAll('#articulos [data-ngrowid]')].map(x=>x.dataset.ngrowid).filter((x,i,a)=>a.indexOf(x)===i));
 const r=id=>`#articulos [data-ngrowid="${id}"]`;
 const hasModo=await p.evaluate(id=>!!document.querySelector(`#articulos [data-ngrowid="${id}"] [data-k="modo"]`),ids[0]); ok(hasModo,'cada fila tiene «⚖️ Se negocia desde» (público / costo)');
 await p.selectOption(r(ids[1])+' [data-k="modo"]','costo'); await p.waitForTimeout(700);
 const hasCb=await p.evaluate(id=>!!document.querySelector(`#articulos [data-ngrowid="${id}"] [data-k="cb"]`)&&!!document.querySelector(`#articulos [data-ngrowid="${id}"] [data-k="dobj"]`),ids[1]);
 if(!hasCb){ await p.evaluate(()=>{ const c=document.querySelector('#articulos [data-ngcol="cb"]'); if(c&&!c.checked){c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));} }); await p.waitForTimeout(500); await p.evaluate(()=>{ const c=document.querySelector('#articulos [data-ngcol="dobj"]'); if(c&&!c.checked){c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));} }); await p.waitForTimeout(700); }
 await p.fill(r(ids[1])+' [data-k="cb"]','10000'); await p.dispatchEvent(r(ids[1])+' [data-k="cb"]','input'); await p.fill(r(ids[1])+' [data-k="dobj"]','60'); await p.dispatchEvent(r(ids[1])+' [data-k="dobj"]','input'); await p.waitForTimeout(400);
 const g=await p.evaluate(id=>{ const e=document.querySelector(`#articulos [data-ngpvpg="${id}"]`); return e&&e.textContent; },ids[1]); ok(g==='25.000','fila desde el COSTO: costo 10.000 y 60 % → PVP generado 25.000 ('+g+')');
 const m0=await p.evaluate(id=>document.querySelector(`#articulos [data-ngrowid="${id}"] [data-k="modo"]`).value,ids[0]); ok(m0==='pvp','la otra fila del mismo proveedor sigue desde el PÚBLICO');
 // factura: RUC receptor escrito → elige la empresa; RUC emisor → completa el proveedor
 await p.evaluate(()=>window.__ex.open()); await p.waitForTimeout(400); await p.evaluate(()=>window.__ex.fac()); await p.waitForTimeout(400);
 await p.fill('.ico-ov [data-k="rucE"]','80033333-3'); await p.dispatchEvent('.ico-ov [data-k="rucE"]','input'); await p.waitForTimeout(200);
 const pv=await p.evaluate(()=>document.querySelector('.ico-ov [data-k="prov"]').value); ok(pv==='DROGUERIA B','escribir el RUC emisor completa el proveedor ('+pv+')');
 await p.fill('.ico-ov [data-k="rucRq"]','7654321-2'); await p.dispatchEvent('.ico-ov [data-k="rucRq"]','input'); await p.waitForTimeout(200);
 const er=await p.evaluate(()=>({sel:document.querySelector('.ico-ov [data-k="empR"]').value, tag:(document.querySelector('.ico-ov .tx-rucok:last-of-type')||{}).textContent}));
 ok(/GISELE/.test(er.sel),'escribir el RUC receptor elige a GISELE con sus datos '+JSON.stringify(er));
 await p.fill('.ico-ov [data-k="rucRq"]','9999999-9'); await p.dispatchEvent('.ico-ov [data-k="rucRq"]','input'); await p.waitForTimeout(200);
 const bad=await p.evaluate(()=>[...document.querySelectorAll('.ico-ov .tx-rucok')].map(x=>x.textContent).join('|')); ok(/no es de ninguna/.test(bad),'un RUC que no es tuyo avisa: '+bad);
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
