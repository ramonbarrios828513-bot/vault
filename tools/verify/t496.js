// v1267 · los botones flotantes no tapan los campos (Nuevo artículo: el «⬅ Volver» amarillo tapaba «Principio activo»)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('text=➕ Nuevo artículo'); await p.waitForTimeout(800);
 await p.evaluate(()=>window.__fabChk&&window.__fabChk()); await p.waitForTimeout(200);
 const r=await p.evaluate(()=>{ const f=document.getElementById('vxBack'), rr=f.getBoundingClientRect(); const pa=document.querySelector('[data-arf="pa"]').getBoundingClientRect(); const over=Math.max(0,Math.min(rr.right,pa.right)-Math.max(rr.left,pa.left))>pa.width*0.2; return { mini:f.classList.contains('fab-mini'), w:Math.round(rr.width), over, pe:getComputedStyle(f).pointerEvents }; });
 ok(r.mini && r.w<=60 && !r.over && r.pe!=='none','el «⬅ Volver» amarillo se achica a la esquina y deja casi todo el campo libre, pero sigue funcionando ('+JSON.stringify(r)+')');
 await p.click('[data-arf="pa"]'); await p.waitForTimeout(200);
 const t=await p.evaluate(()=>({ ty:document.body.classList.contains('typing'), w:Math.round(document.getElementById('vxBack').getBoundingClientRect().width), q:getComputedStyle(document.getElementById('qcFab')||document.body).opacity }));
 ok(t.ty && t.w<=60 && +t.q===0,'mientras escribís, 🧮 se esconde y ⬅ Volver queda chiquito ('+JSON.stringify(t)+')');
 await p.evaluate(()=>document.activeElement.blur()); await p.evaluate(()=>{ const ov=document.getElementById('articulos'); ov.scrollTop=0; }); await p.waitForTimeout(1200);
 const v=await p.evaluate(()=>({ ty:document.body.classList.contains('typing'), op:getComputedStyle(document.getElementById('vxBack')).opacity }));
 ok(!v.ty && +v.op>0,'al dejar de escribir sigue a la vista ('+JSON.stringify(v)+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
