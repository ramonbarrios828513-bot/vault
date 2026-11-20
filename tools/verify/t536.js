// v1298 · en el cuadro de cobro: ⚡ registro rápido del cliente SIN salir (los billetes cargados siguen y el precio se recalcula), datos para el ticket y todas las formas de pago con su total (⭐ la más barata)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.sales=[]; V.stock={GS:{20000:2,10000:5,5000:5,2000:5,1000:5,500:5,100:10},BRL:{},USD:{}}; const t=V.tabs[0]; V.cur=t.id; t.cli=''; t.cid=''; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:100000,uq:1,cost:35000}]; window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 const t0=await p.evaluate(()=>+document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,''));
 const fps=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-vp="fpx"]')].map(x=>x.dataset.fp+(/⭐/.test(x.textContent)?'⭐':'')).join(',')); ok(/ef/.test(fps)&&/tc/.test(fps)&&/tb/.test(fps)&&/⭐/.test(fps),'todas las formas de pago con su total y ⭐: '+fps);
 await p.keyboard.type('1'); await p.waitForTimeout(200);
 await p.click('.vt-ov [data-vp="cq"]'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); ov.querySelector('[data-q="n"]').value='Cliente T536'; ov.querySelector('[data-q="doc"]').value='5360536'; ov.querySelector('[data-q="tel"]').value='0981 536 536'; ov.querySelector('[data-ok]').click(); }); await p.waitForTimeout(500);
 const r=await p.evaluate(()=>({ open:!!document.querySelector('.vt-ov [data-rqn]'), rec:document.querySelector('.vt-ov [data-rqn="100000"]').value, tot:+document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,''), cli:document.querySelector('.vt-ov .vt-cbar').textContent, ruc:document.querySelector('.vt-ov [data-vfx="fRuc"]').value }));
 ok(r.open&&r.rec==='1','sigue en el cuadro de cobro con el billete cargado');
 ok(r.tot<t0,'precio recalculado con descuento de registrado: '+t0+' → '+r.tot);
 ok(/Cliente T536/.test(r.cli)&&r.ruc==='5360536','cliente y C.I. ya cargados para el ticket');
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400);
 const s=await p.evaluate(()=>{ const V=window.__vt.st(), x=V.sales[V.sales.length-1]; return x&&{cli:x.cli,ruc:x.fRuc}; }); ok(s&&s.cli==='Cliente T536'&&s.ruc==='5360536','la venta queda con el cliente y su C.I.');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
