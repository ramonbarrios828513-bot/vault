// v1324 · 🗓️ Planilla: los tres bloques (noche-madrugada · mañana-tarde · tarde-noche) son personalizables POR FUNCIONARIO; de fábrica 23:00–06:30 · 06:30–15:30 · 15:00–23:00; «le tocaba» va dentro de su bloque
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1600,height:900}});
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); window.__pla.open(); }); await p.waitForTimeout(800);
 await p.evaluate(()=>{ const P=window.__pla.st(); const mk=(id,e,s,days)=>{ const sch={}; for(let i=1;i<7;i++) sch[i]={e:e,s:s}; sch[0]={e:'',s:'',off:true}; const E={id:id,n:id,sal:3044000,tipo:'fijo',sch:sch,days:{'2026-06':days}}; P.emps.push(E); window.__pla.calc(E,'2026-06',P.cfg); return E; }; mk('A586','15:00','23:00',{2:{e:'08:30',sd:'15:00',vd:'16:00',s:'23:00'},3:{e:'15:00',s:'23:00'}}); mk('B586','07:00','16:00',{2:{e:'07:00',sd:'12:00',vd:'13:00',s:'16:00'}}); P.cur=Object.assign(P.cur||{},{mon:'2026-06',emp:'A586'}); window.__pla.open(); }); await p.waitForTimeout(2800);
 const cards=d=>p.evaluate(d=>{ const r=document.querySelector('.pl-tb > .pl-r[data-d="'+d+'"]'); return [...r.querySelectorAll('.v14-tu')].map(c=>c.innerText.replace(/\s+/g,' ')); },d);
 let c=await cards(3); console.log(c.join(' || '));
 ok(/Noche-madrugada 23:00 a 06:30/.test(c[0])&&/Mañana-tarde 06:30 a 15:30/.test(c[1])&&/Tarde-noche 15:00 a 23:00/.test(c[2]),'de fábrica: 🌙 23:00–06:30 · ☀️ 06:30–15:30 · 🌆 15:00–23:00, en ese orden');
 ok(/Le tocaba: 15:00 a 23:00/.test(c[2])&&!/Le tocaba/.test(c[1]),'«le tocaba» está dentro del bloque tarde-noche');
 ok(/15:00 – 23:00/.test(c[2])&&/8:00 h/.test(c[2])&&/sin horas/.test(c[1]),'entró 15:00: las 8 h van enteras a tarde-noche (aunque 15:00–15:30 se pisa con mañana-tarde)');
 c=await cards(2); ok(/08:30 – 15:00/.test(c[1])&&/16:00 – 23:00/.test(c[2]),'08:30 a 23:00 con corte 15–16: mañana-tarde 08:30–15:00 y tarde-noche 16:00–23:00');
 // bloques propios para B586: 07–16 · 16–24 · 00–07
 await p.evaluate(()=>{ const P=window.__pla.st(); P.cur.emp='B586'; window.__pla.open(); }); await p.waitForTimeout(2500);
 await p.evaluate(()=>window.__v14.cfg()); await p.waitForTimeout(400);
 const sc=await p.evaluate(()=>{ const s=document.querySelector('#v14Cfg [data-v24sc]'); return [s.value,[...s.options].map(o=>o.textContent).join(' | ')]; }); ok(sc[0]==='gen'&&/Solo B586/.test(sc[1]),'la configuración ofrece «solo este funcionario» o «general»: '+sc[1]);
 await p.selectOption('#v14Cfg [data-v24sc]','emp'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ const V={nm:['00:00','07:00'],mt:['07:00','16:00'],tn:['16:00','24:00']}; const T=window.__pla.st().cfg.vTurnos; document.querySelectorAll('#v14Cfg .v14-cr').forEach((r,i)=>{ const v=V[T[i].id]; r.querySelector('[data-f="e"]').value=v[0]; r.querySelector('[data-f="s"]').value=v[1]; }); document.querySelector('#v14Cfg [data-v14save]').click(); }); await p.waitForTimeout(700);
 c=await cards(2); console.log(c.join(' || ')); ok(/Mañana-tarde 07:00 a 16:00/.test(c[1])&&/Le tocaba: 07:00 a 16:00/.test(c[1])&&/Tarde-noche 16:00 a 24:00/.test(c[2]),'B586 tiene sus propios bloques 07–16 · 16–24 · 00–07');
 await p.evaluate(()=>{ const P=window.__pla.st(); P.cur.emp='A586'; window.__pla.open(); }); await p.waitForTimeout(2500);
 c=await cards(3); ok(/Tarde-noche 15:00 a 23:00/.test(c[2]),'A586 sigue con los generales (no se le cambió nada)');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
