// v1315 · 📱 Planilla en el teléfono: la fila fecha entra en la pantalla (las 4 horas se ven, nada se corre a la derecha) y el cartel del nombre es bajo
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}});
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); window.__pla.open(); }); await p.waitForTimeout(800);
 await p.evaluate(()=>{ const P=window.__pla.st(); const sch={}; for(let i=0;i<7;i++) sch[i]={e:'15:00',s:'23:00'}; const E={id:'t578',n:'ENRIQUETA PRUEBA LARGA',sal:2899048,tipo:'fijo',sch:sch,days:{'2026-11':{3:{e:'14:00',sd:'18:00',vd:'19:00',s:'00:00',inc:[{k:'m',n:'Se retiró antes'}]}}}}; P.emps.push(E); P.cur=Object.assign(P.cur||{},{mon:'2026-11',emp:'t578'}); window.__pla.open(); }); await p.waitForTimeout(2500);
 await p.evaluate(()=>document.querySelector('.pl-tb > .pl-r[data-d="3"]').scrollIntoView({block:'start'})); await p.waitForTimeout(1200);
 const r=await p.evaluate(()=>{ const row=document.querySelector('.pl-tb > .pl-r[data-d="3"]'); const q=row.getBoundingClientRect(); const kids=[...row.children].filter(c=>c.getBoundingClientRect().width>0); const out=kids.filter(c=>{ const k=c.getBoundingClientRect(); return k.right>q.right+1||k.left<q.left-1; }).map(c=>c.tagName+'.'+c.className); const inp=[...row.querySelectorAll(':scope > input')].map(i=>Math.round(i.getBoundingClientRect().width)); const ep=document.elementFromPoint(100,30), wb=ep&&ep.closest('.who-bar'); return {rw:Math.round(q.right),out,inp,wb:wb?Math.round(wb.getBoundingClientRect().height):0,prt:!!row.querySelector('.v15-prt'),st:!!row.querySelector(':scope > .v15-st')}; });
 ok(r.rw<=390&&!r.out.length,'la fila fecha entra en la pantalla y nada se sale a la derecha'+(r.out.length?': '+r.out.join(', '):''));
 ok(r.inp.length===4&&r.inp.every(w=>w>=60),'las 4 horas se ven enteras (anchos '+r.inp.join(', ')+')');
 ok(r.wb>0&&r.wb<=80,'el cartel del nombre ocupa poco ('+r.wb+' px)');
 ok(r.prt&&r.st,'la fila trae 🖨️ Imprimir y «El día, paso a paso»');
 ok(!errs.length,'sin errores de consola');
 await b.close(); console.log(fail?'fallas '+fail:'OK t578'); process.exit(fail?1:0); })();
