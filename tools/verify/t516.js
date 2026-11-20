// v1282 · el vuelto sugerido aparece EN VIVO mientras se escriben los billetes (sin salir del casillero): el sistema ya sabe el stock
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.stock={GS:{20000:0,10000:5,5000:5,2000:5,1000:5,500:5,100:10},BRL:{},USD:{}}; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:52700,uq:1}]; window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(400);
 await p.keyboard.press('Enter'); await p.keyboard.type('1'); await p.waitForTimeout(150); // 1 × 50.000 → falta
 let vb=await p.evaluate(()=>document.querySelector('.vt-ov [data-vub]').textContent); ok(!/dale estos billetes/.test(vb),'sin vuelto mientras falta plata: '+vb.slice(0,120));
 await p.keyboard.press('Enter'); await p.keyboard.type('1'); await p.waitForTimeout(150); // + 1 × 20.000 = 70.000 → vuelto 17.300
 const r=await p.evaluate(()=>({tx:document.querySelector('.vt-ov [data-vub]').textContent, act:document.activeElement&&document.activeElement.dataset.rqn}));
 ok(/17\.300/.test(r.tx)&&/dale estos billetes/.test(r.tx),'el vuelto sugerido ya aparece sin salir del casillero: '+r.tx.slice(0,120));
 ok(/₲ 10\.000/.test(r.tx)&&/₲ 5\.000/.test(r.tx),'arma el vuelto con billetes que hay en la caja (10.000 + 5.000 + …)');
 ok(r.act==='20000','el cursor sigue en el casillero de ₲ 20.000 (no se pierde lo que se escribe)');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
