const setup=require("./rvlib.js");
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>{ window.__vt.open(); }); await p.waitForTimeout(300);
 await p.evaluate(async()=>{ const wb=await (await fetch('/mig.json')).json(); window.__fichas.mig(wb); }); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const g=document.querySelector('[data-impgo]'); g&&g.click(); }); await p.waitForTimeout(20000);
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(o=>o.remove()); const v=document.getElementById('ventas'); if(v) v.hidden=true; window.__ar.open(); }); await p.waitForTimeout(2500);
 await p.evaluate(async()=>{ const b=[...document.querySelectorAll('#articulos .cp-b')].find(x=>/PREPARAR ORDEN/.test(x.textContent)); b.click(); await new Promise(r=>setTimeout(r,900)); const q=document.getElementById('plQ'); q.value='policlinica sa sr'; q.dispatchEvent(new Event('input')); await new Promise(r=>setTimeout(r,300)); document.querySelector('#plL [data-plp]').click(); });
 await p.waitForTimeout(5000);
 await p.evaluate(()=>{ const b=document.querySelector('#articulos [data-ng="view"][data-v="tab3"]'); b&&b.click(); }); await p.waitForTimeout(1500);
 // v1346 · 🎛️ vista «Fila simple + cuadros flotantes»
 let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
 await p.evaluate(()=>{ const b=document.querySelector('#articulos [data-ng="view"][data-v="flt"]'); b&&b.click(); }); await p.waitForTimeout(1500);
 // v1346 · 🚚 órdenes de transferencia en «📦 Solicitud y transferencia» y protección: no se compra menos que lo programado para transferir
 const rows=await p.evaluate(()=>[...document.querySelectorAll('#articulos [data-ngfrow]')].map(x=>x.dataset.ngfrow));
 const B='#articulos .ng-fbox';
 await p.click('#articulos [data-ngfrow="'+rows[4]+'"] [data-ngflt="suc"]'); await p.waitForTimeout(900);
 const sucs=await p.evaluate(b=>[...document.querySelectorAll(b+' [data-ngtrf]')].map(x=>x.dataset.suc),B);
 const set=async(sel,v)=>{ await p.fill(sel,v); await p.dispatchEvent(sel,'change'); await p.waitForTimeout(900); };
 await set(B+' [data-ngqs][data-suc="'+sucs[0]+'"]','60'); await set(B+' [data-ngqs][data-suc="'+sucs[1]+'"]','40');
 const r1=await p.evaluate(b=>{ const x=document.querySelector(b); return {t:[...x.querySelectorAll('[data-ngtrf]')].map(i=>i.value), q:x.querySelector('[data-k="q"]').value, conc:x.querySelector('.ng-fconc').innerText.replace(/\s+/g,' ')}; },B);
 console.log('   '+JSON.stringify(r1));
 ok(r1.t[0]==='60'&&r1.t[1]==='40','la transferencia de cada sucursal es igual a su solicitud por defecto (60 y 40)');
 ok(r1.q==='100'&&/conciliada[^\d]*100/.test(r1.conc)&&/transferencia: 100/.test(r1.conc),'solicitud conciliada = 100 · transferencias = 100 · se compran 100');
 await set(B+' [data-ngtrf][data-suc="'+sucs[0]+'"]','50');
 const r2=await p.evaluate(([b,su])=>{ const x=document.querySelector(b); const i=x.querySelector('[data-ngtrf][data-suc="'+su+'"]'); return {v:i.value, c:i.classList.contains('cambio'), s:x.querySelector('[data-ngqs][data-suc="'+su+'"]').value, q:x.querySelector('[data-k="q"]').value, cen:x.innerText.includes('Queda en la central')}; },[B,sucs[0]]);
 ok(r2.v==='50'&&r2.c&&r2.s==='60'&&r2.q==='100','mandar menos: la transferencia queda en 50 (marcada) y la solicitud sigue en 60 como referencia; la compra no cambia');
 ok(r2.cen,'muestra «Queda en la central» (lo que no se transfiere queda en la central)');
 await set(B+' [data-ngtrf][data-suc="'+sucs[1]+'"]','200');
 const r3=await p.evaluate(b=>[...document.querySelectorAll(b+' [data-ngtrf]')].map(i=>i.value),B);
 ok(r3[1]==='40'&&await p.evaluate(()=>/no pueden pasar lo que se compra/.test(document.body.innerText)),'no deja transferir más de lo que se compra (200 > 100): avisa y vuelve a 40');
 // ⭐ aceptar 80 del proveedor con 90 en transferencias → bloquea
 await p.click(B+' [data-ngflt="neg"]'); await p.waitForTimeout(800); await p.click(B+' [data-ngesp]'); await p.waitForTimeout(900);
 await p.evaluate(()=>{ const o=document.querySelector('.ng-espop'); o.querySelector('[data-ep="min"]').value='80'; o.querySelector('[data-ep="d.d1"]').value='30'; o.querySelector('[data-ep="reg"]').checked=false; o.querySelector('[data-epq="acc"]').checked=true; o.querySelector('[data-epok]').click(); }); await p.waitForTimeout(900);
 const r4=await p.evaluate(()=>({pop:!!document.querySelector('.ng-espop'), msg:/No se puede comprar 80 cajas: hay 90 en órdenes de transferencia/.test(document.body.innerText)}));
 ok(r4.pop&&r4.msg,'comprar 80 con 90 en transferencias: ⛔ no deja y avisa «primero bajá la solicitud o la transferencia»');
 await p.evaluate(()=>{ const x=document.querySelector('.ng-espop [data-epx]'); x&&x.click(); }); await p.waitForTimeout(500);
 await p.screenshot({path:'/tmp/claude-0/t616.png'});
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 await b.close(); console.log(fail?'fallas '+fail:'✔ t616 ok'); process.exit(fail?1:0); })();
