// v1229 · 🔁 F8 equivalentes / similares / bioequivalentes: margen, ganancia por mes, venta libre o receta, cuál conviene
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>(window.__ar.st().ui.ngOpen={cols:true,pol:true,mon:true,tools:true}, window.__ar.open())); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos [data-ar="tab"][data-v="neg"]'); await p.waitForTimeout(300); await p.click('#articulos [data-ng="calc"]'); await p.waitForTimeout(300);
 for(const w of ['ibuprofeno 600 mg (lasca)','ibuprofeno 600 mg (indufar)','ibuprofeno 600 mg (catedral)','paracetamol 500']){ await p.fill('#articulos [data-ngadd]',w); await p.press('#articulos [data-ngadd]','Enter'); await p.waitForTimeout(350); } await p.click('#articulos [data-ng="view"][data-v="tab"]').catch(()=>{}); await p.waitForTimeout(300);
 await p.fill('#articulos [data-ngpol="d1"]','30'); await p.click('#articulos [data-ng="pol"][data-m="vac"]'); await p.waitForTimeout(500);
 await p.focus('#articulos .ng-tab tr[data-ngrowid="demo0"] [data-k="q"]'); await p.keyboard.press('F8'); await p.waitForTimeout(500);
 const t=await p.evaluate(()=>{ const o=document.getElementById('eqOv'); return o && !o.hidden ? o.innerText.replace(/\n/g,' ') : ''; }); console.log('   '+t.slice(0,300));
 ok(/Equivalentes de Ibuprofeno 600 mg/.test(t),'F8 abre los equivalentes del producto de la fila');
 ok(/equivalente/.test(t) && /similar/.test(t) && /GANANCIA POR MES/i.test(t) && /Margen/i.test(t),'compara equivalentes y similares con margen y ganancia por mes');
 ok(/Venta libre/.test(t) && /sí/.test(t),'muestra venta libre / receta y bioequivalente');
 ok(/Deja más ganancia por mes|el que más ganancia deja/.test(t),'recomienda cuál conviene');
 await p.keyboard.press('Escape'); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.getElementById('eqOv').hidden && document.activeElement && document.activeElement.closest('tr') && document.activeElement.closest('tr').dataset.ngrowid==='demo0'),'Esc cierra y vuelve a la fila');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
