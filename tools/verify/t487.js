// v1262 · 📂 en el celular, tocar «Mis archivos» baja directo a la lista (no queda escondida abajo de Estudio y Trabajo)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}}); await p.waitForTimeout(1200); await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>{ if(!/home/.test(x.id)) x.hidden=true; }); }); await p.waitForTimeout(400);
 const t=await p.$$('[data-htab="files"]'); for (const x of t){ if(await x.isVisible()){ await x.click(); break; } } await p.waitForTimeout(1200);
 const top=await p.evaluate(()=>{ const e=document.querySelector('.hm-row, .hm-empty'); return e? Math.round(e.getBoundingClientRect().top):-1; });
 ok(top>=0&&top<844,'la lista de archivos queda a la vista ('+top+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
