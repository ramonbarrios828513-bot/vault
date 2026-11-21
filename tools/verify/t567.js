// v1313 · 📱 en el teléfono la venta no se corta a la derecha (cada producto es una tarjeta) · el stock aclara cuánto trae la caja
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; Object.keys(V.arts).forEach(k=>delete V.arts[k]); V.arts.vk={id:'vk',va:1,n:'Hidroclorotiazida 25 mg (Indufar)',pc:'CAJA · 30',u:30,bar:['7840199086491'],pvp:7500,costo:3750,cod:'1019',frac:false,neg:'pvp',prov:'Indufar'}; V.arts.vf={id:'vf',va:1,n:'Kitadol comp.',u:20,bar:['7840199086492'],pvp:20000,costo:7000,cod:'1',frac:true,neg:'pvp',prov:'Lasca'}; V.stk.vk=200; V.stk.vf=200; V.sold={}; V.tabs.forEach(t=>t.lines=[]); const t=V.tabs[0]; V.cur=t.id; t.lines=[{aid:'vk',n:V.arts.vk.n,q:1,pvp:7500,cost:3750,uq:1},{aid:'vf',n:V.arts.vf.n,q:2,pvp:20000,cost:7000,uq:1}]; window.__vt.open(); });
 await p.waitForTimeout(1300);
 const r=await p.evaluate(()=>{ const out=[]; document.querySelectorAll('#ventas .vt-sale, #ventas .vt-sale *').forEach(e=>{ const q=e.getBoundingClientRect(); if(q.width>0&&(q.right>innerWidth+2||q.left<-2)) out.push(e.tagName+' R'+Math.round(q.right)); }); const vis=s=>[...document.querySelectorAll('#ventas .vt-sale '+s)].every(e=>{ const q=e.getBoundingClientRect(); return q.width>0&&q.right<=innerWidth+1; }); return {filas:document.querySelectorAll('#ventas .vt-sale tr').length-1,out:out.slice(0,5),del:vis('[data-vt="del"]'),mas:vis('[data-vt="q"]'),sub:vis('td:nth-child(6)'),w:document.getElementById('ventas').scrollWidth,iw:innerWidth}; });
 ok(r.filas===2,'la venta tiene sus 2 productos');
 ok(r.out.length===0&&r.w<=r.iw+1,'nada queda cortado a la derecha en el teléfono: '+JSON.stringify(r));
 ok(r.del&&r.mas&&r.sub,'se ven el −/+, el subtotal y el ✕ de cada producto');
 await p.click('#ventas .vt-sale [data-vt="q"][data-i="0"][data-d="1"]'); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>window.__vt.st().tabs[0].lines[0].q)===2,'el botón + sigue sumando');
 // en pantalla ancha sigue siendo tabla
 await p.setViewportSize({width:1366,height:800}); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>getComputedStyle(document.querySelector('#ventas .vt-sale tr:nth-child(2)')).display)==='table-row','en la compu sigue siendo una tabla');
 // stock aclara cuánto trae la caja
 await p.fill('#vtQ','Kitadol'); await p.waitForTimeout(900);
 const res=await p.evaluate(()=>(document.getElementById('vtRes')||{}).innerText||'');
 ok(/200 FR \(comp\.\) = 10 CJ · cada CJ trae 20/.test(res),'el stock dice «200 FR (comp.) = 10 CJ · cada CJ trae 20»: '+res.replace(/\s+/g,' ').slice(0,160));
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
