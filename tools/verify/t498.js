// v1267 · RRHH: funcionario nuevo sin cargar horas a mano → se abre la ficha, se elige sucursal y turno, y el horario sale del turno
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(900);
 await p.click('#planilla [data-pl="add"]'); await p.waitForTimeout(600);
 const g=await p.evaluate(()=>{ const d=document.querySelector('.ico-ov .pe-day'); return { grid: !!(d && d.getBoundingClientRect().width>0), hint: /se abre la ficha/.test(document.querySelector('.ico-ov').textContent) }; });
 ok(!g.grid && g.hint,'el formulario nuevo no pide horas a mano y explica que salen del turno '+JSON.stringify(g));
 await p.fill('#peN','Funcionario QA'); await p.fill('#peS','2900000'); await p.click('.ico-ov [data-pe="ok"]'); await p.waitForTimeout(1200);
 const f=await p.evaluate(()=>({ simp: !!document.querySelector('.pl-simp'), tur: !!document.querySelector('#tfT'), emp: (window.__pla && 1) }));
 ok(f.simp && f.tur,'al guardar se abre la ficha con ① Sucursal y ② Turno '+JSON.stringify(f));
 const opts=await p.evaluate(()=>[...document.querySelectorAll('#tfT option')].map(o=>o.value+'='+o.text).slice(0,8)); console.log('turnos:',opts.join(' | '));
 await p.selectOption('#pfS',{index:2}); await p.selectOption('#tfT','tn'); await p.click('.pl-simp [data-pfsave]'); await p.waitForTimeout(1500);
 const E=await p.evaluate(()=>{ const P=window.__pla.st(); const E=P.emps.find(x=>x.n==='Funcionario QA'); return E&&{ suc:E.suc, td:E.turDesde, sch:E.sch&&E.sch[1] }; });
 ok(E && E.sch && E.sch.e==='15:00' && E.sch.s==='23:00' && E.td,'con «Tarde-noche» aplicado, el horario es 15:00 a 23:00 y queda el turno '+JSON.stringify(E));
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
