// v1254 · 🏢 Mis empresas: una empresa por vista, ➕ agregar otra empresa
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1100,height:900}});
 await p.evaluate(()=>{ const c=window.__tes.st().cfg; c.emp={nom:'Nissifarma',ruc:'1234567',dv:'1'}; c.emp2={nom:'KM 11',rs:'Gisele S'}; });
 await p.evaluate(()=>window.__fcEmp.open()); await p.waitForTimeout(400);
 const t=await p.evaluate(()=>document.getElementById('fcEmpOv').innerText); ok(/Nissifarma/.test(t)&&/KM 11/.test(t)&&/Agregar otra empresa/.test(t)&&/•••4567/.test(t),'lista cada empresa por separado, RUC oculto, botón agregar');
 await p.screenshot({path:'/tmp/claude-0/s131/emp1.png'});
 await p.click('[data-fe="add"]'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); o.querySelector('[data-k="nom"]').value='Empresa nueva'; o.querySelector('[data-k="ruc"]').value='7654321'; o.querySelector('[data-k="dv"]').value='5'; });
 await p.screenshot({path:'/tmp/claude-0/s131/emp2.png'});
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); const bt=[...o.querySelectorAll('button')].find(x=>/Guardar/.test(x.textContent)); bt.click(); }); await p.waitForTimeout(800);
 const r=await p.evaluate(()=>({x:window.__tes.st().cfg.empX, ov:!!document.getElementById('fcEmpOv'), e1:window.__tes.st().cfg.emp.ruc})); ok(r.x&&r.x[0]&&r.x[0].nom==='Empresa nueva'&&r.x[0].ruc==='7654321','se guarda la empresa nueva aparte'); ok(r.e1==='1234567','la empresa 1 no se toca'); ok(r.ov,'vuelve a la lista de empresas');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
