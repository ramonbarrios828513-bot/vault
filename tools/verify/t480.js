// v1261 · EL TURNO APLICADO MANDA: un horario «aparte» viejo de junio (06:30–23:00) no se usa; la ficha no permite apartar otro horario por mes; impresión en 15–23
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3], C=P.cfg; P.cur.emp=E.id; P.cur.mon='2026-06'; delete E.aud; E.sch=[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})); E.asig=[]; delete E.schM; const t=C.turnos.find(t=>t.e==='15:00'&&t.s==='23:00'); window.__plTurApply(E,C,t.id,'2026-06',true); E.schM=E.schM||{}; E.schM['2026-06']={sch:[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})),n:'EXTENDIDO',ts:Date.now()+5000}; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1200); await p.evaluate(()=>document.querySelectorAll('.k-party').forEach(x=>x.remove()));
 const pr=await p.evaluate(()=>{ const h=window.__plaAsis('2026-06',4).split('class="pg"')[4]||''; return [...new Set(h.match(/\d\d:\d\d a \d\d:\d\d/g)||[])].join(); });
 ok(pr==='15:00 a 23:00','junio imprime 15:00 a 23:00 aunque haya un apartado viejo ('+pr+')');
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(x=>x.remove()); document.querySelector('#planilla [data-plg="ficha"]').click(); }); await p.waitForTimeout(800);
 const t=await p.evaluate(()=>document.querySelector('.ico-ov').textContent);
 ok(!/usa un horario APARTE/.test(t)&&!/Extendido 06:30/.test(t),'la ficha de junio NO muestra el apartado viejo');
 await p.evaluate(()=>{ const o=document.querySelector('.ico-ov'); const ins=[...o.querySelectorAll('.pl-cust input')]; if(ins[0]){ ins[0].value='06:30'; ins[0].dispatchEvent(new Event('input',{bubbles:true})); } if(ins[1]){ ins[1].value='23:00'; ins[1].dispatchEvent(new Event('input',{bubbles:true})); } }); await p.waitForTimeout(300);
 await p.evaluate(()=>document.querySelector('[data-pf="ok"]').click()); await p.waitForTimeout(900);
 const r=await p.evaluate(()=>{ const E=window.__pla.st().emps[3]; const o=E.schM&&E.schM['2026-06']; return (o&&o.man?'apartado-nuevo':'sin-apartado')+'|'+E.sch[1].e; });
 ok(/^sin-apartado\|15:00/.test(r),'guardar la ficha en junio con otras horas NO aparta otro horario ('+r+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
