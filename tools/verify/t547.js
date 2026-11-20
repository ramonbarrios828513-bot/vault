// v1306 · pago combinado, cada producto independiente: por cada producto vale el MENOR descuento de la lista de hoy entre todas las formas de pago (no solo las que usa el cliente); la pantalla lo muestra producto por producto
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); window.__vt.open(); const V=window.__vt.st(); V.open=true; V.pr.promos=[{on:true,fp:'tc',bk:'Itaú',pct:18,dias:[0,1,2,3,4,5,6],todos:true}]; const t=V.tabs[0]; V.cur=t.id; t.cat='cd'; t.fp='ef'; t.bk='Itaú'; t.lines=[{aid:'m1',n:'Kitadol prueba',q:1,pvp:100000,uq:1,cost:35000},{aid:'m2',n:'Zetamol prueba',q:1,pvp:50000,uq:1,cost:30000}]; window.__vt.open(); });
 await p.waitForTimeout(250); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="addp"]'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const sel=[...document.querySelectorAll('.vt-ov [data-pf]')].find(s=>s.value!=='ef'); if(sel.value!=='tc'){ sel.value='tc'; sel.dispatchEvent(new Event('change',{bubbles:true})); } }); await p.waitForTimeout(250);
 await p.evaluate(()=>{ const sel=[...document.querySelectorAll('.vt-ov [data-pb]')][0]; if(sel){ sel.value='Itaú'; sel.dispatchEvent(new Event('change',{bubbles:true})); } }); await p.waitForTimeout(250);
 const r=await p.evaluate(()=>({tot:document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,'')*1, tb:[...document.querySelectorAll('.vt-ov [data-mixtb] tr')].map(t=>t.innerText.replace(/\s+/g,' ')), mix:(document.querySelector('.vt-ov .vt-mix')||{}).textContent||''}));
 console.log(r.tb.join('\n'));
 ok(r.tot===132000,'total combinado = menor de hoy de cada producto: Kitadol 17 % (83.000) + Zetamol 2 % (49.000) = 132.000, aunque pague con efectivo (20 % / 5 %) y crédito Itaú en promo (18 %) → '+r.tot);
 ok(r.tb.some(x=>/Kitadol/.test(x)&&/83\.000/.test(x))&&r.tb.some(x=>/Zetamol/.test(x)&&/49\.000/.test(x)),'la tabla muestra el menor de cada producto');
 ok(/127\.500/.test(r.mix)&&/123\.000/.test(r.mix),'compara con pagar todo en efectivo (127.500) o todo con tarjeta (123.000)');
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); const V=window.__vt.st(); V.pr.promos=['ef','td','tc','qr','tr','tb'].map(f=>({on:true,fp:f,pct:30,dias:[0,1,2,3,4,5,6],todos:true})); window.__vt.open(); });
 await p.waitForTimeout(250); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300); await p.click('.vt-ov [data-vp="addp"]'); await p.waitForTimeout(400);
 const r2=await p.evaluate(()=>({tot:document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,'')*1, mix:(document.querySelector('.vt-ov .vt-mix')||{}).textContent||''}));
 ok(r2.tot===132000&&/cancela las promociones/.test(r2.mix),'el combinado cancela las promociones del día: con promo 30 % en todas las formas sigue valiendo 132.000 → '+r2.tot);
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
