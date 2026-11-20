// v1308 · 🪞 sucursal espejo de pruebas: se crea con copia del stock, «Estoy en» cambia de sucursal (cada una con su stock), el pedido urgente saca de la espejo y la espejo ve «📥 Entregar» y lo marca entregado
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.obj=Object.assign(V.obj||{}, {suc:'KM 7 Central'}); Object.keys(V.arts).forEach(k=>delete V.arts[k]); V.arts.vk={id:'vk',va:1,n:'Kitadol Forte caja x20',u:20,bar:['7840199086491'],pvp:20000,costo:7000,cod:'1',frac:false,neg:'pvp'}; V.stk.vk=200; V.sold.vk=0; V.sucs=null; V.sucS={}; V.transf=[]; V.tabs.forEach(t=>t.lines=[]); V.cur=V.tabs[0].id; window.__vt.open(); });
 await p.waitForTimeout(1300);
 const sw=async(v)=>{ await p.evaluate((v)=>{ const s=document.querySelector('#ventas [data-sucsw]'); s.value=v; s.dispatchEvent(new Event('change',{bubbles:true})); },v); await p.waitForTimeout(500); };
 const st=()=>p.evaluate(()=>{ const V=window.__vt.st(); return {suc:V.obj.suc, stk:V.stk.vk-(V.sold.vk||0), esp:((V.sucS['Sucursal Espejo (pruebas)']||{}).vk||{}).s, km7:((V.sucS['KM 7 Central']||{}).vk||{}).s, opts:[...document.querySelectorAll('#ventas [data-sucsw] option')].map(o=>o.textContent).join('|')}; });
 await sw('__espejo'); let r=await st(); ok(r.esp===200&&/Sucursal Espejo \(pruebas\)/.test(r.opts)&&r.suc==='KM 7 Central','se crea la sucursal espejo con copia del stock (200): '+JSON.stringify(r));
 // en KM 7 se vende todo el stock → queda 0; pide urgente a la espejo
 await p.evaluate(()=>{ const V=window.__vt.st(); V.stk.vk=0; const t=V.tabs[0]; t.cat='sd'; t.fp='ef'; t.lines=[{val:true,aid:'vk',pid:'caja',pt:'caja',n:'Kitadol Forte caja x20',q:1,pvp:20000,cost:7000,uq:20}]; window.__vt.open(); }); await p.waitForTimeout(1300);
 await p.click('#ventas [data-vt="lsuc"]'); await p.waitForTimeout(400);
 ok(/⭐ Sucursal Espejo/.test(await p.evaluate(()=>document.querySelector('#sucDlg').innerText)),'el pedido urgente sugiere la sucursal espejo');
 await p.click('#sucDlg [data-str="Sucursal Espejo (pruebas)"]'); await p.waitForTimeout(500);
 r=await st(); ok(r.stk===20&&r.esp===180,'transferido: 20 acá, la espejo queda en 180: '+JSON.stringify(r));
 await sw('Sucursal Espejo (pruebas)'); ok(/ventas abiertas/.test(await p.evaluate(()=>document.getElementById('toast').textContent))&&(await st()).suc==='KM 7 Central','no deja cambiar de sucursal con una venta abierta');
 await p.evaluate(()=>{ window.__vt.st().tabs[0].lines=[]; window.__vt.open(); }); await p.waitForTimeout(1300);
 await sw('Sucursal Espejo (pruebas)'); r=await st(); ok(r.suc==='Sucursal Espejo (pruebas)'&&r.stk===180&&r.km7===20,'«Estoy en» la espejo: se ve SU stock (180) y KM 7 quedó guardada con 20: '+JSON.stringify(r));
 const pend=await p.evaluate(()=>(document.querySelector('#ventas [data-vt="trpend"]')||{}).innerText||''); ok(/Entregar \(1\)/.test(pend),'la espejo ve «📥 Entregar (1)»');
 await p.click('#ventas [data-vt="trpend"]'); await p.waitForTimeout(300); await p.click('#trDlg [data-tre]'); await p.waitForTimeout(300); await p.fill('.ask-in','Juan Delivery'); await p.click('[data-ak="yes"]'); await p.waitForTimeout(400);
 const e=await p.evaluate(()=>{ const q=window.__vt.st().transf[0]; return q.ent&&q.ent.quien; }); ok(e==='Juan Delivery','queda anotado quién retiró: '+e);
 await p.evaluate(()=>document.querySelectorAll('.vt-ov').forEach(o=>o.remove())); await sw('KM 7 Central'); r=await st(); ok(r.suc==='KM 7 Central'&&r.stk===20&&r.esp===180,'vuelve a KM 7 con su stock (20): '+JSON.stringify(r));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
