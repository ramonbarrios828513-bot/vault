// v1259 · préstamo: con fecha de inicio y plazo total → cuotas pagadas, pendientes y saldo (cuota × pendientes); fecha de cancelación sola
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}});
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(1000);
 const exp=await p.evaluate(()=>{ const h=new Date(); const ini=new Date(h.getFullYear(), h.getMonth()-12, 5); const f=ini.toISOString().slice(0,10); document.querySelector('#tesoreria [data-tx2="deu"]').click(); return f; }); await p.waitForTimeout(500);
 await p.evaluate((f)=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); const set=(k,v)=>{ o.querySelector('[data-k="'+k+'"]').value=v; }; set('acr','Coop Prueba'); set('saldo','12.000.000'); set('cuota','1.000.000'); set('dia','5'); set('fini',f); set('ncuo','24'); [...o.querySelectorAll('button')].find(x=>/Guardar/.test(x.textContent)).click(); },exp); await p.waitForTimeout(600);
 const d=await p.evaluate(()=>window.__tes.st().deu.find(x=>x.acr==='Coop Prueba'));
 ok(d&&+d.faltan===12,'pendientes calculadas desde la fecha de inicio: 12 ('+(d&&d.faltan)+')');
 ok(d&&d.ffin&&d.ffin.slice(0,7)===(()=>{const x=new Date(exp+'T12:00'); x.setMonth(x.getMonth()+24); return x.toISOString().slice(0,7);})(),'fecha de cancelación calculada ('+(d&&d.ffin)+')');
 await p.evaluate(()=>window.__gc.open()); await p.waitForTimeout(500);
 const t=await p.evaluate(()=>document.getElementById('gcOv').innerText);
 ok(/Pagadas: 12 · Pendientes: 12/.test(t)&&/Faltan 12 cuotas = 12\.000\.000/.test(t)&&/plazo 24 cuotas/.test(t),'tarjeta: plazo, pagadas, pendientes y saldo');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
