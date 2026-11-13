// v1210 · una sola pantalla de proveedores: facturas con entrega/vencimiento y NC en la misma fila, NC legal suelta en el medio, merma, y crea todo unido
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
const yes=async(p)=>{ for(let i=0;i<8;i++){ await p.waitForTimeout(250); const a=await p.$('.ask-ov [data-ak="yes"]'); if(a){ await a.click(); return true; } } return false; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(); T.cfg.emp=Object.assign(T.cfg.emp||{},{nom:'RAMON',ruc:'1234567',dv:'1'}); T.cfg.emp2={nom:'GISELE',ruc:'7654321',dv:'2'}; window.__tes.ui.tab='apag'; window.__tes.open(); }); await p.waitForTimeout(600);
 const nB=await p.evaluate(()=>{ const t=document.querySelector('#tesoreria').innerText; return [/Factura de proveedor/.test(t), /Varias facturas/.test(t)]; });
 ok(!nB[0] && !nB[1],'Tesorería: ya no hay «Factura de proveedor» ni «Varias facturas» sueltos');
 await p.evaluate(()=>{ window.__ex.open(); const x=window.__ex.d(); x.prov='DROGUERIA C'; x.rucE='80044444-4'; x.rucR='1234567-1'; x.pz='30'; x.saldo='';
   x.L=[{tipo:'Factura',n:'001-001-0000001',f:'2026-10-01',ent:'2026-10-03',m:'1000000',ni:'100000',ln:'001-001-0000050',lm:'60000'},
        {tipo:'Nota de crédito',n:'001-001-0000051',f:'2026-10-20',m:'30000',ref:'001-001-0000002'},
        {tipo:'Factura',n:'001-001-0000002',f:'2026-10-05',ent:'2026-10-06',m:'500000'},
        {tipo:'NC interna (NCI)',n:'',f:'2026-10-07',m:'50000',ref:'001-001-0000002'},
        {tipo:'Pago / cheque recibido',n:'9',f:'2026-10-30',m:'200000'}]; window.__ex.open(); }); await p.waitForTimeout(600);
 let t=await p.evaluate(()=>document.querySelector('#extracto').innerText);
 ok(await p.evaluate(()=>document.querySelector('#extracto [data-exk="L.0.v"]').value==='2026-11-02'),'vence a pagar sale solo: entrega + 30 días');
 ok(/merma <b>|merma ₲|Merma con DROGUERIA C/.test(t) && /₲ 40\.000/.test(t),'merma de la factura 1: 100.000 − 60.000 = 40.000');
 ok(/Merma con DROGUERIA C/.test(t) && /merma ₲ 60\.000/.test(t),'resumen de merma del proveedor (40.000 + 20.000)');
 ok(/1\.210\.000/.test(t),'suma: facturas − NC legales − pagos (la NC interna no cambia el saldo)');
 ok(await p.evaluate(()=>document.querySelectorAll('#extracto [data-ex="save"]').length===1 && !document.querySelector('#extracto [data-ex="tosys"]')),'un solo botón 💾 Guardar');
 await p.evaluate(()=>document.querySelector('#extracto [data-ex="save"]').click()); ok(await yes(p),'pide confirmar'); await p.waitForTimeout(600);
 const R=await p.evaluate(()=>{ const T=window.__tes.st(); const F=T.fac.filter(f=>f.prov==='DROGUERIA C'), f1=F.find(f=>f.num==='001-001-0000001'), f2=F.find(f=>f.num==='001-001-0000002'), L1=F.find(f=>f.legal&&f.aplFac===f1.id), L2=F.find(f=>f.legal&&f2&&f.aplFac===f2.id), N=(T.nci||[]); return {n:F.length, v1:f1&&f1.vence, e1:f1&&f1.ent, l1:L1&&L1.monto, l2:L2&&L2.monto, l2n:L2&&L2.num, i1:N.find(n=>n.facId===f1.id), i2:N.find(n=>n.facId===(f2&&f2.id)), ext:T.ext.length}; });
 console.log(JSON.stringify(R).slice(0,400));
 ok(R.n===4,'crea 2 facturas + 2 NC legales');
 ok(R.v1==='2026-11-02' && R.e1==='2026-10-03','factura con entrega y vencimiento');
 ok(R.l1===60000 && R.l2===30000 && R.l2n==='001-001-0000051','NC legal en la fila y NC legal suelta, cada una unida a su factura');
 ok(R.i1 && R.i1.monto===100000 && R.i1.perd===40000 && R.i2 && R.i2.monto===50000 && R.i2.perd===20000,'NC internas unidas, aprobadas y con su merma');
 ok(R.ext===1,'extracto guardado');
 ok(errs.length===0,'sin errores de JavaScript '+errs.slice(0,3).join(' | '));
 await b.close(); console.log(fail?'RESULTADO: '+fail+' FALLA(S)':'RESULTADO: TODO OK'); process.exit(fail?1:0);
})().catch(e=>{ console.log('✘ FALLA excepción '+e.message); process.exit(1); });
