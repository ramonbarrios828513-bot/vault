// v1256 · desvinculado del Excel: el botón «Importar Excel» no aparece y «Importar del sistema» con un archivo viejo NO pisa el turno aplicado
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 const r=await p.evaluate(()=>{ const P=window.__pla.st(), C=P.cfg, E=P.emps[3]; E.tipo='hib'; E.turnoX='HÍBRIDO'; E.sch=[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})); E.asig=[];
  const viejo=window.__pla.exp(); const t=C.turnos.find(t=>t.e==='15:00'&&t.s==='23:00'); window.__plTurApply(E,C,t.id,'2026-06',true);
  const txt=typeof viejo==='string'?viejo:JSON.stringify(viejo); let ok1=true; try{ window.__pla.imp(txt); }catch(e){ ok1=String(e); }
  const E2=window.__pla.st().emps.find(x=>x.id===E.id); C.xlOn=true; return {imp:ok1, sch:E2.sch[1].e+'-'+E2.sch[1].s, turnoX:E2.turnoX, sinHib:E2.sinHibDesde}; });
 ok(r.sch==='15:00-23:00'&&/TARDE/.test(r.turnoX)&&r.sinHib==='2026-06','importar un archivo viejo no vuelve a híbrido ('+JSON.stringify(r)+')');
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1200);
 ok(await p.evaluate(()=>!document.querySelector('#planilla [data-plxl]')),'el botón «Importar Excel de RRHH» ya no aparece (aunque estuviera prendido)');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
