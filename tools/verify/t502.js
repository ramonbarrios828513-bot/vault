// v1270 · Motor de descuento: proveedor → depósito → referencia → forma de pago − comisión → promo / cumpleaños → sin datos 50 %; combinado = descuento menor, tarjeta primero; sin descuento a mano
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const W=+(process.env.W||1366); const {b,p,errs}=await setup({vp:{width:W,height:W>1000?768:900}});
 await p.evaluate(()=>{ window.__vt.open(); });
 await p.click('#ventas [data-vt="tdemo"]'); await p.waitForTimeout(900);
 const prep=(cat,cid)=>p.evaluate(([cat,cid])=>{ const V=window.__vt.st(); V.open=true; V.stock={GS:{50000:5,20000:5,10000:5,5000:5,2000:5,1000:5},BRL:{},USD:{}}; const t=V.tabs[0]; V.cur=t.id; t.cat=cat; t.cid=cid||''; t.cli=''; t.fp='ef'; t.bk=''; t.lines=[{aid:'m1',n:'Prueba PVP 100.000',q:1,pvp:100000,cost:35000,uq:1}]; window.__vt.open(); },[cat,cid]);
 const tt=(fp,bk)=>p.evaluate(([fp,bk])=>{ const V=window.__vt.st(); const t=V.tabs[0]; t.fp=fp; t.bk=bk||''; window.__vt.open(); return +document.querySelector('#ventas .vt-sum .vt-big, #ventas .vt-big').textContent.replace(/\D/g,''); },[fp,bk]);
 await prep('sd'); let r={ef:await tt('ef'),tc:await tt('tc')};
 ok(r.ef===90000&&r.tc===91500,'sin datos: la mitad (efectivo 10 %, crédito 8,5 %) '+JSON.stringify(r));
 await prep('cd','cdemo0'); r={ef:await tt('ef'),qr:await tt('qr'),td:await tt('td'),tc:await tt('tc'),cr:await tt('cr')};
 ok(r.ef===80000&&r.qr===82000&&r.td===82000&&r.tc===83000&&r.cr===100000,'registrado: efectivo 20, QR 18, débito 18, crédito 17, crédito funcionario 0 '+JSON.stringify(r));
 const manual=await p.evaluate(()=>!!document.querySelector('#ventas [data-vdm]')); ok(!manual,'no hay casilla para poner descuento a mano');
 await prep('cd','cdemo1'); r={ef:await tt('ef'),qr:await tt('qr'),tc:await tt('tc'),tci:await tt('tc','Itaú')};
 ok(r.ef===70000&&r.qr===72000&&r.tc===73000&&r.tci===70000,'cumpleaños +10: efectivo 30, QR 28, crédito 27; Itaú crédito promo 30 '+JSON.stringify(r));
 const best=await p.evaluate(()=>[...document.querySelectorAll('#ventas .vt-bo')].map(x=>x.textContent)); ok(best.length&&/Itaú|Efectivo/.test(best[0])&&/70\.000/.test(best[0]),'el sistema muestra la mejor forma de pago para el cliente '+best.slice(0,3).join(' | '));
 const why=await p.evaluate(()=>document.querySelector('#ventas .vt-why').textContent); ok(/depósito 50/.test(why)&&/cumpleaños/.test(why),'explica cómo llegó: '+why);
 // combinado: registrado normal, efectivo + crédito → vale el 17 % para todo, tarjeta primero
 await prep('cd','cdemo0'); await tt('ef');
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="addp"]'); await p.waitForTimeout(200);
 const m1=await p.evaluate(()=>({ tot:+document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,''), first:document.querySelector('.vt-ov [data-pf="0"]').value, chips:document.querySelectorAll('.vt-ov [data-vp="rq"]').length, mix:!!document.querySelector('.vt-ov .vt-mix') }));
 ok(m1.tot===83000&&m1.first==='tc'&&m1.chips===0&&m1.mix,'combinado: total con el 17 % (menor), tarjeta primero, efectivo bloqueado hasta cargar la tarjeta '+JSON.stringify(m1));
 await p.fill('.vt-ov [data-pm="0"]','40000'); await p.dispatchEvent('.vt-ov [data-pm="0"]','change'); await p.waitForTimeout(250);
 await p.click('.vt-ov [data-vp="rq"][data-d="50000"]'); await p.waitForTimeout(250);
 const m2=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov .vt-vr')].map(r=>r.querySelector('.q').textContent+'x'+r.querySelector('b').textContent.replace(/\D/g,'')));
 ok(JSON.stringify(m2)===JSON.stringify(['1x5000','1x2000']),'resto ₲ 43.000 en efectivo con ₲ 50.000 → vuelto 7.000 sugerido '+JSON.stringify(m2));
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400);
 const s=await p.evaluate(()=>{ const V=window.__vt.st(); const x=V.sales[V.sales.length-1]; return x&&{tot:x.total,pays:x.pays.map(q=>q.fp+':'+q.m)}; }); ok(s&&s.tot===83000&&s.pays.join()==='tc:40000,ef:43000','venta combinada guardada '+JSON.stringify(s));
 // tabla de reglas abre y guarda
 await p.click('#ventas [data-vt="tabla"]'); await p.waitForTimeout(300); const pv=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].some(o=>/Vista previa/.test(o.textContent)&&/Categorías de cliente/.test(o.textContent)&&/Grupos y fechas/.test(o.textContent))); ok(pv,'🏷️ reglas: categorías, fechas de grupos, promos y vista previa'); await p.click('.vt-ov [data-ok]'); await p.waitForTimeout(200);
 // maestra en su día: 20 + 10 = 30 en efectivo
 await prep('cd','cdemo2'); r={ef:await tt('ef'),tc:await tt('tc')}; ok(r.ef===70000&&r.tc===73000,'día del maestro +10: efectivo 30, crédito 27 '+JSON.stringify(r));
 const ro=await p.evaluate(()=>({sel:!!document.querySelector('#ventas select[data-vf="cat"]'),txt:(document.querySelector('#ventas .vt-catro')||{}).textContent||''})); ok(!ro.sel&&/maestro/i.test(ro.txt),'la categoría no la elige el vendedor (sale de la ficha) '+ro.txt);
 // categoría nueva «Familia» fija 30
 await p.evaluate(()=>{ const V=window.__vt.st(); V.pr.cats.push({id:'kfam',n:'Familia',modo:'fija',pct:30}); const c=V.clients.find(x=>x.id==='cdemo0'); c.cat='kfam'; });
 await prep('kfam','cdemo0'); r={ef:await tt('ef')}; ok(r.ef===70000,'categoría nueva Familia (fija 30 %) '+JSON.stringify(r));
 // borrar datos de prueba
 await p.evaluate(()=>{ window.__askBox=(m,i,d,done)=>done(true); }); 
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
