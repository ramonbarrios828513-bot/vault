// v1228 · 🛵 delivery en el cierre: N.º de ticket, total del ticket (con delivery), delivery cobrado, venta de productos sola y resumen por deliverista
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__cz.open(); }); await p.waitForTimeout(700);
 await p.selectOption('#cierre [data-czk="suc"]','Local 1 KM7').catch(()=>{}); await p.waitForTimeout(400);
 for(let i=0;i<3;i++){ await p.click('#cierre [data-cz="add"][data-k="dl"]'); await p.waitForTimeout(250); }
 const put=async(k,v)=>{ await p.fill('#cierre [data-czk="'+k+'"]',v); await p.press('#cierre [data-czk="'+k+'"]','Tab'); await p.waitForTimeout(120); };
 await put('dl.0.nom','JUAN'); await put('dl.0.tk','001-001-100'); await put('dl.0.tt','85000'); await put('dl.0.dc','10000'); await put('dl.0.m','10000');
 await put('dl.1.nom','JUAN'); await put('dl.1.tk','001-001-101'); await put('dl.1.tt','50000'); await put('dl.1.dc','8000'); await put('dl.1.m','8000');
 await put('dl.2.nom','PEDRO'); await put('dl.2.tk','001-001-101'); await put('dl.2.tt','5000'); await put('dl.2.dc','7000');
 await p.evaluate(()=>{ const i=document.querySelector('#cierre [data-czk="dl.2.dc"]'); i.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(500);
 const t=await p.evaluate(()=>document.querySelector('#czb-dl').innerText);
 console.log('   '+t.replace(/\n+/g,' | ').slice(-420));
 ok(/75\.000/.test(t) && /42\.000/.test(t),'separa la venta de productos (85.000 − 10.000 = 75.000 · 50.000 − 8.000 = 42.000)');
 ok(/JUAN\s+2\s+135\.000\s+18\.000\s+117\.000\s+18\.000/.test(t.replace(/\n|\t/g,' ')),'resumen: JUAN 2 pedidos · tickets 135.000 · delivery 18.000 · productos 117.000 · pagado 18.000');
 ok(/más grande que el total/.test(t),'avisa si el delivery es más grande que el total');
 ok(/cargado 2 veces/.test(t),'avisa ticket repetido');
 const D=await p.evaluate(()=>['tk','tt','dc'].map(k=>document.querySelector('#cierre [data-czk="dl.0.'+k+'"]').value));
 ok(D[0]==='001-001-100' && D[1]==='85.000' && D[2]==='10.000','N.º de ticket, total y delivery cobrado quedan cargados ('+D.join(' · ')+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
