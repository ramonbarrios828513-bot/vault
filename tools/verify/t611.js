// v1346 · 💵 cobro: vuelto sugerido por defecto desde el stock de la caja (85.000 con 100.000 → 10.000 + 5.000), sin saltos al tocar ₲ 50.000,
//         lo chico que la caja no tiene queda A FAVOR del cliente, y lo que le falta al cliente puede quedar como DEUDA (regla del encargado)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:620}});
 await p.evaluate(()=>{ const P=window.__pla.st(); P.emps=P.emps||[]; P.emps.push({id:'eA1',n:'Ana Vendedora',suc:'KM 7',pin:'4321'}); }); /* v1348: a favor / deuda se autoriza con el PIN del vendedor */
 const pin=async()=>{ if(await p.$('.vt-aut [data-au="pin"]')){ await p.fill('.vt-aut [data-au="pin"]','4321'); await p.keyboard.press('Enter'); } };
 const prep=async(st,pvp,cli)=>{ await p.evaluate(([st,pvp,cli])=>{ document.querySelectorAll('.vt-ov').forEach(x=>x.remove()); window.__vt.open(); const V=window.__vt.st(); V.open=true; V.iniAt=Date.now(); V.stock=st; V.pr.deuOn=true; V.pr.deuTope=2000; V.pr.favTope=1000; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:pvp,uq:1,nodesc:true}]; if(cli){ V.clients=V.clients||[]; let c=V.clients.find(x=>x.id==='cT1'); if(!c){ c={id:'cT1',n:'Cliente Prueba',ci:'1'}; V.clients.push(c);} t.cid='cT1'; t.cli='Cliente Prueba'; } else { t.cid=''; t.cli=''; } window.__vt.open(); },[st,pvp,cli]); await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(600); };
 const box=()=>p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); return ov?ov.querySelector('[data-vub]').innerText.replace(/\s+/g,' '):'(cerrado)'; });
 // 1) sugerencia por defecto
 await prep({GS:{10000:3,5000:2,1000:5}},85000,false);
 const vis=await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(), bx=ov.querySelector('.ico-box').getBoundingClientRect(), io=ov.querySelector('.vt-io').getBoundingClientRect(); return io.top>=bx.top-2&&io.bottom<=bx.bottom+2; });
 ok(vis,'al tocar Cobrar, el cuadro de billetes queda entero a la vista');
 const y0=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().querySelector('.ico-box').scrollTop);
 await p.click('.vt-ov [data-rqn="50000"]'); await p.waitForTimeout(300); await p.click('.vt-ov [data-rqn="100000"]'); await p.waitForTimeout(300);
 const y1=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().querySelector('.ico-box').scrollTop);
 ok(y0===y1,'tocar ₲ 50.000 y volver no hace saltar el cuadro ('+y0+' → '+y1+')');
 await p.keyboard.type('1'); await p.waitForTimeout(400); let t1=await box(); console.log('   '+t1.slice(0,160));
 ok(/vuelto ₲ 15\.000/.test(t1)&&/Das: ₲ 15\.000/.test(t1)&&/justo/.test(t1),'85.000 con un billete de 100.000: sugiere dar ₲ 15.000 por defecto');
 const vu=await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); return [...ov.querySelectorAll('[data-vo]')].filter(i=>i.value).map(i=>i.dataset.vo+'x'+i.value).join(','); });
 ok(vu==='10000x1,5000x1','vuelto: un billete de 10.000 y uno de 5.000 ('+vu+')');
 // 2) caja sin monedas de 500 → a favor
 await prep({GS:{10000:1,5000:1}},84500,false); await p.click('.vt-ov [data-rqn="100000"]'); await p.keyboard.type('1'); await p.waitForTimeout(400); let t2=await box(); console.log('   '+t2.slice(0,220));
 ok(/A FAVOR/.test(t2)&&/500/.test(t2)&&/sin identificar/.test(t2),'sin monedas de ₲ 500: los ₲ 500 quedan a favor (sin cliente: «a favor sin identificar» con PIN)');
 await prep({GS:{10000:1,5000:1}},84500,true); await p.click('.vt-ov [data-rqn="100000"]'); await p.keyboard.type('1'); await p.waitForTimeout(400);
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400); await pin(); await p.waitForTimeout(500);
 const r2=await p.evaluate(()=>{ const V=window.__vt.st(), c=V.clients.find(x=>x.id==='cT1'), s=V.sales[V.sales.length-1]; return {fav:c.favor, sfav:s.fav, vd:s.vuDado, open:!!document.querySelector('.vt-ov [data-vub]')}; });
 ok(r2.fav===500&&r2.sfav===500&&r2.vd===15000&&!r2.open,'con cliente: venta cobrada, vuelto ₲ 15.000 y ₲ 500 a favor en su cuenta ('+JSON.stringify(r2)+')');
 // 3) al cliente le faltan 500 → deuda por regla del encargado
 await prep({GS:{10000:2}},50500,true); await p.click('.vt-ov [data-rqn="50000"]'); await p.keyboard.type('1'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ const V=window.__vt.st(); for(let i=0;i<3;i++) V.sales.push({t:Date.now()-864e5*(i+2),cid:'cT1',total:1000,lines:[],pays:[]}); const ov=[...document.querySelectorAll('.vt-ov')].pop(); const b=ov&&ov.querySelector('[data-vp="usfx"],[data-vp="x"]'); }); await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); const i=ov&&ov.querySelector('[data-rqn]'); if(i) i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(300);
 ok(/Anotar los ₲ 500|Negativo en su billetera: ₲ 500|Queda debiendo/.test(await box()),'si al cliente le faltan ₲ 500, aparece «📒 Anotar como deuda»');
 await p.click('.vt-ov [data-vp="deu"]'); await p.waitForTimeout(400); ok(/DEUDA/.test(await box()),'dentro del tope del encargado se anota sin clave');
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400); await pin(); await p.waitForTimeout(500);
 const r3=await p.evaluate(()=>{ const V=window.__vt.st(), c=V.clients.find(x=>x.id==='cT1'), s=V.sales[V.sales.length-1]; return {deu:c.deuda, sdeu:s.deu, by:s.deuBy, cta:(c.cta||[]).length}; });
 ok(r3.deu===500&&r3.sdeu===500&&/encargado/.test(r3.by)&&r3.cta>=2,'la deuda queda en la cuenta del cliente con quién la autorizó ('+JSON.stringify(r3)+')');
 // 4) arriba del tope pide clave
 await prep({GS:{10000:2}},55000,true); await p.click('.vt-ov [data-rqn="50000"]'); await p.keyboard.type('1'); await p.waitForTimeout(400); await p.click('.vt-ov [data-vp="deu"]'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>/clave del encargado/.test(document.body.innerText)),'arriba del tope (₲ 5.000) pide la clave del encargado');
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 await b.close(); console.log(fail?'fallas '+fail:'✔ t611 ok'); process.exit(fail?1:0); })();
