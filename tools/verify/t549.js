// v1307 · 🧠 «¿Cómo le conviene pagar?», reporte «Cómo se cobró» y control: el descuento es del cliente que queda al cobrar (cambiar el cliente recalcula y queda anotado), ticket a otro nombre queda marcado
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); }); await p.click('#ventas [data-vt="tdemo"]').catch(()=>{}); await p.waitForTimeout(500);
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); const V=window.__vt.st(); V.open=true; V.sales=[]; V.stock={GS:{100000:5,50000:5,20000:5,10000:5,5000:5,2000:5,1000:5,500:5},BRL:{},USD:{}}; V.pr.promos=[{on:true,fp:'tc',bk:'Itaú',pct:30,dias:[0,1,2,3,4,5,6],todos:true}]; const c=V.clients.find(x=>x.id==='cdemo0'); c.demo=0; c.cat='cd'; c.tjs=[{tp:'cre',bk:'Itaú',mc:'Visa',n:3}]; const t=V.tabs[0]; V.cur=t.id; t.cid=c.id; t.cli=c.n; t.cat='cd'; t.fp='ef'; t.bk=''; t.lines=[{aid:'m1',n:'Kitadol prueba',q:1,pvp:100000,uq:1,cost:35000},{aid:'m2',n:'Zetamol prueba',q:1,pvp:40000,uq:1,cost:24000}]; window.__vt.open(); });
 await p.waitForTimeout(250); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(400);
 const cv=await p.evaluate(()=>(document.querySelector('.vt-ov [data-conv]')||{}).innerText||''); console.log(cv.replace(/\s+/g,' '));
 ok(/Crédito Itaú/.test(cv)&&/Todo con Crédito Itaú: ₲ 100\.000/.test(cv.replace(/\s+/g,' '))&&/Por separado/.test(cv)&&/Combinado: ₲ 122\.200/.test(cv.replace(/\s+/g,' ')),'🧠 compara: todo con su Crédito Itaú 100.000, por separado y combinado 122.200');
 ok(/ahorra ₲ 18\.000/.test(cv),'💡 avisa la promo que pierde pagando en efectivo (118.000 → 100.000)');
 const t0=await p.evaluate(()=>document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,'')*1);
 // el «truco»: sacar al cliente con descuento antes de cobrar → el precio se recalcula y queda anotado
 await p.click('.vt-ov [data-vp="cx"]'); await p.waitForTimeout(500);
 const t1=await p.evaluate(()=>document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,'')*1);
 ok(t0===118000&&t1>t0,'al cambiar el cliente el descuento NO queda cargado: se recalcula ('+t0+' → '+t1+')');
 await p.evaluate(()=>{ const i=document.querySelector('.vt-ov [data-rqn="100000"]'); i.value='2'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400); await p.evaluate(()=>{ const v=document.querySelector('[data-vok]'); if(v) v.click(); }); await p.waitForTimeout(500);
 await p.evaluate(()=>{ const a=document.querySelector('[data-ak]'); if(a) a.click(); }); await p.waitForTimeout(300);
 const sv=await p.evaluate(()=>{ const V=window.__vt.st(); const x=V.sales[V.sales.length-1]; return x&&{modo:x.modo,total:x.total,log:x.cliLog}; }); console.log(JSON.stringify(sv));
 ok(sv&&sv.modo==='uno'&&sv.log&&sv.log.length===1&&sv.log[0].a==='Sin identificar'&&sv.log[0].tA===118000,'la venta guarda el cambio de cliente (de quién a quién y los totales)');
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); }); await p.click('#ventas [data-vt="hoy"]'); await p.waitForTimeout(400);
 const rp=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.vt-ov')].filter(x=>/Ventas del turno/.test(x.innerText)).pop()||document.body; return { modos:(o.querySelector('[data-modos]')||{}).innerText||'', rev:(o.querySelector('[data-rev]')||{}).innerText||'' }; }); console.log(rp.modos.replace(/\s+/g,' '), '||', rp.rev.replace(/\s+/g,' '));
 ok(/Una sola forma de pago\s+1/.test(rp.modos)&&/Por separado/.test(rp.modos)&&/Combinado/.test(rp.modos),'📊 «Cómo se cobró»: ventas, total y descuento dado por modo');
 ok(/cambió el cliente con productos cargados/.test(rp.rev)&&/Sin identificar/.test(rp.rev),'⚠️ «Para revisar» muestra el cambio de cliente');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
