// v1217 · en el celular las pestañas del Cierre (con su 👁) no se encimen: cada una con su ancho, una al lado de la otra
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:412,height:900}});
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(900);
 const r=await p.evaluate(()=>{ const bs=[...document.querySelectorAll('#cierre .tes-tabs button[data-cz="tab"]')].map(x=>x.getBoundingClientRect()); let ov=0; for(let i=1;i<bs.length;i++){ if(bs[i].top===bs[i-1].top && bs[i].left<bs[i-1].right-2) ov++; } return {n:bs.length, min:Math.min(...bs.map(x=>x.width)), ov}; });
 console.log(JSON.stringify(r));
 ok(r.n>=5,'hay pestañas');
 ok(r.min>=70,'ninguna pestaña aplastada (ancho mínimo '+Math.round(r.min)+' px)');
 ok(r.ov===0,'ninguna pestaña encima de otra');
 ok(!errs.length,'sin errores: '+errs.slice(0,2).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
