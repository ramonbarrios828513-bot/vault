// v1256 · después de ✅ Aplicar tarde-noche, abrir la ficha y ✓ Guardar NO vuelve a 06:30–23:00 (junio y noviembre)
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 const ficha=async()=>{ await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(x=>x.remove()); document.querySelector('#planilla [data-plg="ficha"]').click(); }); await p.waitForTimeout(700); };
 const st=()=>p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; const pr=m=>{ const h=window.__plaAsis(m,4).split('class="pg"')[4]||''; return [...new Set(h.match(/\d\d:\d\d a \d\d:\d\d/g)||[])].join(); }; return {sel:document.getElementById('pfT')?document.getElementById('pfT').selectedOptions[0].textContent:'', sch1:E.sch[1].e+'-'+E.sch[1].s, jun:pr('2026-06'), nov:pr('2026-11'), schJun:E.schM&&E.schM['2026-06']?E.schM['2026-06'].sch[1].e:''}; });
 for (const mon of ['2026-06','2026-11']) {
  await p.evaluate((mon)=>{ const P=window.__pla.st(), E=P.emps[3]; P.cur.emp=E.id; P.cur.mon=mon; delete E.aud; E.tipo='hib'; E.turnoX='HÍBRIDO'; delete E.sinHibDesde; delete E.schM; E.sch=[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})); E.asig=[]; },mon);
  await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1200); await p.evaluate(()=>document.querySelectorAll('.k-party').forEach(x=>x.remove()));
  await ficha();
  await p.evaluate(()=>{ const C=window.__pla.st().cfg, t=C.turnos.find(t=>t.e==='15:00'&&t.s==='23:00'); document.getElementById('tfT').value=t.id; document.getElementById('tfM').value='2026-06'; document.getElementById('tfC').checked=true; document.querySelector('[data-tfa]').click(); }); await p.waitForTimeout(700);
  await ficha(); const a=await st();
  ok(/Tarde-noche/.test(a.sel),'['+mon+'] al reabrir, el Turno base dice Tarde-noche ('+a.sel+')');
  await p.evaluate(()=>document.querySelector('[data-pf="ok"]').click()); await p.waitForTimeout(900);
  const z=await st();
  ok(z.sch1==='15:00-23:00'&&z.jun==='15:00 a 23:00'&&z.nov==='15:00 a 23:00','['+mon+'] después de ✓ Guardar ficha sigue 15:00 a 23:00 ('+JSON.stringify(z)+')');
 }
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
