// 🏢 dos empresas: extracto por Excel → pasar al sistema → pendientes → programar pago (transferencia programada) · RUC estricto
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const yes=async()=>{ for(let i=0;i<6;i++){ await p.waitForTimeout(250); const a=await p.$('.ask-ov [data-ak="yes"]'); if(a){ await a.click(); return true; } } return false; };
 await p.evaluate(()=>{ const T=window.__tes.st(); T.cfg.emp=Object.assign(T.cfg.emp||{},{nom:'RAMON',ruc:'1234567',dv:'1'}); T.cfg.emp2={nom:'GISELE',ruc:'7654321',dv:'2'}; const h=new Date(); window.__H=h.getFullYear()+'-'+String(h.getMonth()+1).padStart(2,'0')+'-'+String(h.getDate()).padStart(2,'0'); T.sal.push({id:'s1',cta:'Basa-G',f:window.__H,m:10000000}); window.__ex.open(); });
 await p.waitForTimeout(600);
 ok(await p.evaluate(()=>document.querySelectorAll('#extracto .ex-3 > *').length===3),'3 formas de cargar: a mano, Excel, foto');
 await p.fill('#extracto [data-exk="prov"]','DROGUERIA A'); await p.dispatchEvent('#extracto [data-exk="prov"]','change'); await p.waitForTimeout(300);
 await p.fill('#extracto [data-exk="rucE"]','80011111-1'); await p.dispatchEvent('#extracto [data-exk="rucE"]','change'); await p.waitForTimeout(300);
 await p.selectOption('#extracto [data-exk="rucR"]','1234567-1'); await p.waitForTimeout(400);
 await p.setInputFiles('#extracto [data-exfile="xl"]',''+__dirname+'/fix/ext.csv'); await p.waitForTimeout(1200);
 const L=await p.evaluate(()=>window.__ex.d().L.map(l=>l.tipo+'|'+l.n+'|'+l.f+'|'+l.m));
 console.log(L); ok(L.length===4 && /^Factura\|001-001-0000101\|2026-10-01\|1000000/.test(L[0]) && /^Nota de crédito/.test(L[2]) && /^Pago/.test(L[3]),'Excel/CSV: lee columnas Debe/Haber y tipos');
 ok(await p.evaluate(()=>window.__ex.d().saldo==='2200000'),'toma el saldo final del extracto');
 // pasar al sistema
 await p.evaluate(()=>document.querySelector('#extracto [data-ex="save"]').click()); await p.waitForTimeout(400); ok(await yes(),'un solo botón 💾: pide confirmar, crea lo que falta y guarda el extracto'); await p.waitForTimeout(500);
 const F=await p.evaluate(()=>window.__tes.st().fac.filter(f=>f.prov==='DROGUERIA A').map(f=>f.tipo+'|'+f.num+'|'+f.rucE+'|'+f.rucR+'|'+(f.legal||0)));
 console.log(F); ok(F.length===3 && F.every(x=>/80011111-1\|1234567-1/.test(x)),'crea 2 facturas + 1 NC legal a nombre de RAMON con RUC emisor');
 // guardar extracto
 await p.waitForTimeout(300); // v1210: el mismo 💾 ya guardó el extracto
 ok(await p.evaluate(()=>window.__tes.st().ext.length===1 && window.__tes.st().ext[0].rucR==='1234567-1'),'extracto guardado con su empresa');
 ok(await p.evaluate(()=>window.__tes.st().cfg.provRuc['DROGUERIA A']==='80011111-1'),'aprende el RUC del proveedor');
 // mismo proveedor, extracto de GISELE con otro RUC emisor → bloqueado
 await p.evaluate(()=>{ document.querySelector('#extracto [data-ex="tab"][data-v="cargar"]').click(); }); await p.waitForTimeout(300);
 await p.fill('#extracto [data-exk="prov"]','DROGUERIA A'); await p.dispatchEvent('#extracto [data-exk="prov"]','change'); await p.waitForTimeout(300);
 await p.fill('#extracto [data-exk="rucE"]','80099999-9'); await p.dispatchEvent('#extracto [data-exk="rucE"]','change'); await p.waitForTimeout(300);
 await p.selectOption('#extracto [data-exk="rucR"]','7654321-2'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>/registrado con RUC 80011111-1/.test(document.querySelector('#extracto').innerText)),'RUC emisor distinto al del proveedor → ⛔');
 await p.fill('#extracto [data-exk="rucE"]','80011111-1'); await p.dispatchEvent('#extracto [data-exk="rucE"]','change'); await p.waitForTimeout(300);
 await p.fill('#extracto [data-exk="L.0.n"]','001-001-0000101'); await p.dispatchEvent('#extracto [data-exk="L.0.n"]','change'); await p.fill('#extracto [data-exk="L.0.m"]','1000000'); await p.dispatchEvent('#extracto [data-exk="L.0.m"]','change'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>/a nombre de RAMON, no de GISELE/.test(document.querySelector('#extracto').innerText)),'factura de RAMON en extracto de GISELE → ⛔ va en el otro extracto');
 await p.evaluate(()=>document.querySelector('#extracto [data-ex="reset"]').click()); await p.waitForTimeout(300);
 // pendientes
 await p.evaluate(()=>document.querySelector('#extracto [data-ex="tab"][data-v="pend"]').click()); await p.waitForTimeout(400);
 const pt=await p.evaluate(()=>document.querySelector('#extracto').innerText); ok(/Pendientes a pagar/.test(pt) && /DROGUERIA A/.test(pt) && /RAMON/.test(pt),'⏳ pendientes por proveedor y empresa');
 await p.evaluate(()=>document.querySelector('#extracto [data-ex="topag"]').click()); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>document.querySelector('#extracto [data-exp="rr"]').value==='1234567-1'),'💳 Programar pago abre con la empresa elegida');
 await p.evaluate(()=>document.querySelector('#extracto [data-exa="all"]').click()); await p.waitForTimeout(400);
 await p.selectOption('#extracto [data-exy="fp"]','Transferencia'); await p.waitForTimeout(400);
 await p.selectOption('#extracto [data-exy="cta"]','Basa-G'); await p.waitForTimeout(400);
 const fut=await p.evaluate(()=>{ const d=new Date(Date.now()+5*864e5); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); });
 await p.fill('#extracto [data-exy="em"]',fut); await p.dispatchEvent('#extracto [data-exy="em"]','change'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>/Tarjeta/.test(document.querySelector('#extracto [data-exy="fp"]').innerHTML) && /PROGRAMADA/.test(document.querySelector('#extracto').innerText)),'formas: tarjeta y fecha programada');
 await p.evaluate(()=>document.querySelector('#extracto [data-exa="pay"]').click()); await p.waitForTimeout(600);
 const err=await p.evaluate(()=>(document.querySelector('#exPErr')||{}).textContent||''); if(err) console.log('err:',err);
 const C=await p.evaluate(()=>window.__tes.st().chq.filter(c=>c.prov==='DROGUERIA A').map(c=>c.tipo+'|'+c.st+'|'+c.co+'|'+c.monto+'|'+c.rucR));
 console.log(C); ok(C.length===1 && /^TRANSFERENCIA\|pend\|/.test(C[0]) && /\|2700000\|1234567-1$/.test(C[0]),'transferencia programada (a pagar) por 3.000.000 − NC 300.000, con empresa');
 // aparece en Cheques a pagar
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(a=>a.hidden=true); window.__tes.ui.tab='apag'; window.__tes.open(); }); await p.waitForTimeout(700);
 ok(await p.evaluate(()=>/DROGUERIA A/.test(document.querySelector('#tesoreria').innerText)),'aparece en 💳 Cheques a pagar');
 console.log('errs',errs,'fallas',fail); await b.close(); })();
