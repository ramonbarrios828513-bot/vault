// v1315 · 🗓️ Planilla: cada fecha con «El día, paso a paso», 🖨️ imprimir solo ese día, ✏️ editar marcas y 📝 incidencias a favor / en contra
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:700}});
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); window.__pla.open(); }); await p.waitForTimeout(800);
 const net0=await p.evaluate(()=>{ const P=window.__pla.st(); const sch={}; for(let i=0;i<7;i++) sch[i]={e:'15:00',s:'23:00'}; const E={id:'t577',n:'PRUEBA FECHA',sal:2899048,tipo:'fijo',sch:sch,days:{'2026-10':{5:{e:'14:00',s:'00:00',ct:0},6:{e:'15:20',sd:'18:00',vd:'19:00',s:'22:30'}}}}; P.emps.push(E); P.cur=Object.assign(P.cur||{},{mon:'2026-10',emp:'t577'}); window.__pla.open(); return window.__pla.calc(E,'2026-10',P.cfg).neto; }); await p.waitForTimeout(2300);
 const row=d=>'.pl-tb > .pl-r[data-d="'+d+'"]';
 const st=await p.evaluate(()=>{ const t=d=>{ const n=document.querySelector('.pl-tb > .pl-r[data-d="'+d+'"] > .v15-st'); return n?n.innerText.replace(/\s+/g,' '):''; }; return {col:getComputedStyle(document.querySelector('.pl-tb > .pl-r[data-d="5"] > .v15-st p.g span')).color,s5:t(5),s6:t(6),s7:t(7),prt:document.querySelectorAll('.pl-dd .v15-prt:not(.v15-nb)').length,nb:document.querySelectorAll('.pl-dd .v15-nb').length}; });
 console.log(st.s5); console.log(st.s6);
 ok(/Su horario de este día: 15:00 a 23:00 \(08:00 h\)/.test(st.s5)&&/estuvo 10:00 h/.test(st.s5),'lunes 5: dice su horario (15 a 23) y que estuvo 10 h');
 ok(/Entró 01:00 h antes de su horario \(de 14:00 a 15:00\): son 01:00 h de hora extra diurna/.test(st.s5),'la hora de 14 a 15 sale como hora extra diurna');
 ok(/Dentro de su horario \(de 15:00 a 23:00\): 08:00 h de salario base — de esas, 03:00 h llevan diferencia nocturna \(de 20:00 a 23:00/.test(st.s5),'de 15 a 23: 8 h de salario base, 3 h con diferencia nocturna (20 a 23)');
 ok(/Se quedó 01:00 h después de su horario \(de 23:00 a 00:00\): son 01:00 h de hora nocturna/.test(st.s5),'de 23 a 00: 1 h de hora nocturna');
 ok(/Le tocaban 0[78]:00 h/.test(st.s5)&&/trabajó 10:00 h: 0[23]:00 h de más/.test(st.s5),'cierra: lo que le tocaba, lo que trabajó y cuánto de más (igual que el cartel de siempre)');
 ok(/Llegó 00:20 h tarde/.test(st.s6)&&/Salió 00:30 h antes/.test(st.s6)&&/Descanso que no se cuenta: 01:00 h/.test(st.s6)&&/le faltaron 00:50 h/.test(st.s6)&&st.col==='rgb(15, 23, 42)','martes 6: llegó tarde, salió antes, descanso 1 h y «le faltaron»');
 ok(!st.s7,'un día sin marcas no muestra el cuadro');
 ok(st.prt>=28&&st.nb>=28,'cada fecha tiene 🖨️ Imprimir y 📝 Incidencia ('+st.prt+' / '+st.nb+')');
 // imprimir solo ese día
 await p.evaluate(()=>{ window.__w=null; window.open=function(){ window.__w={document:{open(){},write(h){window.__wh=h;},close(){}},focus(){},print(){window.__wp=1;}}; return window.__w; }; });
 await p.click(row(5)+' .pl-dd .v15-prt:not(.v15-nb)'); await p.waitForTimeout(700);
 const pr=await p.evaluate(()=>({h:window.__wh||'',p:window.__wp}));
 ok(pr.p===1&&/PRUEBA FECHA/.test(pr.h)&&/Lunes 5/.test(pr.h)&&/14:00/.test(pr.h)&&/Firma del funcionario/.test(pr.h)&&!/Martes 6/.test(pr.h)&&/hora nocturna/.test(pr.h),'🖨️ imprime solo el lunes 5, con marcas, paso a paso y firmas');
 // incidencia sin monto: queda en la fecha y no cambia la paga
 await p.click(row(5)+' .pl-dd .v15-nb'); await p.waitForTimeout(400);
 await p.click('#v14Ov [data-v15k2="m"]'); await p.click('#v14Ov [data-v15pre="Se retiró antes"]'); await p.click('#v14Ov [data-v15="inc"]'); await p.waitForTimeout(1600);
 const i1=await p.evaluate(()=>{ const P=window.__pla.st(),E=P.emps.find(x=>x.id==='t577'); const il=document.querySelector('.pl-tb > .pl-r[data-d="5"] > .v15-il'); return {n:(E.days['2026-10'][5].inc||[]).length,il:il?il.innerText:'',neto:window.__pla.calc(E,'2026-10',P.cfg).neto,ov:!!document.getElementById('v14Ov'),ib:(document.querySelector('.pl-tb > .pl-r[data-d="5"] .v15-ib')||{}).textContent}; });
 ok(i1.n===1&&/En contra: Se retiró antes/.test(i1.il)&&i1.neto===net0,'incidencia EN CONTRA sin monto: queda a la vista en la fila y la paga no cambia ('+i1.il.trim()+')');
 // incidencia a favor con monto: entra en la liquidación
 await p.evaluate(()=>{ const o=document.getElementById('v14Ov'); if(o) o.remove(); }); await p.click(row(6)+' .pl-dd .v15-nb'); await p.waitForTimeout(400);
 await p.fill('#v15IncN','Cubrió a un compañero'); await p.fill('#v15IncM','50000'); await p.click('#v14Ov [data-v15="inc"]'); await p.waitForTimeout(1600);
 const i2=await p.evaluate(()=>{ const P=window.__pla.st(),E=P.emps.find(x=>x.id==='t577'); const il=document.querySelector('.pl-tb > .pl-r[data-d="6"] > .v15-il'); return {c:(E.con['2026-10']||[]).filter(c=>c.inc&&c.d===6&&c.t==='+'&&c.m===50000).length,il:il?il.innerText:'',neto:window.__pla.calc(E,'2026-10',P.cfg).neto}; });
 ok(i2.c===1&&/A favor: Cubrió a un compañero/.test(i2.il)&&i2.neto===net0+50000,'incidencia A FAVOR con ₲ 50.000: entra en la liquidación (neto '+net0+' → '+i2.neto+')');
 // quitarla devuelve la paga
 await p.click('#v14Ov [data-v15del]'); await p.waitForTimeout(1300);
 const i3=await p.evaluate(()=>{ const P=window.__pla.st(),E=P.emps.find(x=>x.id==='t577'); return window.__pla.calc(E,'2026-10',P.cfg).neto; }); ok(i3===net0,'al quitarla con ✕ la paga vuelve a como estaba');
 // editar marcas desde el resumen
 await p.evaluate(()=>{ const o=document.getElementById('v14Ov'); if(o) o.remove(); window.__v14.res(6); }); await p.waitForTimeout(300); await p.click('#v14Ov [data-v15="edit"]'); await p.waitForTimeout(300);
 await p.fill('#v14Ov [data-v15k="e"]','25:99'); await p.click('#v14Ov [data-v15="save"]'); await p.waitForTimeout(200);
 const er=await p.evaluate(()=>document.getElementById('v15Err').textContent); ok(/06:30/.test(er),'una hora mal escrita no se guarda y avisa: '+er);
 await p.fill('#v14Ov [data-v15k="e"]','15:00'); await p.click('#v14Ov [data-v15="save"]'); await p.waitForTimeout(2600);
 const e2=await p.evaluate(()=>{ const P=window.__pla.st(),E=P.emps.find(x=>x.id==='t577'),x=E.days['2026-10'][6]; const n=document.querySelector('.pl-tb > .pl-r[data-d="6"] > .v15-st'); return {e:x.e,h:(x.hist||[]).length,inp:document.querySelector('.pl-tb > .pl-r[data-d="6"] input[data-k="e"]').value,st:n?n.innerText:''}; });
 ok(e2.e==='15:00'&&e2.h===1&&e2.inp==='15:00'&&!/tarde/.test(e2.st),'✏️ Editar las marcas: guarda 15:00, queda el antes anotado, la fila se actualiza y ya no dice «tarde»');
 ok(!errs.length,'sin errores de consola'+(errs.length?': '+errs.slice(0,2).join(' | '):''));
 await b.close(); console.log(fail?'fallas '+fail:'OK t577'); process.exit(fail?1:0); })();
