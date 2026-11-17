// v1247 · 💳 deudas y préstamos: el SALDO real se corrige en la misma tabla (bancos, cooperativas, inmobiliaria) y queda marcado «real al…»
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(1000);
 await p.evaluate(()=>{ const T=window.__tes.st(); T.deu=[{acr:'Cooperativa X',tit:'Ramón',total:50000000,cuota:0,est:'Activo',es:'Fija'}]; window.__tes.ui.tab='deu'; window.__tes.draw(); }); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>/estimado/.test(document.querySelector('#tesoreria [data-k="total"]').parentElement.innerText)),'muestra «≈ estimado» mientras no pusiste el real');
 await p.fill('#tesoreria [data-tesdeu="0"][data-k="total"]','43.250.000'); await p.press('#tesoreria [data-tesdeu="0"][data-k="total"]','Tab'); await p.waitForTimeout(500);
 const d=await p.evaluate(()=>JSON.stringify(window.__tes.st().deu[0])); console.log('   '+d);
 ok(/"total":43250000/.test(d)&&/"salF":"20/.test(d),'guarda el saldo real con la fecha');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
