// v1272 · 📦 Ficha de artículo: con tilde se negocia desde el precio público; sin tilde desde el costo (PVP generado); se vende y descuenta stock
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const W=+(process.env.W||1366); const {b,p,errs}=await setup({vp:{width:W,height:W>1000?768:900}});
 await p.evaluate(()=>window.__vt.open()); await p.waitForTimeout(700);
 const d0=await p.evaluate(()=>Object.keys(window.__vt.st().arts).length); ok(d0===2,'hay 2 fichas de prueba (una de cada forma)');
 // buscar algo que no existe → crear ficha desde el buscador con el código escaneado
 await p.fill('#vtQ','7891234567895'); await p.waitForTimeout(250); await p.click('#ventas [data-vt="newart"]'); await p.waitForTimeout(300);
 const bar=await p.inputValue('.vt-ov [data-ar="bar0"]'); ok(bar==='7891234567895','el código escaneado ya viene en la ficha');
 await p.fill('.vt-ov [data-ar="n"]','Talco Bebé Prueba'); await p.dispatchEvent('.vt-ov [data-ar="n"]','change'); await p.waitForTimeout(100);
 await p.uncheck('.vt-ov [data-neg]'); await p.waitForTimeout(200);
 await p.fill('.vt-ov [data-ar="costo"]','10000'); await p.dispatchEvent('.vt-ov [data-ar="costo"]','change'); await p.waitForTimeout(150);
 await p.fill('.vt-ov [data-ar="mq"]','60'); await p.dispatchEvent('.vt-ov [data-ar="mq"]','change'); await p.waitForTimeout(150);
 await p.fill('.vt-ov [data-ar="stk0"]','12'); await p.dispatchEvent('.vt-ov [data-ar="stk0"]','change'); await p.waitForTimeout(150);
 const calc=await p.evaluate(()=>document.querySelector('.vt-ov .vt-calc').textContent); ok(/25\.000/.test(calc)&&/60%/.test(calc),'sin tilde (desde el costo): costo 10.000 y 60 % → PVP generado ₲ 25.000 · '+calc);
 await p.click('.vt-ov [data-ok]'); await p.waitForTimeout(400);
 const x=await p.evaluate(()=>Object.values(window.__vt.st().arts).find(a=>a.n==='Talco Bebé Prueba')); ok(x&&x.neg==='costo'&&x.pvp===25000&&x.costo===10000,'ficha guardada '+JSON.stringify(x&&{neg:x.neg,pvp:x.pvp,costo:x.costo}));
 // otra con tilde: PVP 50.000 y proveedor 40 %
 await p.click('#ventas [data-vt="arts"]'); await p.waitForTimeout(200); await p.click('.vt-ov [data-an]'); await p.waitForTimeout(200);
 await p.fill('.vt-ov [data-ar="n"]','Jarabe Prueba'); await p.fill('.vt-ov [data-ar="pvp"]','50000'); await p.dispatchEvent('.vt-ov [data-ar="pvp"]','change'); await p.waitForTimeout(120); await p.fill('.vt-ov [data-ar="dprov"]','40'); await p.dispatchEvent('.vt-ov [data-ar="dprov"]','change'); await p.waitForTimeout(150);
 const c2=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov .vt-calc')].map(x=>x.textContent).join(' || ')+' ovs='+[...document.querySelectorAll('.vt-ov')].map(o=>o.querySelector('b')&&o.querySelector('b').textContent).join('/')+' pvp='+document.querySelector('.vt-ov [data-ar="pvp"]')?.value); ok(/30\.000/.test(c2)&&/depósito 25%/.test(c2),'con tilde (desde el público): PVP 50.000 − 40 % → costo 30.000, depósito 25 % · '+c2);
 await p.click('.vt-ov [data-ok]'); await p.waitForTimeout(300);
 // venderlo: pasar el código y ver el descuento
 await p.evaluate(()=>{ const V=window.__vt.st(); const t=V.tabs[0]; V.cur=t.id; t.cid='cdemo0'; t.cli='Cliente Prueba Registrado'; t.cat='cd'; t.fp='ef'; t.lines=[]; window.__vt.open(); });
 await p.fill('#vtQ','7891234567895'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
 const L=await p.evaluate(()=>{ const t=window.__vt.st().tabs[0]; return t.lines.map(l=>l.n+'|'+l.pvp+'|'+l.cost); }); ok(L.length===1&&L[0]==='Talco Bebé Prueba|25000|10000','con el lector entra el talco con su PVP y costo '+JSON.stringify(L));
 const tot=await p.evaluate(()=>+document.querySelector('#ventas .vt-big').textContent.replace(/\D/g,'')); ok(tot===21250,'registrado en efectivo: 60 % − 15 = depósito 45 → tramo 40 → referencia 15 % → ₲ 21.250 ('+tot+')');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
