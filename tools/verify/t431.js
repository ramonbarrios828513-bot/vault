// v1243 · 🧩 producto a la izquierda + sucursales al costado (tarjetas con ◀ ▶); el cursor no queda preso al final
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const A=window.__ar.st(); A.ven=Object.assign({},A.ven,{dias:90,s:{demo23:{'KM 7':900,'KM 8':1800,'Franco':450}}}); A.stk=Object.assign({},A.stk,{s:{demo23:{'KM 7':600,'KM 8':0,'Franco':60}}}); });
 await p.click('#articulos .cp-b.o'); await p.waitForTimeout(300); await p.fill('#plQ','distrimed'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200);
 ok(await p.evaluate(()=>{ const A=window.__ar.st(); return A.negs[A.ui.ng].view==='lin'; }),'«Preparar pedidos de las sucursales» abre en 📏 lineal (filas finas)'); await p.click('#articulos [data-ng="view"][data-v="tab3"]'); await p.waitForTimeout(600);
 const w='#articulos .ng-p3w[data-ngrowid="demo23"]';
 const n=await p.evaluate(w=>document.querySelectorAll(w+' .ng-sc').length,w); ok(n===4,'tarjetas: ⭐ KM 7, 🌐 GENERAL y cada sucursal al costado ('+n+')');
 await p.fill(w+' .ng-sc [data-k="qs:KM 8"]','12'); await p.fill(w+' .ng-sc [data-k="qs:Franco"]','3'); await p.waitForTimeout(300);
 ok(await p.inputValue(w+' .ng-p3 [data-k="q"]')==='15','lo que PIDE cada sucursal suma la cantidad (12 + 3 = 15)');
 ok(await p.evaluate(w=>document.querySelector(w+' [data-ngi$="|i:gq"]').innerText,w)==='15','la tarjeta GENERAL muestra lo que va al proveedor');
 ok(await p.evaluate(w=>!!document.querySelector(w+' .ng-scar[data-scr="1"]'),w),'◀ ▶ para recorrer las sucursales');
 const last=await p.evaluate(()=>{ const L=[...document.querySelectorAll('#articulos .ng-two [data-ngtab]')].filter(x=>!x.disabled&&!x.readOnly&&x.offsetParent!==null); const e=L[L.length-1]; e.focus(); return L.length; });
 await p.keyboard.press('Enter'); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.activeElement && document.activeElement.dataset.ng==='save'),'Enter en el último campo no queda preso: pasa a «💾 Guardar»');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
