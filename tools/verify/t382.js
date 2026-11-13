// Prueba "como una persona": teclea, elige de listas y toca botones (sin tocar datos por dentro)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
const SP='/tmp/claude-0/-home-claude/35b1ce44-d35c-5596-924f-bd3f45a2f74d/scratchpad/';
const yes=async(p)=>{ for(let i=0;i<10;i++){ await p.waitForTimeout(250); const a=await p.$('.ask-ov [data-ak="yes"]'); if(a){ await a.click(); return true; } } return false; };
(async()=>{ const W=+(process.env.W||1366); const {b,p,errs}=await setup({vp:{width:W,height:900}});
 const typ=async(sel,v)=>{ await p.waitForTimeout(150); const e=await p.$(sel); if(!e) throw new Error('no está '+sel); await e.scrollIntoViewIfNeeded(); await e.focus(); if(await e.evaluate(x=>x.type!=='date')) await e.fill(''); await p.keyboard.type(v,{delay:20}); await p.keyboard.press('Tab'); await p.waitForTimeout(250); };
 // ===== PROVEEDORES =====
 await p.evaluate(()=>{ const T=window.__tes.st(); T.cfg.emp=Object.assign(T.cfg.emp||{},{nom:'RAMON',ruc:'1234567',dv:'1'}); T.cfg.emp2={nom:'GISELE',ruc:'7654321',dv:'2'}; window.__tes.ui.tab='apag'; window.__tes.open(); }); await p.waitForTimeout(700);
 const btn=await p.$('#tesoreria [data-tx2="lote"]'); ok(!!btn,'Tesorería: está el botón único de Proveedores'); await btn.scrollIntoViewIfNeeded(); await btn.click(); await p.waitForTimeout(700);
 ok(await p.evaluate(()=>!!document.querySelector('#extracto') && !document.querySelector('#extracto').hidden),'abre la pantalla de Proveedores');
 await typ('#extracto [data-exk="prov"]','FARMACENTER');
 await typ('#extracto [data-exk="rucE"]','80055555-5');
 await p.selectOption('#extracto [data-exk="rucR"]','1234567-1'); await p.waitForTimeout(300);
 await typ('#extracto [data-exk="pz"]','45');
 // fila 1 factura
 await typ('#extracto [data-exk="L.0.n"]','001-001-0000777');
 await typ('#extracto [data-exk="L.0.f"]','10012026'); await typ('#extracto [data-exk="L.0.ent"]','10042026');
 await typ('#extracto [data-exk="L.0.m"]','2500000'); await typ('#extracto [data-exk="L.0.ni"]','300000'); await typ('#extracto [data-exk="L.0.ln"]','001-001-0000090'); await typ('#extracto [data-exk="L.0.lm"]','200000');
 ok(await p.evaluate(()=>document.querySelector('#extracto [data-exk="L.0.v"]').value==='2026-11-18'),'vence a pagar automático (04/10 + 45 días = 18/11)');
 // fila 2: NC legal suelta
 await p.click('#extracto [data-ex="add"]'); await p.waitForTimeout(400);
 await p.selectOption('#extracto [data-exk="L.1.tipo"]','Nota de crédito'); await p.waitForTimeout(400);
 await typ('#extracto [data-exk="L.1.n"]','001-001-0000091'); await typ('#extracto [data-exk="L.1.ref"]','001-001-0000778'); await typ('#extracto [data-exk="L.1.m"]','50000');
 // fila 3: factura 2
 await p.click('#extracto [data-ex="add"]'); await p.waitForTimeout(400);
 await typ('#extracto [data-exk="L.2.n"]','001-001-0000778'); await typ('#extracto [data-exk="L.2.f"]','10102026'); await typ('#extracto [data-exk="L.2.ent"]','10112026'); await typ('#extracto [data-exk="L.2.m"]','800000');
 // fila 4: NC interna de la factura 2
 await p.click('#extracto [data-ex="add"]'); await p.waitForTimeout(400);
 await p.selectOption('#extracto [data-exk="L.3.tipo"]','NC interna (NCI)'); await p.waitForTimeout(400);
 await typ('#extracto [data-exk="L.3.ref"]','001-001-0000778'); await typ('#extracto [data-exk="L.3.m"]','90000');
 await typ('#extracto [data-exk="saldo"]','3050000');
 let t=await p.evaluate(()=>document.querySelector('#extracto').innerText);
 ok(/EL EXTRACTO CUADRA/.test(t),'cuadra: 2.500.000 − 200.000 + 800.000 − 50.000 = 3.050.000');
 ok(/merma ₲ 140\.000/.test(t),'merma total 100.000 + 40.000 = 140.000');
 await p.evaluate(()=>{ const e=[...document.querySelectorAll('#extracto h4')].find(h=>/Renglones/.test(h.textContent)); e.scrollIntoView(); });
 await p.screenshot({path:SP+'m_ex_'+W+'.png'});
 await p.click('#extracto [data-ex="save"]'); ok(await yes(p),'pide confirmar al guardar'); await p.waitForTimeout(800);
 const R=await p.evaluate(()=>{ const T=window.__tes.st(), F=T.fac.filter(f=>f.prov==='FARMACENTER'); return {F:F.map(f=>(f.legal?'NCL':'FAC')+':'+f.num+':'+f.monto+':'+(f.vence||'')+':'+(f.rucR||'')), N:(T.nci||[]).filter(n=>n.prov==='FARMACENTER').map(n=>n.facr+':'+n.monto+':'+n.st+':'+n.perd), ext:T.ext.filter(e=>e.prov==='FARMACENTER').length}; });
 console.log(JSON.stringify(R));
 ok(R.F.length===4 && R.F.includes('FAC:001-001-0000777:2500000:2026-11-18:1234567-1') && R.F.includes('FAC:001-001-0000778:800000:2026-11-25:1234567-1'),'facturas en tu sistema con vencimiento y empresa');
 ok(R.N.includes('001-001-0000777:300000:aprob:100000') && R.N.includes('001-001-0000778:90000:aprob:40000'),'NC internas unidas con su merma');
 ok(R.ext===1,'extracto guardado');
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(a=>a.hidden=true); window.__tes.ui.tab='apag'; window.__tes.open(); }); await p.waitForTimeout(600);
 t=await p.evaluate(()=>document.querySelector('#tesoreria').innerText); ok(await p.evaluate(()=>window.__tes.st().fac.some(f=>f.prov==='FARMACENTER'&&f.vence)),'en Tesorería quedan con su vencimiento para programar');
 // ===== CIERRE X =====
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(a=>a.hidden=true); window.__cz.open(); }); await p.waitForTimeout(800);
 await typ('#cierre [data-czk="v.ef"]','1500000'); await typ('#cierre [data-czk="v.deb"]','120000'); await typ('#cierre [data-czk="v.cre"]','80000'); await typ('#cierre [data-czk="v.qr"]','45000'); await typ('#cierre [data-czk="v.tr"]','150000');
 await p.click('#cierre [data-cz="add"][data-k="tjd"]'); await p.waitForTimeout(400);
 await typ('#cierre [data-czk="tjd.0.tk"]','123456'); await typ('#cierre [data-czk="tjd.0.au"]','A1B2'); await p.selectOption('#cierre [data-czk="tjd.0.p"]','Bancard'); await p.selectOption('#cierre [data-czk="tjd.0.ty"]','Débito'); await typ('#cierre [data-czk="tjd.0.m"]','120000');
 await p.click('#cierre [data-cz="add"][data-k="tjd"]'); await p.waitForTimeout(400);
 await typ('#cierre [data-czk="tjd.1.tk"]','123457'); await p.selectOption('#cierre [data-czk="tjd.1.ty"]','Crédito'); await typ('#cierre [data-czk="tjd.1.cu"]','3'); await typ('#cierre [data-czk="tjd.1.m"]','80000');
 await p.click('#cierre [data-cz="add"][data-k="qrd"]'); await p.waitForTimeout(400);
 await typ('#cierre [data-czk="qrd.0.op"]','QR998'); await typ('#cierre [data-czk="qrd.0.m"]','45000');
 await p.click('#cierre [data-cz="add"][data-k="trd"]'); await p.waitForTimeout(400);
 await p.selectOption('#cierre [data-czk="trd.0.b"]','Banco Itaú'); await typ('#cierre [data-czk="trd.0.n"]','MARIA LOPEZ'); await typ('#cierre [data-czk="trd.0.op"]','778899'); await typ('#cierre [data-czk="trd.0.m"]','100000');
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(500);
 t=await p.evaluate(()=>document.querySelector('#cierre').innerText);
 ok(/✔ 💳 Tarjetas/.test(t),'tarjetas: detalle 120.000 + 80.000 cuadra con el ticket');
 ok(/✔ 📱 QR/.test(t),'QR cuadra');
 ok(/⚠️ 🏦 Transferencias/.test(t) && /falta detallar ₲ 50\.000/.test(t),'transferencias: avisa que falta detallar 50.000');
 ok(/Siguiente paso:<?\/?b?>? ?🏦 Transferencias|Siguiente paso: 🏦 Transferencias/.test(t),'«Siguiente paso» lleva a Transferencias');
 await p.click('#cierre [data-cz="blk"][data-v="czb-tr"]'); await p.waitForTimeout(600);
 await p.screenshot({path:SP+'m_cz_'+W+'.png'});
 await p.click('#cierre [data-cz="cvw"][data-v="cta"]'); await p.waitForTimeout(500);
 t=await p.evaluate(()=>document.querySelector('#cierre').innerText); ok(/TOTAL a ver en el extracto/.test(t) && /sin detalle/.test(t),'conciliación junta por cuenta (marca lo sin detalle)');
 await p.evaluate(()=>document.getElementById('czb-cc').scrollIntoView()); await p.waitForTimeout(300); await p.screenshot({path:SP+'m_cc_'+W+'.png'});
 ok(errs.length===0,'sin errores de JavaScript '+errs.slice(0,3).join(' | '));
 await b.close(); console.log(fail?'RESULTADO: '+fail+' FALLA(S)':'RESULTADO: TODO OK'); process.exit(fail?1:0);
})().catch(e=>{ console.log('✘ FALLA excepción '+e.message.slice(0,300)); process.exit(1); });
