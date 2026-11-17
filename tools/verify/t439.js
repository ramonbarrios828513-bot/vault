// v1248 · 👤 planilla: el funcionario elegido NO cambia solo (filtro o sincronización) y en 🔍 auditoría no salen avisos de «día sin cargar»
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 const mon=await p.evaluate(()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); });
 const id=await p.evaluate((mon)=>{ const P=window.__pla.st(); const E=P.emps[2]; P.cur.emp=E.id; P.cur.mon=mon; delete E.aud; delete E.audSw; delete E.audW; E.days[mon]={}; P.cur.f={q:String(P.emps[0].n||'').split(' ')[0]}; window.__plApplying=true; return E.id; },mon);
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1500); await p.evaluate(()=>document.querySelectorAll('.ico-ov,.k-party').forEach(x=>x.remove()));
 ok(await p.evaluate((id)=>window.__pla.st().cur.emp===id,id),'con un filtro que no lo incluye, sigue el mismo funcionario elegido');
 const r=await p.evaluate(()=>{ const M=window.__memcMerge; const L={__mt:{pla:1}, pla:{emps:[{id:'a',n:'A'}], cur:{emp:'a'}}}, R={__mt:{pla:9}, pla:{emps:[{id:'a',n:'A'},{id:'b',n:'B'}], cur:{emp:'b'}}}; return M(L,R).pla.cur.emp; });
 ok(r==='a','al sincronizar con otro equipo NO cambia el funcionario que estás mirando');
 await p.evaluate(()=>document.querySelector('#planilla .pl-modebar [data-plaudm="on"]').click()); await p.waitForTimeout(900);
 await p.evaluate(()=>document.querySelectorAll('.ico-ov,.k-party').forEach(x=>x.remove()));
 const t=await p.evaluate(()=>document.getElementById('planilla').innerText);
 ok(/AUDITOR/.test(t) && !/sin cargar y sin motivo/.test(t),'en modo auditoría no aparecen «Día X sin cargar y sin motivo»');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
