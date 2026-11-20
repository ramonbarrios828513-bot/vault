// v1308 · presupuesto / delivery: se arma buscando por descripción (queda «⏳ Validar por barra»), no deja facturar hasta validar cada producto por su barra; el lector valida sin sumar cantidad
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__noBarVal=false; window.__vt.open(); const V=window.__vt.st(); V.open=true; Object.keys(V.arts).forEach(k=>delete V.arts[k]); V.arts.vk={id:'vk',va:1,n:'Kitadol Forte caja x20',u:20,bar:['7840199086491'],pvp:20000,costo:7000,cod:'1',frac:false,neg:'pvp'}; V.arts.vz={id:'vz',va:1,n:'Zetamol 500 caja x10',u:10,bar:['7840000000017'],pvp:10000,costo:4000,cod:'2',frac:false,neg:'pvp'}; V.stk.vk=100; V.stk.vz=100; const t=V.tabs.find(x=>x.k==='p'); V.cur=t.id; t.lines=[]; window.__vt.open(); });
 await p.waitForTimeout(1300);
 const L=()=>p.evaluate(()=>{ const V=window.__vt.st(); return V.tabs.find(x=>x.id===V.cur).lines.map(l=>l.n+' x'+l.q+(l.val===true?' ✔':' ⏳')).join(' | '); });
 const toast=()=>p.evaluate(()=>document.getElementById('toast').textContent);
 for (const q of ['kitadol','zetamol']) { await p.fill('#vtQ',q); await p.waitForTimeout(400); await p.click('[data-vt="pick"]'); await p.waitForTimeout(400); }
 ok(/Kitadol.* x1 ⏳ \| Zetamol.* x1 ⏳/.test(await L())&&!(await p.$('.vt-ov [data-nb]')),'en el presupuesto se carga por descripción, sin pedir barra, y queda por validar: '+await L());
 ok(await p.evaluate(()=>document.querySelectorAll('#ventas [data-vt="lval"]').length)===2,'cada producto muestra «⏳ Validar por barra»');
 await p.click('#ventas [data-vt="avent"]'); await p.waitForTimeout(400);
 ok(/Antes de facturar hay que validar por barra 2 producto/.test(await toast())&&(await p.evaluate(()=>{ const V=window.__vt.st(); return V.tabs.find(x=>x.id===V.cur).k; }))==='p','no deja facturar con productos sin validar: '+(await toast()).slice(0,90));
 await p.fill('#vtQ','7840199086491'); await p.press('#vtQ','Enter'); await p.waitForTimeout(400);
 ok(/Kitadol.* x1 ✔ \| Zetamol.* x1 ⏳/.test(await L()),'el lector valida el producto sin sumar cantidad: '+await L());
 await p.evaluate(()=>[...document.querySelectorAll('#ventas [data-vt="lval"]')].pop().click()); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.vt-ov')].filter(x=>x.querySelector('[data-nb]')).pop(); o.querySelector('[data-nbcp]').click(); o.querySelector('[data-nbok]').click(); }); await p.waitForTimeout(400);
 ok(/Kitadol.* x1 ✔ \| Zetamol.* x1 ✔/.test(await L()),'con «⏳ Validar por barra» + 📋 Copiar también valida: '+await L());
 await p.click('#ventas [data-vt="avent"]'); await p.waitForTimeout(500);
 ok((await p.evaluate(()=>{ const V=window.__vt.st(); const t=V.tabs.find(x=>x.id===V.cur); return t.k+':'+t.lines.length; }))==='v:2','con todo validado, ya pasa a la venta para facturar');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
