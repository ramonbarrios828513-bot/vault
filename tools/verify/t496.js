// v1267 · los botones flotantes no tapan los campos (Nuevo artículo: el «⬅ Volver» amarillo tapaba «Principio activo»)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('text=➕ Nuevo artículo'); await p.waitForTimeout(800);
 await p.evaluate(()=>window.__fabChk&&window.__fabChk()); await p.waitForTimeout(200);
 const r=await p.evaluate(()=>{ const f=document.getElementById('vxBack'), rr=f.getBoundingClientRect(); const e=document.elementFromPoint(rr.left+rr.width/2, rr.top+rr.height/2); return { pass:f.classList.contains('fab-pass'), top:e.tagName+'.'+(e.dataset.arf||'') }; });
 ok(r.pass && /INPUT|SELECT|TEXTAREA/.test(r.top),'el campo de abajo del «⬅ Volver» amarillo se puede tocar ('+JSON.stringify(r)+')');
 await p.click('[data-arf="pa"]'); await p.waitForTimeout(200);
 const t=await p.evaluate(()=>({ ty:document.body.classList.contains('typing'), op:getComputedStyle(document.getElementById('vxBack')).opacity, q:getComputedStyle(document.getElementById('qcFab')||document.body).opacity }));
 ok(t.ty && +t.op===0,'mientras escribís, los botones flotantes se esconden ('+JSON.stringify(t)+')');
 await p.evaluate(()=>document.activeElement.blur()); await p.evaluate(()=>{ const ov=document.getElementById('articulos'); ov.scrollTop=0; }); await p.waitForTimeout(1200);
 const v=await p.evaluate(()=>({ ty:document.body.classList.contains('typing'), op:getComputedStyle(document.getElementById('vxBack')).opacity }));
 ok(!v.ty && +v.op>0,'al dejar de escribir vuelven ('+JSON.stringify(v)+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
