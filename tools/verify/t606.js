// v1340 · Planilla: 🧹 Vaciar todo y empezar de cero — borra montos y movimientos de todos los meses; quedan nombre, cédula, sucursal, cargo, sueldo; copia aparte; pide escribir VACIAR
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900},pla:1});
 const before=await p.evaluate(()=>{ const P=window.__pla.st(); const E=P.emps.find(e=>Object.keys(e.days||{}).length&&Object.keys(e.con||{}).length)||P.emps[0]; return {id:E.id,n:E.n,ci:E.ci,suc:E.suc,cargo:E.cargo,sal:E.sal,valDom:E.valDom,dm:Object.keys(E.days||{}).length,cm:Object.keys(E.con||{}).length,ne:P.emps.length}; });
 ok(before.dm>0&&before.cm>0,'antes: el funcionario '+before.n+' tiene días y montos cargados ('+before.dm+' mes/es)');
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(800);
 ok(await p.evaluate(()=>!!document.querySelector('#planilla [data-plh="cero"]')),'la planilla tiene el botón 🧹 Vaciar todo y empezar de cero');
 await p.click('#planilla [data-plh="cero"]'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>document.querySelector('[data-c0="si"]').disabled),'el botón de vaciar está bloqueado hasta escribir VACIAR');
 await p.fill('[data-c0i]','vaciar'); await p.waitForTimeout(100); await p.click('[data-c0="si"]'); await p.waitForTimeout(800);
 const after=await p.evaluate(id=>{ const P=window.__pla.st(); const E=P.emps.find(e=>e.id===id); const tot=P.emps.reduce((a,e)=>a+Object.keys(e.days||{}).length+Object.keys(e.con||{}).length+(e.debts||[]).length,0); return {n:E.n,ci:E.ci,suc:E.suc,cargo:E.cargo,sal:E.sal,valDom:E.valDom,tot:tot,ne:P.emps.length,bak:(P.ceroBak||[]).length,bakHas:!!(P.ceroBak&&P.ceroBak[0].emps[id]&&P.ceroBak[0].emps[id].d.days)}; },before.id);
 ok(after.tot===0,'después: ningún funcionario tiene días, montos ni deudas cargados');
 ok(after.n===before.n&&after.ci===before.ci&&after.suc===before.suc&&after.cargo===before.cargo&&String(after.sal)===String(before.sal)&&String(after.valDom)===String(before.valDom)&&after.ne===before.ne,'quedan nombre, cédula, sucursal, cargo, sueldo y valor del domingo ('+after.n+' · '+after.suc+')');
 ok(after.bak===1&&after.bakHas,'se guardó una copia aparte de lo borrado');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); console.log(fail?'✘ t606 con fallas':'✔ t606 OK'); process.exit(fail?1:0); })();
