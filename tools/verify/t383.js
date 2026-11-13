// v1212 · varios funcionarios a la vez (adelantos y pagarés), resumen de descuento de salario, pagaré repetido bloqueado, compras venta / uso interno
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const S=window.__cz.st(); S.wkPers=[{n:'ANA',suc:'Local 1 KM7'},{n:'BETO',suc:'Local 1 KM7'},{n:'CARLA',suc:'Local 1 KM7'},{n:'DIEGO',suc:'Local 4 Franco'}]; S.t.push({id:'o1',n:50,f:'2026-11-10',suc:'Local 1 KM7',caja:'Caja 1',cr:[{a:'Funcionario',nom:'ANA',pg:'P-900',m:10000}]}); window.__cz.open(); }); await p.waitForTimeout(700);
 await p.selectOption('#cierre [data-czk="suc"]','Local 1 KM7').catch(()=>{}); await p.waitForTimeout(500);
 if(!(await p.$('#cierre [data-cz="multi"][data-k="ad"]'))){ await p.evaluate(()=>{ window.__cz.st(); }); }
 const det=async(k)=>p.evaluate((k)=>{ const d=document.querySelector('#cierre [data-cz="multi"][data-k="'+k+'"]').closest('details'); d.open=true; },k);
 await det('ad'); await p.click('#cierre [data-cz="mall"][data-k="ad"]');
 await p.fill('#cierre [data-czmm="ad"]','50000'); await p.selectOption('#cierre [data-czmc="ad"]',{index:1});
 await p.click('#cierre [data-cz="multi"][data-k="ad"]'); await p.waitForTimeout(500);
 let D=await p.evaluate(()=>JSON.parse(JSON.stringify(window.__cz.st().draft?Object.values(window.__cz.st().draft)[0].d:{})));
 ok((D.ad||[]).length===3 && D.ad.every(r=>r.m===50000 && /^Caja/.test(r.como)) && D.ad.map(r=>r.func).join()==='ANA,BETO,CARLA','adelanto a los 3 de la sucursal de una vez (DIEGO de otra sucursal no)');
 for(let i=0;i<3;i++){ await p.fill('#cierre [data-czk="ad.'+i+'.vale"]','V-'+(i+1)); } await p.waitForTimeout(200);
 await det('cr'); await p.evaluate(()=>{ const d=document.querySelector('#cierre [data-cz="multi"][data-k="cr"]').closest('details'); d.querySelectorAll('[data-czmp]').forEach(c=>{ if(/ANA|BETO/.test(c.value)) c.checked=true; }); });
 await p.click('#cierre [data-cz="multi"][data-k="cr"]'); await p.waitForTimeout(500);
 await p.fill('#cierre [data-czk="cr.0.pg"]','P-100'); await p.fill('#cierre [data-czk="cr.0.m"]','30000'); await p.fill('#cierre [data-czk="cr.1.pg"]','P-100'); await p.fill('#cierre [data-czk="cr.1.m"]','20000');
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(500);
 let t=await p.evaluate(()=>document.querySelector('#cierre').innerText);
 ok(/se descuenta del SALARIO a cada funcionario/.test(t) && /ANA[\s\S]*80\.000/.test(t),'resumen: ANA 50.000 adelanto + 30.000 pagaré = 80.000');
 await p.evaluate(()=>{ const set=(k,v)=>{ const e=document.querySelector('#cierre [data-czk="'+k+'"]'); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); }; set('n','51'); set('v.ef','100000'); set('sobre','1'); set('hora','2200'); set('hi','0700'); }); await p.selectOption('#cierre [data-czk="caj"]','ANA').catch(()=>{}); await p.waitForTimeout(300);
 const errOf=async()=>{ await p.evaluate(()=>document.querySelector('#cierre [data-cz="save"]').click()); await p.waitForTimeout(600); return p.evaluate(()=>(document.querySelector('#czErr')||{}).textContent||''); };
 let e1=await errOf(); console.log(e1); ok(/pagaré N\.º P-100 está dos veces/.test(e1),'mismo pagaré en dos renglones → ⛔');
 await p.fill('#cierre [data-czk="cr.1.pg"]','P-900'); await p.waitForTimeout(200);
 let e2=await errOf(); console.log(e2); ok(/P-900 ya está cargado en el turno N\.º 50/.test(e2),'pagaré ya usado en otro turno → ⛔');
 // compras para venta / uso interno
 await p.evaluate(()=>document.querySelector('#cierre [data-cz="add"][data-k="eg"]').click()); await p.waitForTimeout(300);
 await p.selectOption('#cierre [data-czk="eg.0.tipo"]',{index:2}); await p.fill('#cierre [data-czk="eg.0.m"]','15000'); await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(400);
 t=await p.evaluate(()=>document.querySelector('#cierre').innerText); ok(/para USO INTERNO ₲ 15\.000/.test(t),'egresos: separa compras para venta y para uso interno');

 // sobre con 5 pagarés de 5 funcionarios → foto → cada uno a quien corresponde
 await p.evaluate(()=>{ const S=window.__cz.st(); S.wkPers=S.wkPers.concat([{n:'EVA ROJAS',suc:'Local 1 KM7'},{n:'FELIX DUARTE',suc:'Local 1 KM7'}]); window.__aiVision=async()=>({text:JSON.stringify({creditos:[{nombre:'Ana',pagare:'P-201',monto:11000},{nombre:'BETO',pagare:'P-202',monto:12000},{nombre:'CARLA',pagare:'P-203',monto:13000},{nombre:'Eva Rojas',pagare:'P-204',monto:14000},{nombre:'Felix Duarte',pagare:'P-205',monto:15000}]})}); });
 await p.evaluate(async()=>{ const c=document.createElement('canvas'); c.width=300;c.height=200; const bl=await new Promise(r=>c.toBlob(r,'image/png')); const dt=new DataTransfer(); for(let i=0;i<5;i++) dt.items.add(new File([bl],'pg'+i+'.png',{type:'image/png'})); const inp=document.querySelector('#cierre input[data-czfoto="cr"]'); inp.files=dt.files; inp.dispatchEvent(new Event('change',{bubbles:true})); });
 await p.waitForTimeout(3000);
 const CR=await p.evaluate(()=>{ const d=Object.values(window.__cz.st().draft)[0].d; return (d.cr||[]).filter(r=>/^P-20/.test(r.pg||'')).map(r=>r.a+':'+r.nom+':'+r.pg+':'+r.m); });
 console.log(CR); ok(CR.length===5 && CR.every(x=>/^Funcionario:/.test(x)) && CR.some(x=>/EVA ROJAS:P-204:14000/.test(x)) && CR.some(x=>/FELIX DUARTE:P-205:15000/.test(x)),'5 pagarés del sobre → cada uno al funcionario que corresponde');

 // el ticket trae solo el TOTAL de crédito: no borra los pagarés y controla contra ellos
 const nCr=await p.evaluate(()=>Object.values(window.__cz.st().draft)[0].d.cr.length);
 await p.evaluate(()=>{ window.__aiVision=async()=>({text:JSON.stringify({n:51,ef:100000,credito_total:200000,creditos:[]})}); });
 await p.evaluate(async()=>{ const c=document.createElement('canvas'); c.width=300;c.height=600; const bl=await new Promise(r=>c.toBlob(r,'image/png')); const dt=new DataTransfer(); dt.items.add(new File([bl],'tk.png',{type:'image/png'})); const inp=document.querySelector('#cierre input[data-czfoto="1"]'); inp.files=dt.files; inp.dispatchEvent(new Event('change',{bubbles:true})); });
 await p.waitForTimeout(3000);
 const D2=await p.evaluate(()=>{ const d=Object.values(window.__cz.st().draft)[0].d; return {n:d.cr.length, tk:d.crTk, s:d.cr.reduce((a,r)=>a+(+r.m||0),0)}; }); console.log(JSON.stringify(D2));
 ok(D2.n===nCr && D2.tk===200000,'escanear el ticket NO borra los pagarés y guarda el Total Crédito');
 t=await p.evaluate(()=>document.querySelector('#cierre').innerText);
 ok(/falta\(n\) pagaré\(s\) por ₲ 85\.000/.test(t),'avisa cuánto falta en pagarés contra el ticket');
 ok(/⚠️ 📒 Crédito/.test(t),'chip de Crédito en ⚠️');

 // 18 funcionarios a la vez (sin límite) y 10 fotos de pagarés leídas de a tandas
 await p.evaluate(()=>{ const S=window.__cz.st(); for(let i=1;i<=18;i++) S.wkPers.push({n:'FUNC '+String(i).padStart(2,'0'),suc:'Local 1 KM7'}); window.__cz.open(); }); await p.waitForTimeout(500);
 const ad0=await p.evaluate(()=>(Object.values(window.__cz.st().draft)[0].d.ad||[]).length);
 await det('ad'); await p.evaluate(()=>{ const d=document.querySelector('#cierre [data-cz="multi"][data-k="ad"]').closest('details'); d.querySelectorAll('[data-czmp]').forEach(c=>{ if(/^FUNC /.test(c.value)) c.checked=true; }); });
 await p.fill('#cierre [data-czmm="ad"]','20000'); await p.selectOption('#cierre [data-czmc="ad"]',{index:1}); await p.click('#cierre [data-cz="multi"][data-k="ad"]'); await p.waitForTimeout(500);
 const ad1=await p.evaluate(()=>(Object.values(window.__cz.st().draft)[0].d.ad||[]).length); ok(ad1-ad0===18,'adelanto a 18 funcionarios de una vez (sin límite)');
 await p.evaluate(()=>{ let c=0; window.__aiVision=async(L)=>{ const n=L.length; const items=[]; for(let i=0;i<n;i++){ c++; items.push({nombre:'FUNC '+String(c).padStart(2,'0'),pagare:'Q-'+c,monto:1000*c}); } return {text:JSON.stringify({creditos:items})}; }; });
 await p.evaluate(async()=>{ const c=document.createElement('canvas'); c.width=300;c.height=200; const bl=await new Promise(r=>c.toBlob(r,'image/png')); const dt=new DataTransfer(); for(let i=0;i<10;i++) dt.items.add(new File([bl],'q'+i+'.png',{type:'image/png'})); const inp=document.querySelector('#cierre input[data-czfoto="cr"]'); inp.files=dt.files; inp.dispatchEvent(new Event('change',{bubbles:true})); });
 await p.waitForTimeout(6000);
 const Q=await p.evaluate(()=>(Object.values(window.__cz.st().draft)[0].d.cr||[]).filter(r=>/^Q-/.test(r.pg||'')).map(r=>r.nom+':'+r.pg));
 console.log(Q.length, Q.slice(-2)); ok(Q.length===10 && Q.every(x=>/^FUNC \d\d:Q-\d+$/.test(x)),'10 fotos de pagarés (más de las de antes) → 10 renglones, cada uno a su funcionario');

 // al final: lo que salió de la caja con su documento; adelantos con pagaré escaneado
 await p.evaluate(()=>{ window.__aiVision=async()=>({text:JSON.stringify({creditos:[{nombre:'FUNC 01',pagare:'A-1',monto:500000},{nombre:'FUNC 02',pagare:'A-2',monto:500000}]})}); });
 await p.evaluate(async()=>{ const c=document.createElement('canvas'); c.width=300;c.height=200; const bl=await new Promise(r=>c.toBlob(r,'image/png')); const dt=new DataTransfer(); dt.items.add(new File([bl],'a.png',{type:'image/png'})); const inp=document.querySelector('#cierre input[data-czfoto="adp"]'); inp.files=dt.files; inp.dispatchEvent(new Event('change',{bubbles:true})); });
 await p.waitForTimeout(2500);
 const AD=await p.evaluate(()=>(Object.values(window.__cz.st().draft)[0].d.ad||[]).filter(r=>/^A-/.test(r.vale||'')).map(r=>r.func+':'+r.vale+':'+r.m+':'+r.como));
 console.log(AD); ok(AD.length===2 && AD.every(x=>/^FUNC 0[12]:A-[12]:500000:Caja/.test(x)),'pagarés de ADELANTO escaneados → a cada funcionario, salen de la caja');
 t=await p.evaluate(()=>document.querySelector('#cierre').innerText);
 ok(/Lo que SALIÓ de esta caja y sus documentos/.test(t) && /no se puede guardar/.test(t),'al final: lista de salidas con su documento; avisa los que faltan');
 for(let i=0;i<40;i++){ const d=await p.$('#cierre [data-cz="del"][data-k="cr"]'); if(!d) break; await d.click(); await p.waitForTimeout(80); }
 const e3=await errOf(); console.log(e3); ok(/Falta el N\.º de pagaré de: 👤 Adelanto de salario/.test(e3),'sin el N.º de pagaré del adelanto NO guarda');
 ok(errs.length===0,'sin errores de JavaScript '+errs.slice(0,3).join(' | '));
 await b.close(); console.log(fail?'RESULTADO: '+fail+' FALLA(S)':'RESULTADO: TODO OK'); process.exit(fail?1:0);
})().catch(e=>{ console.log('✘ FALLA excepción '+e.message.slice(0,300)); process.exit(1); });
