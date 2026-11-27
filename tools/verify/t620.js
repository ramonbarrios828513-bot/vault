// v1348 · 👤 «¿Quién vende?» trae los funcionarios de la planilla de salarios (por sucursal, sin los dados de baja) y el campo es ancho para leer el nombre
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:740}});
 await p.evaluate(()=>{ const P=window.__pla.st(); P.emps=P.emps||[]; P.emps.push({id:'eT1',n:'María Fernanda López Benítez',suc:'KM 7',cargo:'Cajera'},{id:'eT2',n:'Pedro Baja',suc:'KM 7',baja:'2020-01-01'}); window.__vt.open(); });
 await p.waitForTimeout(600);
 const r=await p.evaluate(()=>{ const s=document.querySelector('#ventas [data-pnv]'); return s?{o:[...s.options].map(o=>o.textContent),g:[...s.querySelectorAll('optgroup')].map(g=>g.label),w:Math.round(s.getBoundingClientRect().width)}:null; });
 console.log('   '+JSON.stringify(r));
 ok(r&&r.o.some(x=>/María Fernanda López Benítez · Cajera/.test(x)),'aparece la funcionaria de la planilla con su cargo');
 ok(r&&!r.o.some(x=>/Pedro Baja/.test(x)),'los dados de baja no aparecen');
 ok(r&&r.g.some(x=>/Planilla · KM 7/.test(x)),'agrupado por sucursal');
 ok(r&&r.w>=290,'el campo es ancho ('+(r&&r.w)+' px)');
 await p.selectOption('#ventas [data-pnv]','María Fernanda López Benítez'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>window.__vt.st().vendAct==='María Fernanda López Benítez'),'al elegirla queda como vendedora de la venta');
 ok(!errs.length,'sin errores '+errs.join(' | '));
 console.log('fallas '+fail); await b.close(); process.exit(fail?1:0); })();
