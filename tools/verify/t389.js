// v1218 · con una pantalla abierta (Cierre) el cartel de versión se achica a la esquina y no tapa ningún botón; al volver, vuelve al centro
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:412,height:900}});
 await p.waitForTimeout(2500); const w0=await p.evaluate(()=>document.getElementById('verTag').getBoundingClientRect().width);
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(2600);
 const r=await p.evaluate(()=>{ const v=document.getElementById('verTag'), R=v.getBoundingClientRect(); const hit=[...document.querySelectorAll('#cierre button')].filter(x=>{const q=x.getBoundingClientRect(); return q.width && !(q.right<R.left||q.left>R.right||q.bottom<R.top||q.top>R.bottom);}).length; return {w:R.width,hit,t:v.textContent}; });
 ok(r.w<110 && r.w<w0,'en el Cierre el cartel es chico ('+Math.round(r.w)+' px): '+r.t);
 ok(r.hit===0,'no tapa ningún botón');
 await p.evaluate(()=>document.querySelector('#cierre [data-cz="x"]').click()); await p.waitForTimeout(2600);
 ok(await p.evaluate(()=>document.getElementById('verTag').getBoundingClientRect().width)>=w0-2,'al volver, el cartel vuelve a verse completo');
 ok(!errs.length,'sin errores: '+errs.slice(0,2).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
