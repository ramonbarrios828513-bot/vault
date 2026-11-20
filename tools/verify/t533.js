// v1294 · cobro: no se puede repetir Efectivo (u otra forma) en dos renglones; el vuelto aparece al escribir los billetes y hay ayuda de cómo hacerlo
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.stock={GS:{10000:5,5000:5,2000:5,1000:5,500:5,100:10},BRL:{},USD:{}}; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:94300,uq:1}]; window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 const hint=await p.evaluate(()=>document.querySelector('.vt-ov [data-vub]').textContent); ok(/Cuando lo que da el cliente pase el total/.test(hint),'explica cómo sale el vuelto');
 await p.click('.vt-ov [data-vp="addp"]'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const sel=[...document.querySelectorAll('.vt-ov [data-pf]')].find(s=>s.value!=='ef'); sel.value='ef'; sel.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(300);
 const n=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-pf]')].map(s=>s.value)); ok(n.filter(x=>x==='ef').length===1,'Efectivo no se repite: '+n);
 await p.evaluate(()=>{ const i=document.querySelector('.vt-ov [data-rqn="100000"]'); i.focus(); }); await p.keyboard.type('1'); await p.waitForTimeout(200);
 const v=await p.evaluate(()=>document.querySelector('.vt-ov [data-vub]').textContent); ok(/vuelto ₲ 5\.700/.test(v)&&/justo/.test(v),'1 × ₲ 100.000 → vuelto ₲ 5.700 con billetes: '+v.slice(0,90));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
