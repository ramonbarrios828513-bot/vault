// v1307 · el cliente se busca SOLO por cédula o RUC (nunca por nombre); si en el cobro se escribe la C.I. de uno ya registrado, lo reconoce y aplica su descuento; el registro rápido pide primero la C.I. y no duplica
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); }); await p.click('#ventas [data-vt="tdemo"]').catch(()=>{}); await p.waitForTimeout(500);
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); const V=window.__vt.st(); V.open=true; V.pr.promos=[]; const c=V.clients.find(x=>x.id==='cdemo0'); c.demo=0; c.cat='cd'; c.ci='4567890'; c.n='Ramón Barrios Martínez'; V.clients.push(Object.assign({},c,{id:'cX2',n:'Ramón Barrios Gauto',ci:'1234567',tjs:[]})); const t=V.tabs[0]; V.cur=t.id; t.cid=''; t.cli=''; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Kitadol prueba',q:1,pvp:100000,uq:1,cost:35000}]; window.__vt.open(); });
 await p.waitForTimeout(250);
 // buscador de la venta: por nombre no encuentra, por cédula sí
 await p.click('#ventas [data-vt="pickcli"]'); await p.waitForTimeout(300);
 const srch=async(q)=>{ await p.evaluate((q)=>{ const o=[...document.querySelectorAll('.vt-ov')].filter(x=>x.querySelector('[data-cq]')).pop(); const i=o.querySelector('[data-cq]'); i.value=q; i.dispatchEvent(new Event('input',{bubbles:true})); },q); await p.waitForTimeout(200); return p.evaluate(()=>{ const o=[...document.querySelectorAll('.vt-ov')].filter(x=>x.querySelector('[data-cq]')).pop(); return { n:o.querySelectorAll('[data-cp]:not([data-cp="sd"])').length, tx:o.querySelector('.vt-list').innerText.replace(/\s+/g,' ') }; }); };
 let r=await srch('Ramón Barrios'); ok(r.n===0&&/No se busca por nombre/.test(r.tx),'por nombre NO muestra clientes: '+r.tx.slice(0,110));
 r=await srch('4.567.890'); ok(r.n===1&&/Martínez/.test(r.tx)&&!/Gauto/.test(r.tx),'por cédula (con puntos) encuentra solo al correcto: '+r.tx.slice(0,90));
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); });
 // cobro: sin datos → escribe la C.I. en el campo → lo reconoce
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(400);
 const t0=await p.evaluate(()=>document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,'')*1);
 await p.evaluate(()=>{ const i=document.querySelector('.vt-ov [data-vfx="fRuc"]'); i.value='4567890'; i.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(500);
 const r1=await p.evaluate(()=>({tot:document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,'')*1, cli:window.__vt.st().tabs[0].cli, rs:document.querySelector('.vt-ov [data-vfx="fRs"]').value}));
 ok(t0===90000&&r1.tot===80000&&/Martínez/.test(r1.cli)&&/Martínez/.test(r1.rs),'en el cobro, al escribir su C.I. lo reconoce y pasa de sin datos (90.000) a registrado (80.000): '+JSON.stringify(r1));
 // registro rápido: primero la C.I.; si ya existe no duplica
 await p.evaluate(()=>{ const V=window.__vt.st(); const t=V.tabs[0]; t.cid=''; t.cli=''; t.cat='sd'; document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); window.__vt.open(); }); await p.waitForTimeout(200);
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(400); await p.click('.vt-ov [data-vp="cq"]'); await p.waitForTimeout(300);
 const n0=await p.evaluate(()=>window.__vt.st().clients.length);
 const foc=await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.q);
 await p.evaluate(()=>{ const i=[...document.querySelectorAll('.vt-ov [data-q="doc"]')].pop(); i.value='1234567'; i.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(500);
 const r2=await p.evaluate(()=>({n:window.__vt.st().clients.length, cli:window.__vt.st().tabs[0].cli, open:!!document.querySelector('.vt-ov [data-q="doc"]')}));
 ok(foc==='doc','el registro rápido arranca en la C.I.');
 ok(r2.n===n0&&/Gauto/.test(r2.cli)&&!r2.open,'C.I. ya registrada: no lo duplica, lo usa (Ramón Barrios Gauto): '+JSON.stringify(r2));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
