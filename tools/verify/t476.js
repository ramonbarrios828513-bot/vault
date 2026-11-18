// v1261 · 💳 tickets del POS separados: CRÉDITO y DÉBITO (cada uno con control) + impresión con QR para cruzar con el banco
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(700);
 await p.click('#czb-tj [data-ty="Crédito"]'); await p.waitForTimeout(300); await p.click('#czb-tj [data-ty="Débito"]'); await p.waitForTimeout(300);
 const tys=await p.evaluate(()=>[...document.querySelectorAll('#czb-tj select[data-czk$=".ty"]')].map(s=>s.value).join(','));
 ok(tys==='Crédito,Débito','«➕ Agregar ticket de crédito / débito» crea el renglón en su grupo ('+tys+')');
 await p.fill('#cierre [data-czk="v.cre"]','100000'); await p.locator('#cierre [data-czk="v.cre"]').press('Tab'); await p.waitForTimeout(300);
 await p.fill('#czb-tj [data-czk="tjd.0.m"]','100000'); await p.locator('#czb-tj [data-czk="tjd.0.m"]').press('Tab'); await p.waitForTimeout(500);
 const txt=await p.evaluate(()=>document.getElementById('czb-tj').textContent);
 ok(/Tarjeta CRÉDITO[\s\S]*cuadra con el ticket de cierre/.test(txt),'crédito: el detalle cuadra con el ticket de cierre');
 const h=await p.evaluate(()=>window.__czTkPrint(Object.assign({},window.__cz.st().draft?Object.values(window.__cz.st().draft)[0].d:{}, {})));
 ok(/Tarjeta CRÉDITO/.test(h)&&/Tarjeta DÉBITO/.test(h)&&/QR/.test(h),'la impresión trae crédito, débito y QR por separado');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
