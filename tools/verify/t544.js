// v1305 · 🧭 Paneles de la caja: franja chica con objetivo (sucursal y vendedor) en ₲ y %, caída en negativo, gráfico día por día, clientes mensuales con alarma, clientes que no vuelven, fotos
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); });
 await p.click('#ventas [data-vt="tdemo"]').catch(()=>{}); await p.waitForTimeout(600);
 // metas y datos
 await p.evaluate(()=>{ const V=window.__vt.st(); V.obj={suc:'KM 7 Central',dia:1000000,vend:[{n:'Ana',meta:500000},{n:'Beto',meta:400000}],prod:{},nv:30,av:3};
   V.arts.vk={id:'vk',va:1,n:'Kitadol Forte caja x20',u:20,bar:['7840199086491'],pvp:20000,costo:7000,cod:'1',frac:false,neg:'pvp'};
   V.obj.prod['1']=30; const c=V.clients.find(x=>x.id==='cdemo0'); c.demo=0; c.tel='0981123456'; const c2=V.clients.find(x=>x.id==='cdemo1'); c2.demo=0;
   const D=864e5, now=Date.now(); V.hist=V.hist||[];
   V.hist.push({t:now-D,sales:[{t:now-40*D,cid:'cdemo1',total:50000,vend:'Ana',lines:[]}]});
   // cliente que compra Kitadol cada 30 días → sugerido y alarma
   [89,59,29].forEach(d=>V.hist[V.hist.length-1].sales.push({t:now-d*D,cid:'cdemo0',total:20000,vend:'Beto',lines:[{aid:'vk',q:1,uq:1}]}));
   V.open=true; V.stock={GS:{50000:5,20000:5,10000:5,5000:5,2000:5,1000:5},BRL:{},USD:{}}; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.cid=''; t.fp='ef'; t.lines=[{aid:'vk',n:'Kitadol Forte caja x20',q:5,pvp:20000,cost:7000,uq:1,pid:'caja'}]; window.__vt.open(); });
 await p.waitForTimeout(300);
 const st0=await p.evaluate(()=>document.querySelector('#ventas .pn-strip').innerText.replace(/\s+/g,' '));
 ok(/KM 7 Central hoy 0%/.test(st0)&&/−₲ 1\.000\.000/.test(st0),'franja: sucursal 0 % y falta −₲ 1.000.000: '+st0);
 await p.evaluate(()=>{ const s=document.querySelector('#ventas [data-pnv]'); s.value='Ana'; s.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(300);
 // cobrar en efectivo
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="rq"][data-d="50000"]'); await p.waitForTimeout(150); await p.click('.vt-ov [data-vp="rq"][data-d="50000"]'); await p.waitForTimeout(200);
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(300); await p.evaluate(()=>{ const v=document.querySelector('[data-vok]'); if(v) v.click(); }); await p.waitForTimeout(400);
 const s=await p.evaluate(()=>{ const V=window.__vt.st(); const x=V.sales[V.sales.length-1]; return x&&{vend:x.vend,suc:x.suc,tot:x.total}; });
 ok(s&&s.vend==='Ana'&&s.suc==='KM 7 Central'&&s.tot===90000,'la venta guarda vendedor y sucursal: '+JSON.stringify(s));
 const st1=await p.evaluate(()=>document.querySelector('#ventas .pn-strip').innerText.replace(/\s+/g,' '));
 ok(/hoy 9%/.test(st1)&&/−₲ 910\.000/.test(st1)&&/Ana 18%/.test(st1)&&/−₲ 410\.000/.test(st1),'franja en tiempo real: sucursal 9 % (−910.000), Ana 18 % (−410.000): '+st1);
 ok(!(await p.$('#pnlMod')),'el botón 🧭 Paneles no salta solo (se abre únicamente al tocarlo)');
 await p.click('#ventas [data-vt="pnl"]'); await p.waitForTimeout(300);
 const o=await p.evaluate(()=>document.getElementById('pnlMod').innerText.replace(/\s+/g,' '));
 ok(/Ana ₲ 90\.000 ₲ 500\.000 18%/.test(o)&&/Beto/.test(o),'🎯 por vendedor');
 ok(/Kitadol/.test(o)&&/−/.test(o),'🎯 producto con objetivo y caída en negativo');
 ok(await p.evaluate(()=>document.querySelectorAll('#pnlMod .pn-col').length>=28&&!!document.querySelector('#pnlMod .pn-goal')),'📊 gráfico día por día con línea de objetivo');
 await p.click('#pnlMod [data-per="mes"]'); await p.waitForTimeout(200);
 const om=await p.evaluate(()=>document.getElementById('pnlMod').innerText.replace(/\s+/g,' ')); ok(/Este mes/.test(om),'cambia a «Este mes»');
 // sugeridos y alarma mensual
 await p.click('#pnlMod [data-pt="mens"]'); await p.waitForTimeout(200);
 let m=await p.evaluate(()=>document.getElementById('pnlMod').innerText.replace(/\s+/g,' '));
 ok(/Sugeridos/.test(m)&&/3 compras/.test(m),'🧠 sugiere cliente mensual (3 compras cada ~30 días)');
 await p.click('#pnlMod [data-msug="0"]'); await p.waitForTimeout(200);
 m=await p.evaluate(()=>document.getElementById('pnlMod').innerText.replace(/\s+/g,' '));
 ok(/en 1 d|🔔 hoy/.test(m)&&!!(await p.$('#pnlMod a[href*="wa.me/595981123456"]')),'alarma: le toca en 1 día, con botón de WhatsApp: '+(m.match(/Le toca.{0,80}/)||[''])[0]);
 await p.click('#pnlMod [data-menv="0"]'); await p.waitForTimeout(200);
 m=await p.evaluate(()=>document.getElementById('pnlMod').innerText.replace(/\s+/g,' ')); ok(/en 30 d/.test(m),'✅ enviado: el próximo aviso se corre a 30 días');
 await p.click('#pnlMod [data-pt="nv"]'); await p.waitForTimeout(200);
 const nv=await p.evaluate(()=>document.getElementById('pnlMod').innerText.replace(/\s+/g,' '));
 ok(/40 días/.test(nv),'💤 no vuelve hace 40 días: '+(nv.match(/Total comprado.{0,90}/)||[''])[0]);
 await p.click('#pnlMod [data-pt="cfg"]'); await p.waitForTimeout(200);
 await p.evaluate(()=>{ const i=document.querySelector('#pnlMod [data-oc="dia"]'); i.value='2.000.000'; i.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(200);
 ok(await p.evaluate(()=>window.__vt.st().obj.dia===2000000),'⚙️ metas editables (objetivo diario 2.000.000)');
 await p.click('#pnlMod [data-x]'); await p.waitForTimeout(300);
 const st2=await p.evaluate(()=>document.querySelector('#ventas .pn-strip').innerText.replace(/\s+/g,' ')); ok(/hoy 5%/.test(st2),'la franja toma la meta nueva: '+st2);
 // foto chica en la línea
 await p.evaluate(()=>{ const V=window.__vt.st(); V.arts.vk.foto='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='; const t=V.tabs[1]; V.cur=t.id; t.lines=[{aid:'vk',n:'Kitadol',q:1,pvp:20000,uq:1,pid:'caja'}]; window.__vt.open(); }); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>!!document.querySelector('#ventas .vt-tb img.pn-th')),'📸 la foto chica se ve en la línea de venta');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
