// v1314 · 🗓️ Planilla, cada fecha más clara (solo vista): día completo · horas agrupadas por turno · «🔎 Resumen del día» · tira de días · turnos editables · feriado con su color · y NO cambia ningún cálculo
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:700}});
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); window.__pla.open(); }); await p.waitForTimeout(800);
 // un funcionario de prueba con tres días cargados (lun 5, mar 6 y sáb 10 de octubre de 2026)
 const net0=await p.evaluate(()=>{ const P=window.__pla.st(); const E={id:'t575',n:'PRUEBA VISTA',sal:2899048,tipo:'fijo',days:{'2026-10':{5:{e:'06:30',sd:'12:00',vd:'13:00',s:'15:00'},6:{e:'08:53',sd:'15:26',vd:'16:55',s:'23:00'},10:{e:'22:00',s:'02:00'}}}}; P.emps.push(E); /* v1324: esta prueba usa los bloques viejos (06–15 · 15–24 · 00–06) puestos a mano; los de fábrica nuevos se prueban en t586 */ P.cfg.vTurnos=[{id:'mt',ic:'☀️',n:'Mañana-tarde',e:'06:00',s:'15:00',on:true},{id:'tn',ic:'🌆',n:'Tarde-noche',e:'15:00',s:'24:00',on:true},{id:'nm',ic:'🌙',n:'Noche-madrugada',e:'00:00',s:'06:00',on:true}]; P.cfg.vT24=1; P.cfg.vT19=1; P.cur=Object.assign(P.cur||{},{mon:'2026-10',emp:'t575'}); const R=window.__pla.calc(E,'2026-10',P.cfg); window.__pla.open(); return JSON.stringify([R.neto,R.L]); }); await p.waitForTimeout(2300);
 const r=await p.evaluate(()=>{ const row=d=>document.querySelector('.pl-tb > .pl-r[data-d="'+d+'"]'); const dd=d=>row(d).querySelector('.pl-dd').innerText.replace(/\s+/g,' '); const cards=d=>[...row(d).querySelectorAll('.v14-tu')].map(c=>c.innerText.replace(/\s+/g,' ')); const chip=d=>{ const c=row(d).querySelector('.v19-cut'); return c?c.innerText.replace(/\s+/g,' '):''; }; return {k5:chip(5),d5:dd(5),d6:dd(6),d10:dd(10),c5:cards(5),c6:cards(6),c10:cards(10),c7:cards(7),sat:row(10).classList.contains('v14-sat'),dom:row(11).classList.contains('v14-dom'),strip:document.querySelectorAll('.v14-strip [data-v14go]').length,w:document.querySelectorAll('.v14-strip [data-v14go].w').length,res:document.querySelectorAll('.v14-res').length,h6:Math.round(row(6).getBoundingClientRect().height)}; });
 ok(/^Lunes 5/.test(r.d5)&&/^Martes 6/.test(r.d6)&&/^Sábado 10/.test(r.d10),'cada fecha dice el día completo: «'+r.d5.slice(0,8)+'», «'+r.d6.slice(0,9)+'», «'+r.d10.slice(0,10)+'»');
 ok(r.c5.length===3&&/^🌙 Noche-madrugada .*0:00 h/.test(r.c5[0])&&/Mañana-tarde .*06:30 – 15:00 7:30 h/.test(r.c5[1])&&/^🌆 Tarde-noche .*0:00 h/.test(r.c5[2])&&/Descanso: 1:00 h/.test(r.k5),'lunes: los tres bloques en orden (🌙 izquierda · ☀️ medio · 🌆 al final), 7:30 en Mañana-tarde y el descanso en su botoncito arriba («'+r.k5+'»)');
 ok(/Mañana-tarde .*08:53 – 15:00 6:07 h/.test(r.c6[1])&&/Tarde-noche .*15:00 – 23:00 6:31 h/.test(r.c6[2])&&/3:00 nocturnas/.test(r.c6[2]),'martes: 6:07 en Mañana-tarde y 6:31 en Tarde-noche (con 3:00 nocturnas)');
 ok(/Noche-madrugada .*00:00 – 02:00 2:00 h/.test(r.c10[0])&&/Tarde-noche .*22:00 – 00:00 2:00 h/.test(r.c10[2])&&!/Fuera de los turnos/.test(r.c10.join(' | ')),'sábado 22 a 02: 2 h en Tarde-noche y 2 h en Noche-madrugada (que ahora viene a la vista): '+r.c10.join(' | '));
 ok(r.c7.length===0,'un día sin marcas no muestra tarjetas');
 ok(r.sat&&r.dom,'sábado y domingo tienen su color');
 ok(r.strip===31&&r.w===3&&r.res===31,'arriba está la tira con los 31 días (3 con marcas) y cada fecha tiene «🔎 Resumen del día»');
 // tocar un día de la tira lleva a esa fecha
 await p.click('.v14-strip [data-v14go="10"]'); await p.waitForTimeout(900);
 ok(await p.evaluate(()=>{ const q=document.querySelector('.pl-tb > .pl-r[data-d="10"]').getBoundingClientRect(); return q.top>=0&&q.top<innerHeight-80; }),'tocar el 10 en la tira lleva a esa fecha');
 // resumen del día
 await p.evaluate(()=>document.querySelector('.pl-tb > .pl-r[data-d="6"] .v14-res').click()); await p.waitForTimeout(500);
 const m=await p.evaluate(()=>document.getElementById('v14Ov').innerText.replace(/\s+/g,' '));
 ok(/Martes 6 · PRUEBA VISTA/.test(m)&&/1 · Lo que marcó/.test(m)&&/08:53/.test(m)&&/2 · Sus horas, por turno/.test(m)&&/Tarde-noche/.test(m)&&/3 · Qué pasó/.test(m)&&/4 · Qué se aplica/.test(m),'el resumen del día trae lo que marcó, sus horas por turno, qué pasó y qué cobra');
 await p.click('#v14Ov [data-v14nav="-1"]'); await p.waitForTimeout(400);
 ok(/Lunes 5/.test(await p.evaluate(()=>document.getElementById('v14Ov').innerText)),'«◀ Día anterior» pasa al lunes 5 sin cerrar');
 await p.click('#v14Ov .ask-b [data-v14x]'); await p.waitForTimeout(300);
 // turnos editables: encender Noche-madrugada → las 2 h de la madrugada del sábado pasan a ese turno
 await p.click('.v14-strip [data-v14cfg]'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ const r=document.querySelectorAll('#v14Cfg .v14-cr')[2]; r.querySelector('[data-f="on"]').checked=true; const n=document.querySelectorAll('#v14Cfg .v14-cr')[0].querySelector('[data-f="n"]'); n.value='Turno mañana'; }); await p.click('#v14Cfg [data-v14save]'); await p.waitForTimeout(1200);
 const c2=await p.evaluate(()=>({c10:[...document.querySelectorAll('.pl-tb > .pl-r[data-d="10"] .v14-tu')].map(c=>c.innerText.replace(/\s+/g,' ')),c5:[...document.querySelectorAll('.pl-tb > .pl-r[data-d="5"] .v14-tu')].map(c=>c.innerText.replace(/\s+/g,' ')).join(' | ')}));
 ok(/Noche-madrugada .*00:00 – 02:00 2:00 h/.test(c2.c10.join(' | '))&&!/Fuera de los turnos/.test(c2.c10.join(' | '))&&/☀️ Turno mañana/.test(c2.c5),'al encender Noche-madrugada y renombrar un turno, las filas se rearman solas: '+c2.c10.join(' | '));
 // feriado: color y cartel
 await p.evaluate(()=>{ const P=window.__pla.st(); P.emps.find(e=>e.id==='t575').days['2026-10'][5].f=true; window.__pla.open(); }); await p.waitForTimeout(2300);
 const f=await p.evaluate(()=>{ const row=document.querySelector('.pl-tb > .pl-r[data-d="5"]'); return {cls:row.classList.contains('v14-fer'),bd:(row.querySelector('.v14-fb')||{}).textContent||'',strip:document.querySelector('.v14-strip [data-v14go="5"]').className}; });
 ok(f.cls&&/FERIADO/.test(f.bd)&&/\bf\b/.test(f.strip),'el feriado tiene su color y el cartel «'+f.bd+'», también en la tira');
 // nada de esto cambió la liquidación
 const net1=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps.find(e=>e.id==='t575'); E.days['2026-10'][5].f=false; const R=window.__pla.calc(E,'2026-10',P.cfg); return JSON.stringify([R.neto,R.L]); });
 ok(net0===net1,'la liquidación da exactamente lo mismo que antes de pintar la vista nueva');
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
