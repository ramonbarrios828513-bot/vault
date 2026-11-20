// v1309 · 📅 lote y vencimiento: stock sin lote = «PRUEBA 2030»; ingreso exige lote y vencimiento; política de canje por proveedor da la fecha límite y la plata en riesgo; se vende primero el lote que vence antes; canje registra NC interna, NC legal y multa
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.obj=Object.assign(V.obj||{}, {suc:'KM 7 Central'}); Object.keys(V.arts).forEach(k=>delete V.arts[k]); V.arts.vk={id:'vk',va:1,n:'Kitadol Forte caja x20',u:20,bar:['7840199086491'],pvp:20000,costo:7000,cod:'1',frac:false,neg:'pvp',prov:'Lasca'}; V.stk.vk=200; V.sold.vk=0; V.lotes={}; V.provC={}; V.canjes=[]; V.sales=[]; V.hist=[]; V.sucS={}; V.tabs.forEach(t=>t.lines=[]); V.cur=V.tabs[0].id; V.stock={GS:{50000:5,20000:5,10000:5,5000:5,2000:5,1000:5},BRL:{},USD:{}}; window.__vt.open(); });
 await p.waitForTimeout(1300); await p.click('#ventas [data-vt="pnl"]'); await p.waitForTimeout(300); await p.click('#pnlMod [data-pt="venc"]'); await p.waitForTimeout(300);
 const txt=()=>p.evaluate(()=>document.getElementById('pnlMod').innerText.replace(/\s+/g,' '));
 const lot0=await p.evaluate(()=>window.__vt.st().lotes.vk.map(q=>q.lote+':'+q.vence+':'+q.q).join());
 ok(lot0==='PRUEBA:2030-12-31:200'&&/1 lote\(s\) lejos/.test(await txt()),'el stock sin lote figura como «PRUEBA», vence 31/12/2030: '+lot0);
 const mf=async(vals)=>{ await p.evaluate((vals)=>{ const o=[...document.querySelectorAll('.vt-ov[data-mini]')].pop(); for(const [k,v] of Object.entries(vals)){ const i=o.querySelector('[data-mf="'+k+'"]'); i.value=v; } o.querySelector('[data-mok]').click(); },vals); await p.waitForTimeout(400); };
 const toast=()=>p.evaluate(()=>document.getElementById('toast').textContent);
 await p.click('#pnlMod [data-vn="pol"]'); await p.waitForTimeout(300); await mf({prov:'Lasca',canje:'si',modo:'dias',dias:'90',rec:'20'});
 const ven=await p.evaluate(()=>{ const d=new Date(); d.setDate(d.getDate()+100); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); });
 await p.click('#pnlMod [data-vn="in"]'); await p.waitForTimeout(300); await mf({bar:'7840199086491',lote:'',vence:ven,q:'2'});
 ok(/Falta el número de lote/.test(await toast())&&(await p.evaluate(()=>window.__vt.st().stk.vk))===200,'sin lote no entra al stock');
 await mf({bar:'7840199086491',lote:'A1',vence:ven,q:'2'});
 const s1=await p.evaluate(()=>{ const V=window.__vt.st(); return {stk:V.stk.vk, lots:V.lotes.vk.map(q=>q.lote+':'+q.q).join()}; });
 ok(s1.stk===240&&/A1:40/.test(s1.lots),'ingreso de 2 cajas con lote A1: stock 240, lote A1 = 40: '+JSON.stringify(s1));
 const row=await p.evaluate(()=>[...document.querySelectorAll('#pnlMod [data-vntb] tr')].map(t=>t.innerText.replace(/\s+/g,' ')).find(x=>/A1/.test(x))||''); console.log(row);
 ok(/🔴/.test(row)&&/faltan (9|10) días/.test(row)&&/reconoce 20 %/.test(row)&&/11\.200/.test(row),'🔴 hay que venderlo en ~10 días (retira 90 días antes); si no, se pierden ₲ 11.200 (40 u. × ₲ 350 × 80 % de multa)');
 ok(/Plata en riesgo si no se hace nada: ₲ 11\.200/.test(await txt()),'muestra la plata en riesgo total');
 // venta: sale primero el lote A1 (vence antes que PRUEBA 2030)
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); const V=window.__vt.st(); const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{val:true,aid:'vk',pid:'caja',pt:'caja',n:'Kitadol Forte caja x20',q:1,pvp:20000,cost:7000,uq:20}]; window.__vt.open(); }); await p.waitForTimeout(1300);
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(400); await p.evaluate(()=>{ const i=document.querySelector('.vt-ov [data-rqn="20000"]'); i.value='1'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400); await p.evaluate(()=>{ const v=document.querySelector('[data-vok]'); if(v) v.click(); }); await p.waitForTimeout(500);
 const s2=await p.evaluate(()=>{ const V=window.__vt.st(); const sv=V.sales[V.sales.length-1]; return {lots:sv&&JSON.stringify(sv.lines[0].lots), rest:V.lotes.vk.map(q=>q.lote+':'+q.q).join()}; });
 ok(/"lote":"A1"/.test(s2.lots||'')&&/"q":20/.test(s2.lots||'')&&/A1:20/.test(s2.rest)&&/PRUEBA:200/.test(s2.rest),'la venta saca del lote que vence primero (A1) y lo guarda en la venta: '+JSON.stringify(s2));
 // canje del resto
 await p.evaluate(()=>document.querySelectorAll('.vt-ov').forEach(o=>o.remove())); await p.click('#ventas [data-vt="pnl"]'); await p.waitForTimeout(300); await p.click('#pnlMod [data-pt="venc"]'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const r=[...document.querySelectorAll('#pnlMod [data-vntb] tr')].find(t=>/A1/.test(t.innerText)); r.querySelector('[data-vn="cj"]').click(); }); await p.waitForTimeout(300); await mf({q:'20'});
 const s3=await p.evaluate(()=>{ const V=window.__vt.st(); const c=V.canjes[0]; return {c:c&&[c.q,c.pag,c.rec,c.multa].join(), stk:V.stk.vk-(V.sold.vk||0), cj:(document.querySelector('#pnlMod [data-vncj]')||{}).innerText||''}; });
 ok(s3.c==='20,7000,1400,5600'&&s3.stk===200&&/5\.600/.test(s3.cj),'🔁 canje de 20 u.: NC interna 7.000, NC legal 1.400, multa 5.600; sale del stock: '+JSON.stringify(s3).slice(0,120));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
