// v1262 · 🗂️ ficha simple: solo Sucursal, Turno, Desde el mes y «💾 Guardar y aplicar» (un solo botón); lo demás escondido
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; P.cur.emp=E.id; P.cur.mon='2026-11'; delete E.aud; E.tipo='ext'; E.turnoX='EXTENDIDO'; E.sch=[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})); E.asig=[]; delete E.schM; delete E.turDesde; E.days=E.days||{}; E.days['2026-07']={'3':{e:'06:30',s:'23:00'}}; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1200); await p.evaluate(()=>document.querySelectorAll('.k-party').forEach(x=>x.remove()));
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(x=>x.remove()); document.querySelector('#planilla [data-plg="ficha"]').click(); }); await p.waitForTimeout(800);
 const v=await p.evaluate(()=>{ const o=document.querySelector('.ico-ov'), vis=el=>!!el&&el.getClientRects().length>0; return { simp:vis(o.querySelector('.pl-simp')), suc:vis(o.querySelector('#pfS')), tur:vis(o.querySelector('#tfT')), mes:vis(o.querySelector('#tfM')), go:vis(o.querySelector('[data-pfsave]')), ok:vis(o.querySelector('[data-pf="ok"]')), apl:vis(o.querySelector('[data-tfa]')), lib:[...o.querySelectorAll('input[type=checkbox]')].filter(vis).length, hid:vis(o.querySelector('.pl-cust')), oth:vis(o.querySelector('.pl-sother #pfE'))&&vis(o.querySelector('.pl-sother #pfI')) }; });
 ok(v.simp&&v.suc&&v.tur&&v.mes&&v.go,'se ven solo Sucursal, Turno, Desde el mes y «💾 Guardar y aplicar»');
 ok(!v.ok&&!v.apl&&!v.hid,'ya no se ven «Guardar ficha», «Aplicar» ni las horas a mano');
 ok(v.oth,'cargo, categoría, estado y fecha de ingreso se ven en orden');
 await p.evaluate(()=>{ const o=document.querySelector('.ico-ov'), C=window.__pla.st().cfg, t=C.turnos.find(t=>t.e==='15:00'&&t.s==='23:00'); o.querySelector('#tfT').value=t.id; o.querySelector('#tfT').dispatchEvent(new Event('change')); o.querySelector('#tfM').value='2026-06'; if(o.querySelector('#tfC')) o.querySelector('#tfC').checked=true; });
 await p.evaluate(()=>{ const i=document.querySelector('.ico-ov #pfI'); if(i) i.value=''; });
 await p.click('.ico-ov [data-pfsave]'); await p.waitForTimeout(900);
 const r=await p.evaluate(()=>{ const E=window.__pla.st().emps[3]; return { open:!!document.querySelector('.ico-ov .pl-simp'), sch:E.sch[1].e+'-'+E.sch[1].s, desde:E.turDesde&&E.turDesde.mon, jul:!!(E.schM&&E.schM['2026-07']) }; });
 ok(!r.open,'se guarda aunque la fecha de ingreso esté vacía');
 ok(!r.open&&r.sch==='15:00-23:00'&&r.desde==='2026-06'&&!r.jul,'un toque guarda y aplica: 15:00–23:00 desde junio, julio sin apartado ('+JSON.stringify(r)+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
