// v1255 · 🕑 turno fácil en la ficha: turno + desde mes + Aplicar → rige en planilla, cálculo e impresión; meses anteriores quedan
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>{ const P=window.__pla.st(), C=P.cfg, E=P.emps[3]; P.cur.emp=E.id; P.cur.mon='2026-11'; delete E.aud; E.tipo='hib'; E.turnoX='HÍBRIDO'; E.sch=[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})); E.asig=[{id:'x',desde:'2026-11-18',tur:(C.turnos.find(t=>t.e==='15:00'&&t.s==='23:00')||{}).id}]; E.days['2026-05']={'4':{e:'06:30',s:'23:00'}}; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1500); await p.evaluate(()=>document.querySelectorAll('.ico-ov,.k-party').forEach(x=>x.remove()));
 await p.evaluate(()=>document.querySelector('#planilla [data-plg="ficha"]').click()); await p.waitForTimeout(800);
 ok(await p.evaluate(()=>!!document.querySelector('#tfT')&&!!document.querySelector('#tfM')&&!!(document.querySelector('[data-pfsave]')||document.querySelector('[data-tfa]'))),'la ficha tiene Turno + desde el mes + Guardar y aplicar');
 await p.evaluate(()=>{ const C=window.__pla.st().cfg, t=C.turnos.find(t=>t.e==='15:00'&&t.s==='23:00'); document.getElementById('tfT').value=t.id; document.getElementById('tfM').value='2026-06'; document.getElementById('tfC').checked=true; document.querySelector('[data-tfa]').click(); }); await p.waitForTimeout(900);
 const r=await p.evaluate(()=>{ const P=window.__pla.st(), C=P.cfg, E=P.emps[3]; const pr=m=>{ const h=window.__plaAsis(m,4).split('class="pg"')[4]||''; return {tur:(h.match(/TURNO<\/div><div class="v">([^<]*)/)||[])[1], u:[...new Set(h.match(/\d\d:\d\d a \d\d:\d\d/g)||[])]}; };
  return {E:{turnoX:E.turnoX,noCut:E.opt.noCut,exD:E.opt.exD,sinHib:E.sinHibDesde,asig:E.asig.map(a=>!!a.anul)}, may:pr('2026-05'), jun:pr('2026-06'), nov:pr('2026-11'), aplJun:window.__plSinHib.aplica(E,'2026-06',C), aplMay:window.__plSinHib.aplica(E,'2026-05',C), ficha:!!document.querySelector('.pl-tfac')}; });
 ok(/TARDE/.test(r.jun.tur)&&r.jun.u.join()==='15:00 a 23:00','junio impreso: TARDE-NOCHE 15:00 a 23:00 todos los días ('+JSON.stringify(r.jun)+')');
 ok(/TARDE/.test(r.nov.tur)&&r.nov.u.join()==='15:00 a 23:00','noviembre impreso: 15:00 a 23:00 todo el mes');
 ok(/H[IÍ]BRIDO/.test(r.may.tur)&&r.may.u.join()==='06:30 a 23:00','mayo (antes del cambio) queda como estaba');
 ok(r.E.noCut&&r.E.exD,'sin corte y las extras siguen activas');
 ok(r.aplJun&&!r.aplMay,'desde junio el cálculo ya no usa reglas de híbrido; mayo sí');
 ok(r.E.asig.every(Boolean),'el cambio programado del 18/11 queda tachado (no borrado)');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
