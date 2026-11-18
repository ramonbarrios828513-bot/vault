// v1261 · 📒 Ventas a crédito: botones «➕ Venta a crédito · Funcionario / Cliente» dentro del cuadro, con el detalle y «varios funcionarios» ahí mismo
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const S=window.__cz.st(); S.wkPers=[{n:'ANA',suc:'Local 1 KM7'},{n:'BETO',suc:'Local 1 KM7'}]; window.__cz.open(); }); await p.waitForTimeout(700);
 await p.selectOption('#cierre [data-czk="suc"]','Local 1 KM7').catch(()=>{}); await p.waitForTimeout(500);
 const inBox=await p.evaluate(()=>{ const bx=document.getElementById('czb-cr'); return !!bx && !!bx.querySelector('[data-a="Funcionario"]') && !!bx.querySelector('[data-a="Cliente"]') && !!bx.querySelector('[data-cz="multi"][data-k="cr"]'); });
 ok(inBox,'el cuadro 📒 Ventas a crédito tiene «➕ Funcionario», «➕ Cliente» y «👥 Varios funcionarios»');
 await p.click('#czb-cr [data-a="Funcionario"]'); await p.waitForTimeout(400); await p.click('#czb-cr [data-a="Cliente"]'); await p.waitForTimeout(400);
 const r=await p.evaluate(()=>{ const bx=document.getElementById('czb-cr'); return [...bx.querySelectorAll('select[data-czk$=".a"]')].map(s=>s.value).join(','); });
 ok(r==='Funcionario,Cliente','se agregaron dos renglones: uno de funcionario y uno de cliente ('+r+')');
 await p.fill('#czb-cr [data-czk="cr.0.nom"]','ANA'); await p.fill('#czb-cr [data-czk="cr.0.m"]','35000'); await p.locator('#czb-cr [data-czk="cr.0.m"]').press('Tab'); await p.waitForTimeout(600);
 const tot=await p.evaluate(()=>document.getElementById('czb-cr').textContent);
 ok(/35\.000/.test(tot),'el total de ventas a crédito se calcula del detalle');
 ok(await p.evaluate(()=>document.querySelectorAll('#cierre [data-cz="multi"][data-k="cr"]').length===1),'el detalle aparece una sola vez (no repetido abajo)');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
