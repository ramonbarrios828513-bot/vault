// v1325 · 🗓️ Planilla en VISTA COMPACTA (la de fábrica): en una notebook entran 4 fechas por pantalla; cada fecha muestra sus tres bloques y lo demás se abre con «🔽 Más»
process.env.PLVISTA='c';
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); window.__pla.open(); }); await p.waitForTimeout(800);
 await p.evaluate(()=>{ const P=window.__pla.st(); const sch={}; for(let i=1;i<7;i++) sch[i]={e:'15:00',s:'23:00'}; sch[0]={e:'',s:'',off:true}; const days={}; for(let d=1;d<=6;d++) days[d]={e:'08:30',sd:'15:00',vd:'16:00',s:'23:00'}; days[3]={e:'15:00',s:'23:00'}; const E={id:'A587',n:'A587',sal:3044000,tipo:'fijo',sch:sch,days:{'2026-06':days}}; P.emps.push(E); window.__pla.calc(E,'2026-06',P.cfg); P.cur=Object.assign(P.cur||{},{mon:'2026-06',emp:'A587'}); window.__pla.open(); }); await p.waitForTimeout(2800);
 const R=d=>'.pl-tb > .pl-r[data-d="'+d+'"]';
 await p.evaluate(()=>document.querySelector('.pl-tb > .pl-r[data-d="2"]').scrollIntoView({block:'start'})); await p.waitForTimeout(500);
 const m=await p.evaluate(()=>{ const vis=e=>!!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0; const r=document.querySelector('.pl-tb > .pl-r[data-d="2"]'); const st=document.querySelector('#planilla .v14-strip').getBoundingClientRect(); const rows=[...document.querySelectorAll('.pl-tb > .pl-r[data-d]')]; const H=rows.slice(0,5).map(x=>Math.round(x.getBoundingClientRect().height)); const step=Math.round(rows[2].getBoundingClientRect().top-rows[1].getBoundingClientRect().top); return {comp:document.getElementById('planilla').classList.contains('v25c'),H:H,step:step,libre:Math.round(innerHeight-st.bottom),st:vis(r.querySelector(':scope > .v15-st')),box:vis(r.querySelector(':scope > .v14-box')),g3:vis(r.querySelector('.v24-g3')),cols:[...r.querySelectorAll('.v24-c')].map(c=>c.innerText.replace(/\s+/g,' ').trim()),pie:r.querySelector('.v24-gf').innerText.replace(/\s+/g,' ').trim(),sw:document.documentElement.scrollWidth,bar:!!document.querySelector('#planilla .v25-bar')}; });
 console.log(JSON.stringify(m));
 ok(m.comp&&m.bar,'la planilla abre en vista compacta y ofrece el botón compacta / completa');
 ok(m.step*4<=m.libre+8,'entran 4 fechas en una pantalla de notebook (cada fecha '+m.step+' px · libre '+m.libre+' px)');
 ok(!m.st&&!m.box&&m.g3,'cada fecha muestra solo sus tres bloques: el paso a paso y lo demás quedan guardados');
 ok(m.cols.length===3&&/^🌙 Noche-madrugada 23:00 a 06:30$/.test(m.cols[0])&&/08:30–15:00 6:30 ☀️/.test(m.cols[1])&&/le tocaba/.test(m.cols[2])&&/16:00–20:00 4:00 ☀️/.test(m.cols[2])&&/20:00–23:00 3:00 🌙/.test(m.cols[2]),'los tres bloques en orden, con «le tocaba» y los tramos en corto: '+m.cols.join(' | '));
 ok(/más que su horario/.test(m.pie)&&!/Total:/.test(m.pie),'al costado queda el resultado del día, sin repetir el total');
 ok(m.sw<=1368,'no se sale de la pantalla');
 // 🔽 Más abre todo lo de esa fecha y 🔼 Menos lo guarda
 await p.evaluate(()=>document.querySelector('.pl-tb > .pl-r[data-d="2"] .v25-tg').click()); await p.waitForTimeout(400);
 const o=await p.evaluate(()=>{ const vis=e=>!!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0; const r=document.querySelector('.pl-tb > .pl-r[data-d="2"]'), r3=document.querySelector('.pl-tb > .pl-r[data-d="3"]'); return {st:vis(r.querySelector(':scope > .v15-st')),box:vis(r.querySelector(':scope > .v14-box')),tus:vis(r.querySelector('.v14-tus')),res:vis(r.querySelector('.v14-res')),tx:r.querySelector('.v25-tg').textContent,long:/Le tocaba: 15:00 a 23:00/.test(r.querySelector('.v24-c.ktn').innerText.replace(/\s+/g,' ')),otra:vis(r3.querySelector(':scope > .v15-st'))}; });
 console.log(await p.evaluate(()=>document.querySelector('.pl-tb > .pl-r[data-d="2"] .v24-c.ktn').innerText.replace(/\s+/g,' '))); await p.screenshot({path:'/tmp/claude-0/-home-claude/35b1ce44-d35c-5596-924f-bd3f45a2f74d/scratchpad/mas25.png'}); ok(o.st&&o.box&&o.res&&/Menos/.test(o.tx)&&o.long,'«🔽 Más» abre el paso a paso, descanso / regalo, configuración y los botones de esa fecha');
 ok(!o.tus,'los bloques de color repetidos ya no se muestran'); ok(!o.otra,'las otras fechas siguen compactas');
 await p.evaluate(()=>document.querySelector('.pl-tb > .pl-r[data-d="2"] .v25-tg').click()); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>getComputedStyle(document.querySelector('.pl-tb > .pl-r[data-d="2"] > .v15-st')).display==='none'),'«🔼 Menos» vuelve a guardar');
 // vista completa
 await p.evaluate(()=>document.querySelector('#planilla .v25-bar [data-v25v="f"]').click()); await p.waitForTimeout(400);
 const f=await p.evaluate(()=>{ const vis=e=>!!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0; const r=document.querySelector('.pl-tb > .pl-r[data-d="2"]'); return {st:vis(r.querySelector(':scope > .v15-st')),tus:vis(r.querySelector('.v14-tus')),tg:vis(r.querySelector('.v25-tg')),ls:localStorage.getItem('pl-vista')}; });
 ok(f.st&&f.tus&&!f.tg&&f.ls==='f','«Completa» muestra todo abierto como antes y queda recordado');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
