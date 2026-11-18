// v1261 · ficha: si el mes abierto tiene horario APARTE, se avisa grande (con el turno base) y un toque lo vuelve al turno base
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; P.cur.emp=E.id; P.cur.mon='2026-06'; E.sch=[0,1,2,3,4,5,6].map(i=>({e:'15:00',s:'23:00',off:i===0})); E.turnoX='TARDE-NOCHE'; E.schM={'2026-06':{sch:[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})),n:'EXTENDIDO',ts:Date.now()}}; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1200); await p.evaluate(()=>document.querySelectorAll('.k-party').forEach(x=>x.remove()));
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(x=>x.remove()); document.querySelector('#planilla [data-plg="ficha"]').click(); }); await p.waitForTimeout(800);
 const t=await p.evaluate(()=>{ const o=document.querySelector('.ico-ov'); return o?o.textContent:''; });
 ok(/usa un horario APARTE: 06:30–23:00/.test(t)&&/turno base es[\s\S]*15:00–23:00/.test(t),'avisa grande: junio usa 06:30–23:00 aparte y el base es 15:00–23:00');
 await p.evaluate(()=>document.querySelector('.ico-ov [data-pf="schMdel"]').click()); await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{ const E=window.__pla.st().emps[3]; return !!(E.schM&&E.schM['2026-06']); });
 ok(!r,'«↩ Usar el turno base en junio» borra el horario aparte');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
