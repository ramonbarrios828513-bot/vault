// v1266 · la Biblioteca y Chicos del inicio tienen «⬅ Volver al inicio»
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup(); await p.evaluate(()=>{ document.querySelectorAll('.big-ov:not([hidden])').forEach(x=>x.hidden=true); });
 for (const t of ['lib','kids']) {
  await p.evaluate((t)=>{ const x=document.querySelector('.home-tabs [data-htab="'+t+'"]'); x.click(); }, t); await p.waitForTimeout(1200);
  const n=await p.evaluate(()=>{ const x=document.querySelector('#homeList [data-hmback]'); return x? x.textContent : ''; });
  ok(/Volver al inicio/.test(n),t+': está el botón «Volver al inicio» ('+n.trim().slice(0,40)+')');
  await p.click('#homeList [data-hmback]'); await p.waitForTimeout(900);
  const r=await p.evaluate(()=>({ ab:!!document.querySelector('#homeList [data-hmfiles]'), sel:(document.querySelector('.home-tabs [aria-selected="true"]')||{}).dataset }));
  ok(r.ab,t+': al tocarlo vuelve al inicio («📂 Abrir mis archivos») '+JSON.stringify(r.sel||{}));
 }
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
