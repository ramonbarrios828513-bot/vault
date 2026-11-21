// v1293 · 💵 Descuento de cheques: entidades (tasa mensual, IVA, gastos), calculadora que compara y marca ⭐ la más barata, y registro de la operación
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(); T.deu.push({id:'dX',acr:'Seed T532',saldo:1,cuota:1,est:'Activo'}); const u=window.__tes.ui; u.tab='dsc'; window.__tes.open(); u.tab='dsc'; window.__tes.draw(); }); await p.waitForTimeout(500);
 const fill=async(vals)=>p.evaluate((vals)=>{ const ov=[...document.querySelectorAll('.ico-ov')].pop(); for(const [k,v] of Object.entries(vals)){ const i=[...ov.querySelectorAll('[data-k="'+k+'"]')].pop(); i.value=v; i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); } const bs=[...ov.querySelectorAll('button')].filter(x=>/Guardar/.test(x.textContent)); bs[bs.length-1].click(); },vals);
 await p.click('#tesoreria [data-tx2="dscE"]'); await p.waitForTimeout(300); await fill({n:'Financiera A',tasa:'3',gf:'50.000',gp:'0'}); await p.waitForTimeout(500);
 await p.click('#tesoreria .tes-bar [data-tx2="dscE"]'); await p.waitForTimeout(300); await fill({n:'Cooperativa B',tasa:'2,5',gf:'0',gp:'0,5',iva:'No cobra IVA'}); await p.waitForTimeout(500);
 const n=await p.evaluate(()=>window.__tes.st().cfg.dscE.length); ok(n===2,'2 entidades guardadas');
 const f=await p.evaluate(()=>{ const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+30); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }); // fecha local (de noche, la fecha UTC ya es mañana y daba 31 días)
 await p.fill('#dscM','10000000'); await p.waitForTimeout(800); await p.fill('#dscF',f); await p.waitForTimeout(500);
 const tx=await p.evaluate(()=>document.getElementById('dscCalc').innerText.replace(/\s+/g,' '));
 // A: interés 3%×30/30 = 300.000 + IVA 30.000 + 50.000 = 380.000 · B: 2,5% = 250.000 + 0 + 50.000 = 300.000 → B más barata
 ok(/⭐ Cooperativa B/.test(tx),'⭐ marca la más barata (Cooperativa B): '+tx.slice(0,260));
 ok(/300\.000/.test(tx)&&/380\.000/.test(tx)&&/9\.700\.000/.test(tx),'calcula costo 300.000 vs 380.000 y recibe 9.700.000');
 await p.evaluate(()=>[...document.querySelectorAll('#dscCalc [data-tx2="dscOp"]')][0].click()); await p.waitForTimeout(300);
 await fill({lib:'Cliente X',nro:'123'}); await p.waitForTimeout(500);
 const o=await p.evaluate(()=>window.__tes.st().cfg.dsco); ok(o.length===1&&o[0].ent==='Cooperativa B'&&o[0].neto===9700000,'operación registrada: '+JSON.stringify(o[0]&&{ent:o[0].ent,neto:o[0].neto}));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
