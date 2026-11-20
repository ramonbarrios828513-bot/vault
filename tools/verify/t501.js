// v1269 · Cobrar ágil: billetes a un toque, si ya cubrió no deja agregar otra forma de pago, vuelto sugerido con el stock de la caja y 🗑 para no dar un billete
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const W=+(process.env.W||1366); const {b,p,errs}=await setup({vp:{width:W,height:W>1000?768:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.stock={GS:{20000:5,2000:5,5000:10,1000:10},BRL:{},USD:{}}; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:56000,uq:1}]; window.__vt.open(); });
 await p.waitForTimeout(400);
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 const chips=await p.evaluate(()=>document.querySelectorAll('.vt-ov [data-vp="rq"]').length); ok(chips>=6,'los billetes ya están listos en la ventana de cobro ('+chips+')');
 // agrega una forma de pago antes (como en la foto)
 await p.click('.vt-ov [data-vp="rq"][data-d="100000"]'); await p.waitForTimeout(300);
 const s1=await p.evaluate(()=>({ lines:document.querySelectorAll('.vt-ov .vt-pl select[data-pf]').length, addp:!!document.querySelector('.vt-ov [data-vp="addp"]'), rows:[...document.querySelectorAll('.vt-ov [data-vo]')].filter(i=>+i.value>0).sort((a,b)=>+b.dataset.vo-+a.dataset.vo).map(i=>i.value+'x'+i.dataset.vo) }));
 ok(s1.lines===1 && !s1.addp,'con ₲ 100.000 ya cubre: se saca la otra forma de pago y no deja agregar '+JSON.stringify(s1));
 ok(JSON.stringify(s1.rows)===JSON.stringify(['2x20000','2x2000']),'vuelto ₲ 44.000 sugerido: 2 de 20.000 + 2 de 2.000 '+JSON.stringify(s1.rows));
 await p.screenshot({path:'/tmp/claude-0/t501a.png'});
 await p.click('.vt-ov [data-vom="20000"]'); await p.waitForTimeout(200); await p.click('.vt-ov [data-vom="20000"]'); await p.waitForTimeout(300);
 const s2=await p.evaluate(()=>({ rows:[...document.querySelectorAll('.vt-ov [data-vo]')].filter(i=>+i.value>0).sort((a,b)=>+b.dataset.vo-+a.dataset.vo).map(i=>i.value+'x'+i.dataset.vo) }));
 ok(JSON.stringify(s2.rows)===JSON.stringify(['8x5000','2x2000']),'sin los de 20.000 se rearma con 5.000 y 2.000 '+JSON.stringify(s2.rows));
 await p.screenshot({path:'/tmp/claude-0/t501b.png'});
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(300); await p.evaluate(()=>{ const v=document.querySelector('[data-vok]'); if(v) v.click(); }); await p.waitForTimeout(400);
 const st=await p.evaluate(()=>window.__vt.st().stock.GS); ok(st[100000]===1&&st[5000]===2&&st[2000]===3&&st[20000]===5,'al confirmar, entra el de 100.000 y salen los billetes del vuelto '+JSON.stringify(st));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
