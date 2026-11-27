// v1280 · al tocar 💰 Cobrar ya está la calculadora de billetes: se escribe cuántos de cada valor, suma en vivo, Enter pasa al siguiente, y entra al stock de la caja
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.stock={GS:{20000:5,10000:5,5000:5,2000:5,1000:5,500:5,100:10},BRL:{},USD:{}}; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:52700,uq:1}]; window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(400);
 const foc=await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.rqn); ok(foc==='100000','al abrir Cobrar el cursor ya está en la calculadora (₲ 100.000)');
 const rows=await p.evaluate(()=>document.querySelectorAll('.vt-ov [data-rqn]').length); ok(rows>=10,'hay un casillero por cada billete y moneda ('+rows+')');
 await p.keyboard.type('0'); await p.keyboard.press('Enter'); await p.keyboard.type('1'); await p.waitForTimeout(150);
 const live=await p.evaluate(()=>document.querySelector('.vt-ov [data-live]').textContent); ok(/50\.000/.test(live)&&/Falta/.test(live),'suma en vivo mientras se escribe: '+live);
 await p.keyboard.press('Enter'); await p.keyboard.type('1'); await p.keyboard.press('Enter'); await p.waitForTimeout(400); /* v1346: el 1.er Enter muestra el vuelto, el 2.º cobra */ await p.keyboard.press('Enter'); await p.waitForTimeout(400);
 const st=await p.evaluate(()=>{ const V=window.__vt.st(), s=V.sales[V.sales.length-1]; return { rec:s?JSON.stringify(s.pays[0].rec.GS):'', vu:s&&s.vuDado }; });
 ok(/"50000":1/.test(st.rec)&&/"20000":1/.test(st.rec)&&st.vu===17300,'1 de 50.000 + 1 de 20.000 = 70.000 → Enter muestra el vuelto y otro Enter cobra con vuelto ₲ 17.300 '+JSON.stringify(st));
 // ya confirmado con Enter
 const s=await p.evaluate(()=>window.__vt.st().stock.GS); ok(s[50000]===1&&s[20000]===6,'los billetes entraron al stock de la caja '+JSON.stringify(s));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
