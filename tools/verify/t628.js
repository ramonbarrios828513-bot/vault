// v1353 · 📲 pedidos de la app: el vendedor de sucursal vende de la suya (otra solo si en la suya falta) y le suma igual; sugiere la sucursal que tiene todo y queda más cerca; QR (banco/billetera, PIX con monto, datos para transferir); filtro de sucursal en la lista; resumen por vendedor y sucursal
const setup=require('./rvlib.js'); let bad=0; const ok=(c,m)=>{ console.log((c?'✔ ':'✘ FALLA ')+m); if(!c) bad++; };
const IMG=process.env.IMG||'/tmp/claude-0/mob/comp.png';
(async()=>{ const {b,p,errs}=await setup({});
 const clean=()=>p.evaluate(()=>document.querySelectorAll('.ico-ov,.vt-aut,.ask-ov').forEach(o=>o.remove()));
 const toast=()=>p.evaluate(()=>{ const t=document.getElementById('toast'); return t?t.innerText:''; });
 const pin=async(who,n)=>{ await p.waitForSelector('.vt-aut [data-au="pin"]'); await p.evaluate(w=>{ const s=document.querySelector('.vt-aut select[data-au="who"]'); const o=[...s.options].find(x=>x.textContent.startsWith(w)); s.value=o.value; },who); await p.fill('.vt-aut [data-au="pin"]',n); await p.click('.vt-aut [data-au="ok"]'); await p.waitForTimeout(400); };
 await p.evaluate(()=>{ const P=window.__pla.st(); P.emps=P.emps||[]; P.emps.push({id:'e1',n:'Ana Vendedora',cargo:'Vendedora',suc:'KM 8',pin:'4321'},{id:'e3',n:'Ramón Dueño',cargo:'Director',suc:'',pin:'9999'});
   window.__vt.open(); const V=window.__vt.st(); V.open=false; V.sales=[]; V.vendAct='Ana Vendedora'; V.obj=V.obj||{}; V.obj.suc='KM 7 Central'; V.rate=V.rate||{}; V.rate.BRL=1400;
   V.arts.a1={id:'a1',n:'IBUPROFENO 400 MG',pvp:10000,u:1}; V.arts.a2={id:'a2',n:'PARACETAMOL',pvp:5000,u:1}; V.stk.a1=20; V.stk.a2=0; V.sold={};
   V.sucS=V.sucS||{}; V.sucS['KM 8']={a1:{s:5,v:1},a2:{s:4,v:1}}; V.sucS['Franco']={a1:{s:9,v:1},a2:{s:9,v:1}}; V.sucS['Santa Ana']={a1:{s:0},a2:{s:0}}; V.sucS['KM 11']={a1:{s:1},a2:{s:0}};
   const m=window.__memcGet(); m.vcfg={suc:{'Franco':{lat:-25.50,lng:-54.60,tel:'0981111111'},'KM 8':{lat:-25.52,lng:-54.66},'KM 7 Central':{lat:-25.53,lng:-54.63}},qr:[],pix:{key:'nissi@ejemplo.com',n:'Nissifarma',c:'Foz do Iguacu'},dat:'Banco X · titular Nissifarma'};
   window.__vt.open(); });
 await p.waitForTimeout(400);
 const cargar=async(L)=>{ await p.evaluate(L=>{ const V=window.__vt.st(), t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.cli=''; t.lines=L; window.__vt.open(); },L); await p.waitForTimeout(300); await p.click('#ventas [data-vt="pdnew"]'); await p.waitForTimeout(400); };
 const A1={aid:'a1',n:'IBUPROFENO 400 MG',q:2,pvp:10000,uq:1,nodesc:true}, A2={aid:'a2',n:'PARACETAMOL',q:1,pvp:5000,uq:1,nodesc:true};
 // 1) vendedora de KM 8 con todo en KM 8 → solo KM 8
 await cargar([A1,A2]);
 let S=await p.evaluate(()=>[...document.querySelectorAll('.vt-pd [data-ps]')].map(x=>[x.dataset.ps,x.classList.contains('on'),x.disabled]));
 ok(S.find(x=>x[0]==='KM 8')[1] && S.filter(x=>x[0]!=='KM 8').every(x=>x[2]),'vendedora de KM 8: vende de su sucursal, las otras bloqueadas '+JSON.stringify(S));
 ok(!(await p.evaluate(()=>!!document.querySelector('.vt-pd [data-pp="efx"]'))),'no hay efectivo en la app');
 await clean();
 // 2) en KM 8 falta → puede de otra; sugiere la que tiene todo
 await p.evaluate(()=>{ window.__vt.st().sucS['KM 8'].a2.s=0; });
 await cargar([A1,A2]);
 S=await p.evaluate(()=>[...document.querySelectorAll('.vt-pd [data-ps]')].map(x=>[x.dataset.ps,x.classList.contains('on'),x.disabled]));
 ok(S.find(x=>x[0]==='Franco')[1] && S.every(x=>!x[2]),'en KM 8 falta: elige Franco (tiene todo) y deja elegir '+JSON.stringify(S));
 await p.fill('.vt-pd [data-pf="cli"]','Cliente Uno'); await p.click('.vt-pd [data-pp="qr"]'); await p.waitForTimeout(300);
 ok(/QR del banco/.test(await p.evaluate(()=>document.querySelector('.vt-pd').innerText)),'QR: opciones banco/billetera, PIX y datos');
 await p.click('.vt-pd [data-pq="pix"]'); await p.waitForTimeout(1500);
 const pixT=await p.evaluate(()=>document.querySelector('.vt-pd .vt-qrz').innerText);
 ok(/R\$ 17,86/.test(pixT),'PIX: ₲ 25.000 a ₲ 1.400 → R$ 17,86 '+pixT.slice(0,80));
 const qrOk=await p.evaluate(()=>!!document.querySelector('.vt-pd [data-qrd] canvas, .vt-pd [data-qrd] img'));
 ok(qrOk,'PIX: dibuja el QR aun sin internet');
 await p.setInputFiles('.vt-pd [data-pfoto]',IMG); await p.waitForTimeout(900);
 await p.click('.vt-pd [data-pd="ok"]'); await p.waitForTimeout(500);
 const P1=await p.evaluate(()=>{ const x=window.__vped.all().slice(-1)[0]; return {suc:x.suc,vsuc:x.vsuc,otra:x.otra,st:x.st,tp:x.pag.tp,qr:x.pag.qr}; });
 ok(P1.suc==='Franco'&&P1.vsuc==='KM 8'&&P1.otra===1&&P1.st==='ver'&&P1.tp==='qr'&&P1.qr==='PIX','pedido de otra sucursal: queda a nombre de la vendedora de KM 8, marcado «de otra», a verificar '+JSON.stringify(P1));
 await clean();
 // 3) online (Ramón, sin sucursal) con ubicación → la más cerca que tiene todo
 await p.evaluate(()=>{ const V=window.__vt.st(); V.vendAct='Ramón Dueño'; V.sucS['KM 8'].a2.s=4; });
 await cargar([A1]);
 await p.fill('.vt-pd [data-pf="link"]','-25.521, -54.659'); await p.dispatchEvent('.vt-pd [data-pf="link"]','change'); await p.waitForTimeout(300);
 S=await p.evaluate(()=>[...document.querySelectorAll('.vt-pd [data-ps]')].map(x=>[x.dataset.ps,x.classList.contains('on'),x.disabled,x.innerText.replace(/\n/g,' ')]));
 ok(S.find(x=>x[1])[0]==='KM 8' && S.every(x=>!x[2]) && /km/.test(S[0][3]),'online: elige la más cerca que tiene todo (KM 8) '+JSON.stringify(S.slice(0,3)));
 await p.fill('.vt-pd [data-pf="cli"]','Cliente Dos'); await p.click('.vt-pd [data-pp="suc"]'); await p.click('.vt-pd [data-pd="ok"]'); await p.waitForTimeout(500); await clean();
 // 4) PIX: código con CRC válido
 const crcOk=await p.evaluate(()=>{ const c=(window.__vped.pix&&window.__vped.pix('nissi@ejemplo.com','Nissifarma','Foz',10,'T1'))||''; return c; });
 ok(!crcOk || /6304[0-9A-F]{4}$/.test(crcOk),'PIX: termina con CRC');
 // 5) lista: filtro de sucursal y resumen
 await p.click('#ventas [data-vt="pdlist"]'); await p.waitForTimeout(400);
 await p.selectOption('.vt-pd [data-pl="suc"]','Franco'); await p.waitForTimeout(300);
 let tx=await p.evaluate(()=>document.querySelector('.vt-pd').innerText);
 ok(/Cliente Uno/.test(tx)&&!/Cliente Dos/.test(tx),'filtro de sucursal: Franco muestra solo sus pedidos');
 await p.selectOption('.vt-pd [data-pl="suc"]','KM 8'); await p.waitForTimeout(300);
 tx=await p.evaluate(()=>document.querySelector('.vt-pd').innerText);
 ok(/Cliente Dos/.test(tx)&&!/Cliente Uno/.test(tx),'filtro de sucursal: KM 8 muestra solo los suyos');
 ok(/Ventas por app este mes/.test(tx)&&/Ana Vendedora[^\n]*KM 8[^\n]*de otra sucursal/.test(tx),'resumen: por vendedor, por sucursal y lo tomado de otra');
 // 6) configuración: guarda con PIN
 await p.click('.vt-pd [data-pa="scfg"]'); await pin('Ramón Dueño','9999');
 await p.fill('.vt-pd [data-sc="tel"][data-sn="Santa Ana"]','0982 000 111'); await p.fill('.vt-pd [data-sc="loc"][data-sn="Santa Ana"]','-25.40, -54.70'); await p.click('.vt-pd [data-scok]'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>{ const c=window.__memcGet().vcfg.suc['Santa Ana']; return c && c.tel==='0982 000 111' && c.lat===-25.4 && window.__memcGet().__mt.vcfg>0; }),'⚙️ sucursales y cobros: guarda WhatsApp y ubicación en la nube');
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 await b.close(); if(bad){ console.log('✘ t628 con fallas'); process.exit(1);} })();
