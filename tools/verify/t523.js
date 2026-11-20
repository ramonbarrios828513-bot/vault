// v1284 · pago combinado: vale el descuento MENOR y se cobra PRIMERO esa forma de pago (efectivo si ese día la tarjeta tiene promo; tarjeta si la tarjeta tiene menos descuento)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const caso=async(promo)=>{ await p.evaluate((promo)=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); window.__vt.open(); const V=window.__vt.st(); V.open=true; V.pr.promos=(V.pr.promos||[]).filter(x=>!x.t523); V.pr.promos.forEach(x=>x.on=false); if(promo) V.pr.promos.push({t523:1,on:true,fp:'tc',bk:'Itaú',pct:60,dias:[0,1,2,3,4,5,6],todos:true}); const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.bk='Itaú'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:100000,uq:1,cost:30000},{aid:'m2',n:'Prueba 2',q:2,pvp:50000,uq:1,cost:45000}]; window.__vt.open(); },promo);
  await p.waitForTimeout(250); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
  await p.click('.vt-ov [data-vp="addp"]'); await p.waitForTimeout(300);
  await p.evaluate(()=>{ const sel=[...document.querySelectorAll('.vt-ov [data-pf]')].find(s=>s.value!=='ef'); if(sel.value!=='tc'){ sel.value='tc'; sel.dispatchEvent(new Event('change',{bubbles:true})); } }); await p.waitForTimeout(250);
  await p.evaluate(()=>{ const sel=[...document.querySelectorAll('.vt-ov [data-pb]')][0]; if(sel){ sel.value='Itaú'; sel.dispatchEvent(new Event('change',{bubbles:true})); } }); await p.waitForTimeout(250);
  return p.evaluate(()=>({tot:document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,'')*1, opts:[...(document.querySelector('.vt-ov .vt-mix')||{textContent:''}).textContent.matchAll(/Todo con [^₲]*₲ ([\d.]+)/g)].map(m=>+m[1].replace(/\./g,'')), first:document.querySelector('.vt-ov [data-pf="0"]').value, mix:(document.querySelector('.vt-ov .vt-mix')||{}).textContent||''})); };
 let r=await caso(false); ok(/en cascada/.test(r.mix)&&/No importa cuál va primero/.test(r.mix),'v1306: se cobra en cascada y el orden no importa: '+r.mix.slice(-160));
 r=await caso(true); ok(/Menor de hoy/.test(r.mix),'v1306: muestra el menor de hoy por producto'); ok(/Explicale al cliente/.test(r.mix)&&/más/.test(r.mix),'le explica al cliente cuánto pierde por combinar: '+r.mix.slice(0,260));
 ok(r.opts.length===2&&r.tot>=Math.max(...r.opts),'combinado: el total nunca es menor que pagar todo con la forma de menor descuento (producto por producto) '+r.tot+' vs '+r.opts.join('/'));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
