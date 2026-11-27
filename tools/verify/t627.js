// v1351 · 📲 Pedidos de la app: transferencia con comprobante (administración verifica) o paga al retirar; efectivo solo autorizado (caja externa con cierre y rendición); stock se descuenta en la sucursal que entrega; queda quién vendió, quién entregó, hora y turno
const setup=require('./rvlib.js'); let bad=0; const ok=(c,m)=>{ console.log((c?'✔ ':'✘ FALLA ')+m); if(!c) bad++; };
const IMG=process.env.IMG||'/tmp/claude-0/mob/comp.png';
(async()=>{ const {b,p,errs}=await setup({vp:{width:1100,height:900}});
 const clean=()=>p.evaluate(()=>document.querySelectorAll('.ico-ov,.vt-aut,.ask-ov').forEach(o=>o.remove()));
 const toast=()=>p.evaluate(()=>{ const t=document.getElementById('toast'); return t?t.innerText:''; });
 const pin=async(who,n)=>{ await p.waitForSelector('.vt-aut [data-au="pin"]'); await p.evaluate(w=>{ const s=document.querySelector('.vt-aut select[data-au="who"]'); const o=[...s.options].find(x=>x.textContent.startsWith(w)); s.value=o.value; },who); await p.fill('.vt-aut [data-au="pin"]',n); await p.click('.vt-aut [data-au="ok"]'); await p.waitForTimeout(400); };
 await p.evaluate(()=>{ const P=window.__pla.st(); P.emps=P.emps||[]; P.emps.push({id:'e1',n:'Ana Vendedora',cargo:'Vendedora',suc:'KM 7',pin:'4321'},{id:'e2',n:'Carlos Cajero',cargo:'Cajero',suc:'KM 7',pin:'1111'},{id:'e3',n:'Ramón Dueño',cargo:'Director',suc:'KM 7',pin:'9999'});
   window.__vt.open(); const V=window.__vt.st(); V.open=false; V.stock={}; V.sales=[]; V.movs=[]; V.vendAct='Ana Vendedora'; V.obj=V.obj||{}; V.obj.suc='KM 7 Central'; V.arts.a1={id:'a1',n:'IBUPROFENO 400 MG',pvp:10000,u:1}; V.stk.a1=20; V.sold={}; window.__vt.open(); });
 await p.waitForTimeout(400);
 await p.click('#ventas [data-vt="ini"]'); await p.waitForTimeout(400); await p.fill('.vt-cnt [data-vn="GS:50000"]','4'); await p.dispatchEvent('.vt-cnt [data-vn="GS:50000"]','change'); await p.fill('.vt-cnt [data-vn="GS:10000"]','5'); await p.dispatchEvent('.vt-cnt [data-vn="GS:10000"]','change'); await p.waitForTimeout(200); await p.click('.vt-cnt [data-vc="ok"]'); await p.waitForTimeout(500); await clean();
 const st=()=>p.evaluate(()=>window.__vt.stk('a1'));
 const s0=await st();
 const cargar=async(q)=>{ await p.evaluate(q=>{ const V=window.__vt.st(), t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.cli=''; t.cid=''; t.lines=[{aid:'a1',n:'IBUPROFENO 400 MG',q:q,pvp:10000,uq:1,nodesc:true}]; window.__vt.open(); },q); await p.waitForTimeout(300); await p.click('#ventas [data-vt="pdnew"]'); await p.waitForTimeout(400); };
 const fillCli=async(n,tel)=>{ await p.fill('.vt-pd [data-pf="cli"]',n); await p.fill('.vt-pd [data-pf="tel"]',tel); };
 // 1) transferencia sin foto → no deja
 await cargar(2); ok(await p.evaluate(()=>/Transferencia/.test(document.querySelector('.vt-pd').innerText)&&/Paga al retirar/.test(document.querySelector('.vt-pd').innerText)),'pedido de la app: formas de pago transferencia / QR / paga al retirar');
 await fillCli('María González','0981 222 333'); await p.click('.vt-pd [data-pd="ok"]'); await p.waitForTimeout(300);
 ok(/comprobante/.test(await toast()) && await p.evaluate(()=>window.__vped.all().length)===0,'transferencia sin foto del comprobante: no genera el pedido');
 // delivery: «paga al retirar» queda deshabilitado y pide dirección
 await p.click('.vt-pd [data-pe="del"]'); await p.waitForTimeout(200);
 ok(await p.evaluate(()=>document.querySelector('.vt-pd [data-pp="suc"]').disabled),'delivery: «paga al retirar» no se puede elegir');
 await p.setInputFiles('.vt-pd [data-pfoto]',IMG); await p.waitForTimeout(900);
 await p.click('.vt-pd [data-pd="ok"]'); await p.waitForTimeout(300); ok(/dirección/.test(await toast()),'delivery sin dirección ni ubicación: avisa');
 await p.fill('.vt-pd [data-pf="dir"]','Barrio San Isidro, casa verde'); await p.fill('.vt-pd [data-pf="link"]','-25.51234, -54.61234'); await p.dispatchEvent('.vt-pd [data-pf="link"]','change'); await p.waitForTimeout(300);
 await p.click('.vt-pd [data-pd="ok"]'); await p.waitForTimeout(500);
 let P1=await p.evaluate(()=>{ const x=window.__vped.all()[0]; return x&&{n:x.n,st:x.st,foto:!!(x.pag.foto&&/^data:image\/jpeg/.test(x.pag.foto)),lat:x.ent.lat,suc:x.suc,by:x.by,turno:x.turno,tab:window.__vt.st().tabs[0].lines.length}; });
 ok(P1&&P1.st==='ver'&&P1.foto&&P1.lat===-25.51234&&P1.suc==='KM 7 Central'&&P1.by==='Ana Vendedora'&&P1.turno&&P1.tab===0,'pedido N.º 1: queda «falta verificar», con foto, ubicación, sucursal, vendedor y turno; la venta se vacía '+JSON.stringify(P1));
 ok(/Mandar a la sucursal/.test(await p.evaluate(()=>document.querySelector('.vt-pd').innerText)),'al generar: botón para mandar a la sucursal por WhatsApp');
 await clean();
 // 2) administración verifica → preparado → salió → entregado (descuenta stock)
 await p.click('#ventas [data-vt="pdlist"]'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>!document.querySelector('.vt-pd [data-pa="ent"]') && !!document.querySelector('.vt-pd [data-pa="vok"]')),'sin verificar la transferencia no se puede entregar');
 await p.click('.vt-pd [data-pa="vok"]'); await pin('Carlos Cajero','1111');
 await p.click('.vt-pd [data-pa="prep"]'); await p.waitForTimeout(200);
 await p.click('.vt-pd [data-pa="sal"]'); await p.waitForTimeout(300); await p.fill('.ask-ov .ask-in','Pedro Moto'); await p.click('.ask-ov [data-ak="yes"]'); await p.waitForTimeout(300);
 await p.click('.vt-pd [data-pa="ent"]'); await p.waitForTimeout(500);
 P1=await p.evaluate(()=>{ const x=window.__vped.all()[0], V=window.__vt.st(), s=V.sales[V.sales.length-1]; return {st:x.st,ver:x.pag.verBy,rep:x.rep,entBy:x.entBy,tk:x.tk,sale:s&&{ped:s.ped,vend:s.vend,ent:s.ent,fp:s.pays[0].fp,total:s.total}}; });
 ok(P1.st==='ent'&&P1.ver==='Carlos Cajero'&&P1.entBy==='Ana Vendedora'&&P1.sale.ped&&P1.sale.vend==='Ana Vendedora'&&P1.sale.fp==='tr'&&P1.sale.total===20000,'verificó, preparó, salió y se entregó: venta registrada con transferencia, quién vendió y quién entregó '+JSON.stringify(P1));
 ok(await st()===s0-2,'stock descontado en la sucursal que entrega ('+s0+' → '+(await st())+')');
 await clean();
 // 3) paga al retirar → se cobra en caja
 await cargar(1); await fillCli('Juan Pérez','0983 444 555'); await p.click('.vt-pd [data-pp="suc"]'); await p.waitForTimeout(200); await p.click('.vt-pd [data-pd="ok"]'); await p.waitForTimeout(500); await clean();
 await p.click('#ventas [data-vt="pdlist"]'); await p.waitForTimeout(400);
 ok(/Paga al retirar/.test(await p.evaluate(()=>document.querySelector('.vt-pd').innerText))&&/código/.test(await p.evaluate(()=>document.querySelector('.vt-pd').innerText)),'paga al retirar: aparece en la sucursal con el código de retiro');
 await p.click('.vt-pd [data-pa="caja"]'); await p.waitForTimeout(500);
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(500); await p.fill('.vt-ov [data-rqn="10000"]','1'); await p.dispatchEvent('.vt-ov [data-rqn="10000"]','input'); await p.waitForTimeout(300); await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(700); await clean();
 const P2=await p.evaluate(()=>{ const x=window.__vped.all()[1], V=window.__vt.st(), s=V.sales[V.sales.length-1]; return {st:x.st,tk:x.tk,ped:s.ped,app:s.vendApp,fp:s.pays[0].fp}; });
 ok(P2.st==='ent'&&P2.ped&&P2.app==='Ana Vendedora'&&P2.fp==='ef','cobrado en caja al retirar: el pedido queda entregado y la venta lleva quién vendió por app '+JSON.stringify(P2));
 // 4) v1353: la app ya no cobra efectivo (sin vuelto): transferencia, QR o paga al retirar
 await cargar(3); ok(await p.evaluate(()=>!document.querySelector('.vt-pd [data-pp="efx"]') && !!document.querySelector('.vt-pd [data-pp="qr"]')),'sin efectivo en la app; aparece 📱 QR'); await clean();
 ok(await p.evaluate(()=>window.__memcGet().__mt && window.__memcGet().__mt.vped>0),'los pedidos quedan en los datos que viajan por la nube');
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 await b.close(); if(bad){ console.log('✘ t627 con fallas'); process.exit(1);} })();
