// v1307 · 🧩 pago por separado: la venta se divide por productos; cada producto va a la forma de pago donde hoy tiene MÁS descuento (con promo), cada forma cobra la suma de los suyos, hasta 3 formas; el ticket sale agrupado
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); window.__vt.open(); const V=window.__vt.st(); V.open=true; V.stock={GS:{50000:5,20000:5,10000:5,5000:5,2000:5,1000:5,500:5},BRL:{},USD:{}}; V.pr.promos=[{on:true,fp:'tc',bk:'Itaú',pct:18,dias:[0,1,2,3,4,5,6],todos:true}]; const t=V.tabs[0]; V.cur=t.id; t.cat='cd'; t.fp='ef'; t.bk='Itaú'; t.lines=[{aid:'m1',n:'Kitadol prueba',q:1,pvp:100000,uq:1,cost:35000},{aid:'m2',n:'Zetamol prueba',q:1,pvp:50000,uq:1,cost:30000}]; window.__vt.open(); });
 await p.waitForTimeout(250); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="sepp"]'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const sel=[...document.querySelectorAll('.vt-ov [data-pf]')].find(s=>s.value!=='ef'); if(sel.value!=='tc'){ sel.value='tc'; sel.dispatchEvent(new Event('change',{bubbles:true})); } }); await p.waitForTimeout(250);
 await p.evaluate(()=>{ const sel=[...document.querySelectorAll('.vt-ov [data-pb]')][0]; if(sel){ sel.value='Itaú'; sel.dispatchEvent(new Event('change',{bubbles:true})); } }); await p.waitForTimeout(300);
 const r=await p.evaluate(()=>({tot:document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,'')*1, tb:[...document.querySelectorAll('.vt-ov [data-septb] tr')].map(t=>t.innerText.replace(/\s+/g,' ')), sums:[...document.querySelectorAll('.vt-ov .vt-seps')].map(x=>x.innerText.replace(/\s+/g,' ')), dis:[...document.querySelectorAll('.vt-ov [data-pm]')].every(i=>i.disabled), tcM:[...document.querySelectorAll('.vt-ov [data-pm]')].map(i=>i.value)}));
 console.log(r.tb.join('\n'), '\n', r.sums.join(' | '), r.tcM);
 ok(r.tot===121000,'total = Kitadol en efectivo 20 % (80.000) + Zetamol con crédito Itaú en promo 18 % (41.000) = 121.000 → '+r.tot);
 ok(r.tb.some(x=>/Kitadol/.test(x)&&/Efectivo ₲ 80\.000/.test(x))&&r.tb.some(x=>/Zetamol/.test(x)&&/Crédito Itaú ₲ 41\.000/.test(x)),'cada producto va a la forma donde tiene más descuento');
 ok(r.sums.some(x=>/Crédito Itaú: ₲ 41\.000/.test(x))&&r.sums.some(x=>/Efectivo: ₲ 80\.000/.test(x)),'cada forma cobra la suma de sus productos: '+r.sums.join(' | '));
 ok(r.dis&&r.tcM.includes('41.000'),'el monto de la tarjeta lo pone el sistema (no se edita): '+r.tcM.join(','));
 // tercera forma
 await p.click('.vt-ov [data-vp="sepadd"]'); await p.waitForTimeout(300);
 const r3=await p.evaluate(()=>({n:document.querySelectorAll('.vt-ov [data-pf]').length, more:!!document.querySelector('.vt-ov [data-vp="sepadd"]'), tot:document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,'')*1}));
 ok(r3.n===3&&r3.more&&r3.tot===121000,'v1339: acepta 3 y sigue ofreciendo ➕ Otra forma de pago (sin límite) (la tercera, QR, hoy no le gana a ninguna): '+JSON.stringify(r3));
 // cobrar: efectivo 100.000 → vuelto 20.000
 await p.click('.vt-ov [data-vp="rq"][data-d="50000"]'); await p.waitForTimeout(150); await p.click('.vt-ov [data-vp="rq"][data-d="50000"]'); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400); await p.evaluate(()=>{ const v=document.querySelector('[data-vok]'); if(v) v.click(); }); await p.waitForTimeout(500);
 const sv=await p.evaluate(()=>{ const V=window.__vt.st(); const x=V.sales[V.sales.length-1]; return x&&{sep:x.sep,total:x.total,vuelto:x.vuelto,pays:x.pays.map(q=>q.fp+':'+q.m+(q.bk?':'+q.bk:'')),lines:x.lines.map(l=>l.n+'>'+l.fpn+'>'+l.u)}; });
 console.log(JSON.stringify(sv));
 ok(sv&&sv.sep===1&&sv.total===121000&&sv.vuelto===20000,'venta cobrada por separado: total 121.000, vuelto 20.000');
 ok(sv&&sv.pays.length===2&&sv.pays.includes('tc:41000:Itaú')&&sv.pays.includes('ef:80000'),'pagos guardados: tarjeta 41.000 y efectivo 80.000 (la forma sin productos no se guarda): '+(sv&&sv.pays.join(' ')));
 ok(sv&&sv.lines.some(l=>/Kitadol.*Efectivo>80000/.test(l))&&sv.lines.some(l=>/Zetamol.*Crédito Itaú>41000/.test(l)),'cada línea guarda con qué se pagó');
 // cambiar a combinado
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); const V=window.__vt.st(); const t=V.tabs[0]; V.cur=t.id; t.cat='cd'; t.fp='ef'; t.bk='Itaú'; t.lines=[{aid:'m1',n:'Kitadol prueba',q:1,pvp:100000,uq:1,cost:35000},{aid:'m2',n:'Zetamol prueba',q:1,pvp:50000,uq:1,cost:30000}]; window.__vt.open(); });
 await p.waitForTimeout(250); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300); await p.click('.vt-ov [data-vp="sepp"]'); await p.waitForTimeout(300); await p.click('.vt-ov [data-vp="septog"]'); await p.waitForTimeout(300);
 const rc=await p.evaluate(()=>({tot:document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,'')*1, mix:!!document.querySelector('.vt-ov [data-mixtb]')}));
 ok(rc.mix&&rc.tot===132000,'«Cambiar a combinado»: un solo total con el menor de hoy y sin promos (132.000) → '+rc.tot);
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
