// v1282 · prevención: TODOS los botones de arriba de la Caja inteligente se tocan uno por uno y ninguno puede dar error (ej. «hoy is not a function»)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__vt.open()); await p.waitForTimeout(400);
 const ks=await p.evaluate(()=>[...document.querySelectorAll('#ventas .vt-top [data-vt]')].map(x=>x.dataset.vt).filter(k=>!/^(x|tdel)$/.test(k)));
 for(const k of ks){ const n0=errs.length; await p.evaluate(k=>{ const bt=document.querySelector('#ventas .vt-top [data-vt="'+k+'"]'); if(bt) bt.click(); },k); await p.waitForTimeout(300);
  ok(errs.length===n0,'botón '+k+' sin error '+errs.slice(n0).join(' | '));
  await p.evaluate(()=>{ document.querySelectorAll('.vt-ov, .ask-ov').forEach(o=>o.remove()); const vE=document.getElementById('ventas'); if(vE&&vE.hidden) window.__vt.open(); }); await p.waitForTimeout(150); }
 ok(ks.includes('hoy'),'se probó 📊 Ventas del turno ('+ks.length+' botones)');
 await b.close(); process.exit(fail?1:0); })();
