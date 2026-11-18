// v1258 · préstamos: fecha de inicio, fecha de cancelación y monto original (cuotas que faltan se calculan solas)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}});
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(1000);
 await p.evaluate(()=>document.querySelector('#tesoreria [data-tx2="deu"]').click()); await p.waitForTimeout(500);
 const ff=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); const set=(k,v)=>{ const e=o.querySelector('[data-k="'+k+'"]'); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); }; const h=new Date(); const fin=new Date(h.getFullYear(), h.getMonth()+12, 28).toISOString().slice(0,10);
  set('acr','Banco Prueba'); set('saldo','12.000.000'); set('cuota','1.000.000'); set('dia','10'); set('fini','2026-01-10'); set('ffin',fin); set('mori','20.000.000'); [...o.querySelectorAll('button')].find(x=>/Guardar/.test(x.textContent)).click(); return fin; }); await p.waitForTimeout(600);
 const d=await p.evaluate(()=>window.__tes.st().deu.find(x=>x.acr==='Banco Prueba'));
 ok(d&&d.fini==='2026-01-10'&&d.ffin===ff,'guarda fecha de inicio y de cancelación');
 ok(d&&+d.faltan>=12&&+d.faltan<=13,'cuotas que faltan calculadas solas ('+(d&&d.faltan)+')');
 ok(d&&+d.mori===20000000,'monto original guardado');
 await p.evaluate(()=>{ const b=document.createElement('button'); b.dataset.tes='tab'; b.dataset.v='deu'; document.getElementById('tesoreria').appendChild(b); b.click(); }); await p.waitForTimeout(400); const txt=await p.evaluate(()=>{ const t=document.getElementById('tesoreria').textContent; const i=t.indexOf('Banco Prueba'); return t.slice(i,i+400); }); ok(/Faltan 1[23] cuotas × 1\.000\.000 = 1[23]\.000\.000 hasta \d\d\/20\d\d/.test(txt),'la lista muestra cuánto falta pagar y hasta qué mes/año ('+txt.slice(0,160)+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
