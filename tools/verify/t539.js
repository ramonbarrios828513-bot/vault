// v1300 · matriz de escenarios: un producto (PVP 100.000, costo 35.000) cobrado con cada forma de pago y cada tipo de cliente, días de promo (Itaú crédito, QR por convenio), cumpleaños y pago combinado (siempre el menor descuento y se cobra primero esa forma)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const esc=async(cfg)=>p.evaluate(async(cfg)=>{ document.querySelectorAll('.ico-ov').forEach(o=>o.remove()); window.__vt.open(); const V=window.__vt.st(); V.open=true;
   V.pr.promos=(V.pr.promos||[]).map(x=>Object.assign(x,{on:false})).filter(x=>!x.t539); (cfg.promos||[]).forEach(pr=>V.pr.promos.push(Object.assign({t539:1,on:true,dias:[0,1,2,3,4,5,6],todos:false},pr)));
   V.clients=(V.clients||[]).filter(c=>!c.t539); let cid=''; if(cfg.cli){ const hoy=new Date(); const c={id:'c539',t539:1,n:'Cliente 539',ci:'539',tel:'0981',cat:'cd',tjs:[]}; if(cfg.cumple) c.cum='1980-'+String(hoy.getMonth()+1).padStart(2,'0')+'-'+String(hoy.getDate()).padStart(2,'0'); V.clients.push(c); cid=c.id; }
   const t=V.tabs[0]; V.cur=t.id; t.cid=cid; t.cli=cid?'Cliente 539':''; t.cat=cid?'cd':'sd'; t.bk='Itaú'; t.fp='ef'; t.lines=[{aid:'m1',n:'Producto 100.000',q:1,pvp:100000,cost:35000,uq:1}]; window.__vt.open();
   document.querySelector('#ventas [data-vt="cobrar"]').click(); await new Promise(r=>setTimeout(r,250));
   const R={}; document.querySelectorAll('.vt-ov [data-vp="fpx"]').forEach(b=>{ R[b.dataset.fp]=+b.querySelector('b').textContent.replace(/\D/g,''); });
   let mix=null; if(cfg.mix){ document.querySelector('.vt-ov [data-vp="addp"]').click(); await new Promise(r=>setTimeout(r,200)); const sel=[...document.querySelectorAll('.vt-ov [data-pf]')].find(s=>s.value!=='ef'); sel.value=cfg.mix; sel.dispatchEvent(new Event('change',{bubbles:true})); await new Promise(r=>setTimeout(r,200)); const pb=document.querySelector('.vt-ov [data-pb]'); if(pb){ pb.value='Itaú'; pb.dispatchEvent(new Event('change',{bubbles:true})); await new Promise(r=>setTimeout(r,200)); } mix={tot:+document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,''), first:document.querySelector('.vt-ov [data-pf="0"]').value}; }
   return {R,mix}; },cfg);
 const L=[]; const row=(n,r)=>{ L.push(n.padEnd(42)+' ef '+r.R.ef+' · déb '+r.R.td+' · créd '+r.R.tc+' · QR '+r.R.qr+' · transf '+r.R.tr+' · PIX '+r.R.tb+(r.mix?' · COMBINADO '+r.mix.tot+' (1º '+r.mix.first+')':'')); };
 let a=await esc({}); row('Sin datos',a); ok(a.R.ef===90000&&a.R.tc>a.R.ef,'sin datos: 50 % del descuento (efectivo 90.000)');
 let r=await esc({cli:1}); row('Registrado',r); ok(r.R.ef===80000&&r.R.td===82000&&r.R.tc===83000&&r.R.qr===82000&&r.R.tr===80000&&r.R.tb===80000,'registrado: ef 20 %, débito 18, crédito 17, QR 18, transferencia y PIX 20');
 let c=await esc({cli:1,cumple:1}); row('Registrado + cumpleaños',c); ok(c.R.ef===70000&&c.R.tc===73000,'cumpleaños +10: ef 30 %, crédito 27');
 let i=await esc({cli:1,promos:[{fp:'tc',bk:'Itaú',pct:30}]}); row('Día Itaú crédito 30 %',i); ok(i.R.tc===70000&&i.R.ef===80000,'día Itaú crédito 30 %: crédito Itaú 70.000 (mejor que efectivo)');
 let q=await esc({cli:1,promos:[{fp:'qr',bk:'',pct:25}]}); row('Día QR por convenio 25 %',q); ok(q.R.qr===75000&&q.R.ef===80000,'día QR convenio 25 %: QR 75.000');
 let m1=await esc({cli:1,mix:'tc'}); row('Combinado ef + crédito (día normal)',m1); ok(m1.mix&&m1.mix.tot===83000&&m1.mix.first==='tc','combinado día normal: vale el menor (crédito 17 % → 83.000) y se cobra primero la tarjeta');
 let m2=await esc({cli:1,promos:[{fp:'tc',bk:'Itaú',pct:30}],mix:'tc'}); row('Combinado ef + crédito Itaú (día promo)',m2); ok(m2.mix&&m2.mix.tot===80000&&m2.mix.first==='ef','combinado día Itaú: vale el menor (efectivo 20 % → 80.000) y se cobra primero el efectivo');
 console.log('\n'+L.join('\n'));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
