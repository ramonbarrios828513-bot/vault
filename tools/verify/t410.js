// v1229 · 🏪 pedir por sucursal en la fila: cada local carga su cantidad, el total se suma solo (conciliado) y el sugerido por sucursal
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>(window.__ar.st().ui.ngOpen={cols:true,pol:true,mon:true,tools:true}, window.__ar.open())); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const A=window.__ar.st(); A.ven=Object.assign({},A.ven,{dias:90,s:{demo23:{'KM 7':900,'Franco':300,'KM 8':1500}}}); A.stk=Object.assign({},A.stk,{s:{demo23:{'KM 7':600,'Franco':30,'KM 8':90}}}); });
 await p.click('#articulos [data-ar="tab"][data-v="neg"]'); await p.waitForTimeout(300); await p.click('#articulos [data-ng="new"]'); await p.waitForTimeout(300);
 for(const w of ['metf','omep','lora','aspi']){ await p.fill('#articulos [data-ngadd]',w); await p.press('#articulos [data-ngadd]','Enter'); await p.waitForTimeout(350); } await p.click('#articulos [data-ng="view"][data-v="tab"]').catch(()=>{}); await p.waitForTimeout(300); for(const c of ['i:sucs','i:sucg','i:sucv']){ await p.check('#articulos [data-ngcol="'+c+'"]'); await p.waitForTimeout(250); }
 await p.check('#articulos [data-ngcol="i:ped"]'); await p.waitForTimeout(400);
 const hh=await p.evaluate(()=>[...document.querySelectorAll('#articulos .ng-tab thead th')].map(x=>x.innerText.replace(/\n/g,' ')).join(' | ')); console.log('   '+hh);
 ok(/giro mes km 8/i.test(hh) && /venta 90 d km 8/i.test(hh),'columnas de giro mes y venta en los X días por sucursal');
 const vk=await p.evaluate(()=>{ const r=document.querySelector('#articulos .ng-tab tr[data-ngrowid="demo23"]'); const ths=[...document.querySelectorAll('#articulos .ng-tab thead th')].map(x=>x.innerText.toLowerCase()); const i=ths.findIndex(x=>/venta 90 d km 8/.test(x)); return r.querySelectorAll('td')[i].innerText; }); ok(vk==='50','venta de KM 8 en 90 días = 1.500 u. ÷ 30 = 50 cajas ('+vk+')');
 const row='#articulos .ng-tab tr[data-ngrowid="demo23"]';
 ok(await p.evaluate(r=>!!document.querySelector(r+' [data-k="qs:KM 7"]') && !!document.querySelector(r+' [data-k="qs:Franco"]'),row),'cada sucursal tiene su columna «Pedir»');
 ok(/sug\. \d+/.test(await p.getAttribute(row+' [data-k="qs:KM 8"]','placeholder')),'muestra el sugerido de esa sucursal');
 await p.fill(row+' [data-k="qs:KM 7"]','10'); await p.fill(row+' [data-k="qs:KM 8"]','5'); await p.waitForTimeout(300);
 ok(await p.inputValue(row+' [data-k="q"]')==='15' && await p.evaluate(r=>document.querySelector(r+' [data-k="q"]').readOnly,row),'la cantidad total se suma sola (10 + 5 = 15) y no se toca a mano');
 await p.press(row+' [data-k="qs:KM 7"]','ArrowDown'); await p.waitForTimeout(200);
 ok(await p.evaluate(()=>document.activeElement.dataset.k==='qs:KM 7' && document.activeElement.closest('tr').dataset.ngrowid!=='demo23'),'Flecha ↓ baja a la misma sucursal del producto siguiente');
 await p.click('#articulos [data-ng="sug"]'); await p.waitForTimeout(500);
 const fr=await p.inputValue(row+' [data-k="qs:Franco"]'); ok(+fr>0 && await p.inputValue(row+' [data-k="qs:KM 7"]')==='10','«Usar el sugerido» completa solo las sucursales vacías (Franco '+fr+', KM 7 queda 10)');
 const N=await p.evaluate(()=>{ const A=window.__ar.st(); const n=Object.values(A.negs).find(x=>!x.del&&x.lines.some(l=>l.id==='demo23')); const L=n.lines.find(l=>l.id==='demo23'); return JSON.stringify({q:L.q,qs:L.qs}); });
 ok(/"KM 7":"10"/.test(N),'se guarda lo de cada sucursal en la orden '+N);
 await p.click('#articulos [data-tr="open"]'); await p.waitForTimeout(400); const tr=await p.evaluate(()=>document.getElementById('trOv').innerText.replace(/\n/g,' ')); console.log('   '+tr.slice(0,260));
 ok(/orden de compra es una sola/i.test(tr) && /KM 7 · 1 producto/.test(tr) && /Franco/.test(tr) && /Conciliado/.test(tr),'«🚚 Transferencias por sucursal»: una por local con lo que pidió y el total conciliado');
 await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok(await p.evaluate(()=>document.getElementById('trOv').hidden),'Esc la cierra');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
