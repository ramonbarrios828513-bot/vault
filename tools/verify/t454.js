// v1254 · cuentas bancarias dentro de cada empresa: relacionar con ✅ y ➕ agregar cuenta nueva (sin número de cuenta)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1100,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(), c=T.cfg; c.emp={nom:'Nissifarma',ruc:'1234567',dv:'1'}; c.emp2={nom:'KM 11',ruc:'7654321',dv:'5'}; T.sal.push({cta:'Basa-G',f:'2026-11-17',m:1000}); T.sal.push({cta:'Itau',f:'2026-11-17',m:1000}); c.ctaEmp={'Itau':'7654321-5'}; });
 await p.evaluate(()=>window.__fcEmp.edit('e1')); await p.waitForTimeout(500);
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); const lab=[...o.querySelectorAll('*')].filter(x=>/🏦 Basa-G/.test(x.textContent)&&x.children.length<8).pop(); });
 const labels=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); return o.innerText.split('\n').filter(x=>/🏦|➕/.test(x)).join(' | '); }); ok(/Basa-G/.test(labels)&&/Itau · hoy es de KM 11/.test(labels)&&/Agregar cuenta bancaria nueva/.test(labels),'muestra las cuentas y de quién son');
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); const bs=[...o.querySelectorAll('[data-pkl="si"]')]; bs[0].click(); o.querySelector('[data-k="nc"]').value='Ueno-R'; o.querySelector('[data-k="nb"]').value='Ueno'; });
 await p.screenshot({path:'/tmp/claude-0/s131/cta1.png'});
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); [...o.querySelectorAll('button')].find(x=>/Guardar/.test(x.textContent)).click(); }); await p.waitForTimeout(800);
 const r=JSON.parse(await p.evaluate(()=>JSON.stringify({ce:window.__tes.st().cfg.ctaEmp, nw:Object.keys(window.__tes.st().cfg.ctaNew||{}), list:document.getElementById('fcEmpOv')&&document.getElementById('fcEmpOv').innerText.replace(/\s+/g,' ').slice(0,300)}))); ok(r.ce['Basa-G']==='1234567-1'&&r.ce['Ueno-R']==='1234567-1'&&r.ce['Itau']==='7654321-5','relaciona sin tocar las de la otra empresa'); ok(r.nw.indexOf('Ueno-R')>=0,'la cuenta nueva queda creada'); ok(/Cuentas: .*Basa-G/.test(r.list),'la tarjeta muestra sus cuentas');
 await p.screenshot({path:'/tmp/claude-0/s131/cta2.png'});
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
