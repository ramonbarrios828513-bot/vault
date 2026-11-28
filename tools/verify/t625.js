// v1349 · egresos por caja billete por billete (adelanto de salario, compra, remesa rápida) + 🖥️ pantalla del cliente para elegir producto por el vuelto
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const P=window.__pla.st(); P.emps=P.emps||[]; P.emps.push({id:'eA1',n:'Ana Vendedora',suc:'KM 7',pin:'4321'}); window.__vt.open(); const V=window.__vt.st(); V.open=true; V.iniAt=Date.now(); V.vendAct='Ana Vendedora'; V.movs=[]; V.sales=[]; V.stock={GS:{100000:4,50000:6,20000:3,10000:5,5000:4,2000:5,1000:10,500:6}}; V.pr.favTope=2000; window.__vt.open(); });
 await p.waitForTimeout(400);
 // 1) adelanto de salario: elige funcionario y los billetes salen del stock
 await p.click('#ventas [data-vt="pago"]').catch(async()=>{ const k=await p.evaluate(()=>[...document.querySelectorAll('#ventas [data-vt]')].map(x=>x.dataset.vt).join(',')); console.log('   botones',k); });
 await p.waitForTimeout(400);
 const hasAd=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-cc]')].some(b=>/Adelanto de salario/.test(b.textContent)));
 ok(hasAd,'el egreso por caja ofrece «Adelanto de salario» y «Compra al contado»');
 await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-cc]')].find(b=>/Adelanto de salario/.test(b.textContent)).click()); await p.waitForTimeout(400);
 const sel=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-md="who"] option')].map(o=>o.textContent)); ok(sel.includes('Ana Vendedora'),'pide a qué funcionario (de la planilla)');
 await p.click('.vt-ov [data-md="ok"]'); await p.waitForTimeout(400);
 await p.fill('.vt-cnt [data-vn="GS:50000"]','2'); await p.dispatchEvent('.vt-cnt [data-vn="GS:50000"]','change'); await p.waitForTimeout(300); await p.click('.vt-cnt [data-vc="ok"]'); await p.waitForTimeout(500);
 const a1=await p.evaluate(()=>{ const V=window.__vt.st(), m=V.movs.slice(-1)[0]; return {n:m.n, g:m.g, k:m.k, st:V.stock.GS[50000]}; }); console.log('   '+JSON.stringify(a1));
 ok(a1.k==='pago'&&/Adelanto de salario · Ana Vendedora/.test(a1.n)&&a1.g===100000&&a1.st===4,'adelanto de ₲ 100.000 a Ana: salen 2 billetes de 50.000 del stock');
 await p.evaluate(()=>document.querySelectorAll('.ico-ov').forEach(o=>o.remove()));
 // 2) compra al contado: proveedor + factura
 await p.click('#ventas [data-vt="pago"]'); await p.waitForTimeout(400); await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-cc]')].find(b=>/Compra al contado/.test(b.textContent)).click()); await p.waitForTimeout(300);
 await p.fill('.vt-ov [data-md="prov"]','Distribuidora Prueba'); await p.fill('.vt-ov [data-md="fac"]','001-001-0000123'); await p.click('.vt-ov [data-md="ok"]'); await p.waitForTimeout(300);
 await p.fill('.vt-cnt [data-vn="GS:20000"]','1'); await p.dispatchEvent('.vt-cnt [data-vn="GS:20000"]','change'); await p.waitForTimeout(300); await p.click('.vt-cnt [data-vc="ok"]'); await p.waitForTimeout(500);
 const a2=await p.evaluate(()=>{ const V=window.__vt.st(), m=V.movs.slice(-1)[0]; return {n:m.n, g:m.g, st:V.stock.GS[20000]}; }); ok(/Compra al contado \(proveedor\) · Distribuidora Prueba · factura 001-001-0000123/.test(a2.n)&&a2.g===20000&&a2.st===2,'pago de compra: proveedor y factura anotados, sale 1 billete de 20.000');
 await p.evaluate(()=>document.querySelectorAll('.ico-ov').forEach(o=>o.remove()));
 // 3) remesa en el turno: un toque saca todos los 100.000 y 50.000
 await p.click('#ventas [data-vt="rem"]'); await p.waitForTimeout(400); await p.evaluate(()=>document.querySelector('.vt-ov [data-cc]').click()); await p.waitForTimeout(400);
 await p.evaluate(()=>[...document.querySelectorAll('.vt-cnt [data-vc^="qk"]')].find(b=>/100\.000 y 50\.000/.test(b.textContent)).click()); await p.waitForTimeout(300); await p.click('.vt-cnt [data-vc="ok"]'); await p.waitForTimeout(500);
 const a3=await p.evaluate(()=>{ const V=window.__vt.st(), m=V.movs.slice(-1)[0]; return {k:m.k, g:m.g, s1:+(V.stock.GS[100000]||0), s5:+(V.stock.GS[50000]||0)}; }); console.log('   '+JSON.stringify(a3)); ok(a3.k==='rem'&&a3.g===600000&&a3.s1===0&&a3.s5===0,'remesa sin cerrar caja: un toque saca los 4 de 100.000 y los 4 de 50.000 (₲ 600.000)');
 await p.evaluate(()=>document.querySelectorAll('.ico-ov').forEach(o=>o.remove()));
 // 4) 🖥️ pantalla del cliente: elige el producto por su vuelto
 await p.evaluate(()=>{ const V=window.__vt.st(); V.arts['dul1']={id:'dul1',n:'CARAMELO MENTA',pvp:500,u:1}; V.arts['dul2']={id:'dul2',n:'CHICLE',pvp:1000,u:1}; V.stk['dul1']=50; V.stk['dul2']=50; V.pr.vuArts=['dul1','dul2']; V.stock={GS:{100000:5,50000:10,20000:15,10000:27,5000:17,2000:16,1000:48}}; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:18150,uq:1,nodesc:true}]; t.cid=''; t.cli=''; window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(500); await p.click('.vt-ov [data-rqn="100000"]'); await p.keyboard.type('1'); await p.waitForTimeout(500);
 const [pop]=await Promise.all([p.waitForEvent('popup'), p.click('.vt-ov [data-vp="cliscr"]')]); await pop.waitForTimeout(900);
 const pt=await pop.evaluate(()=>document.body.innerText); console.log('   cliente: '+pt.replace(/\s+/g,' ').slice(0,200));
 ok(/No tenemos cambio para ₲ 850/.test(pt)&&/CARAMELO MENTA/.test(pt)&&!/CHICLE/.test(pt)&&/Cargar ₲ 850 a mi Billetera Nissifarma/.test(pt),'la pantalla del cliente muestra los productos elegidos de hasta ₲ 850 y la opción billetera');
 await pop.screenshot({path:'/tmp/claude-0/-home-claude/35b1ce44-d35c-5596-924f-bd3f45a2f74d/scratchpad/pantalla-cliente.png'});
 await pop.click('[data-id="dul1"]'); await p.waitForTimeout(900);
 const a4=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.vt-ov')].pop(); return /Vuelto en producto/.test(o.textContent) && /CARAMELO MENTA/.test(o.textContent); }); ok(a4,'el cliente toca el caramelo en su pantalla → queda como vuelto en producto en la caja');
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 console.log('fallas',fail); await b.close(); process.exit(fail?1:0); })();
