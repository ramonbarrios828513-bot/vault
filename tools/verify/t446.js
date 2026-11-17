// v1250 · 🎌 feriado: se paga PROPORCIONAL a las horas cargadas, sin nada cargado = no asistió y se descuenta (sin tocar los domingos), conceptos propios y filtros
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 const r=await p.evaluate(()=>{ const P=window.__pla.st(), C=P.cfg, E=P.emps[3]; delete E.aud; E.valFer=100000; E.valDom=70000;
   E.days['2026-06']={'22':{e:'08:00',s:'12:00',f:true}}; const R1=window.__pla.calc(E,'2026-06',C);
   E.days['2026-06']={'22':{e:'08:00',s:'16:00',f:true}}; const R2=window.__pla.calc(E,'2026-06',C);
   E.days['2026-06']={}; const R3=window.__pla.calc(E,'2026-06',C); const left=JSON.stringify(E.days['2026-06']);
   E.days['2026-06']={'22':{fsel:'fl'}}; const R4=window.__pla.calc(E,'2026-06',C);
   return {f4:R1.L.fer, f8:R2.L.fer, falta0:R4.L.falta, faltaAuto:R3.L.falta, left, dom:R2.L.dom}; });
 console.log('   '+JSON.stringify(r));
 ok(Math.round(r.f4)===50000 && Math.round(r.f8)===100000,'feriado: 4 h cobra la mitad, 8 h cobra completo');
 ok(r.left==='{}','la fila vacía no se modifica en los datos');
 ok(r.faltaAuto>=r.falta0,'feriado sin nada cargado cuenta como no asistió (descuenta)');
 // concepto propio
 await p.evaluate(()=>{ const P=window.__pla.st(); P.cur.emp=P.emps[3].id; P.cur.mon='2026-06'; P.cfg.fCon=[{id:'kx',n:'Inventario',ef:'fijo',m:50000}]; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1500); await p.evaluate(()=>document.querySelectorAll('.ico-ov,.k-party').forEach(x=>x.remove()));
 ok(await p.evaluate(()=>{ const s=document.querySelector('#planilla .pl-fsel[data-plf="10"]'); return [...s.options].some(o=>o.value==='c:kx') && [...s.options].some(o=>o.value==='new'); }),'el desplegable tiene los conceptos propios y «➕ Crear concepto nuevo»');
 await p.evaluate(()=>{ const s=document.querySelector('#planilla .pl-fsel[data-plf="10"]'); s.value='c:kx'; s.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(600);
 ok(await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps.find(x=>x.id===P.cur.emp); return (E.con['2026-06']||[]).some(c=>c.fday==='10' && c.m===50000); }),'el concepto propio se suma en los conceptos del mes');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
