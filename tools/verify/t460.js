// v1257 · «🔎 Cheques por conciliar»: ✕ y Listo cierran sin error (antes: Cannot set properties of null 'hidden')
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}});
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(1200);
 for (const sel of ['button[data-cq="x"]:not(.ico-ok)','button.ico-ok[data-cq="x"]']) {
  await p.evaluate(()=>document.querySelector('#tesoreria [data-tx2="concq"]').click()); await p.waitForTimeout(500);
  ok(await p.evaluate(()=>/Conciliar los cheques/.test(document.body.innerText)),'se abre «Conciliar los cheques»');
  await p.evaluate((s)=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); o.querySelector(s).click(); },sel); await p.waitForTimeout(400);
  ok(await p.evaluate(()=>!/Conciliar los cheques ya debitados/.test([...document.querySelectorAll('.ico-ov')].map(x=>x.innerText).join(' '))),'cierra con '+sel);
 }
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
