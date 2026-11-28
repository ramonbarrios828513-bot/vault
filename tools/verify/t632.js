// v1356 · orden de compra: al abrir/cerrar Solicitud o Negociación la fila queda en el mismo lugar; el cuadro entra entero en la pantalla
const setup=require("./rvlib.js");
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:640}}); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
 await p.evaluate(()=>{ window.__vt.open(); }); await p.waitForTimeout(300);
 await p.evaluate(async()=>{ const wb=await (await fetch('/mig.json')).json(); window.__fichas.mig(wb); }); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const g=document.querySelector('[data-impgo]'); g&&g.click(); }); await p.waitForTimeout(20000);
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(o=>o.remove()); const v=document.getElementById('ventas'); if(v) v.hidden=true; window.__ar.open(); }); await p.waitForTimeout(2500);
 await p.evaluate(async()=>{ const b=[...document.querySelectorAll('#articulos .cp-b')].find(x=>/PREPARAR ORDEN/.test(x.textContent)); b.click(); await new Promise(r=>setTimeout(r,900)); const q=document.getElementById('plQ'); q.value='policlinica sa sr'; q.dispatchEvent(new Event('input')); await new Promise(r=>setTimeout(r,300)); document.querySelector('#plL [data-plp]').click(); });
 await p.waitForTimeout(5000);
 await p.evaluate(()=>{ const b=document.querySelector('#articulos [data-ng="view"][data-v="flt"]'); b&&b.click(); }); await p.waitForTimeout(1500);
 const rows=await p.evaluate(()=>[...document.querySelectorAll('#articulos [data-ngfrow]')].map(x=>x.dataset.ngfrow));
 const RW=i=>'#articulos [data-ngfrow="'+rows[i]+'"]';
 for (const k of ['neg','suc']) {
  await p.evaluate(s=>document.querySelector(s).scrollIntoView({block:'center'}),RW(20)); await p.waitForTimeout(400);
  const y0=await p.evaluate(s=>Math.round(document.querySelector(s).getBoundingClientRect().top),RW(20));
  await p.click(RW(20)+' [data-ngflt="'+k+'"]'); await p.waitForTimeout(900);
  const fit=await p.evaluate(()=>{ const b=document.querySelector('#articulos .ng-fbox'); const r=b.getBoundingClientRect(); return {h:Math.round(r.height), vh:innerHeight, z:b.style.zoom||'1', sh:b.scrollHeight, ch:b.clientHeight}; });
  if(k==='neg') ok(fit.sh<=fit.ch+2 && fit.h<=fit.vh,'🤝 Negociación entra entera en la pantalla '+JSON.stringify(fit));
  await p.keyboard.press('Escape'); await p.waitForTimeout(700);
  const y1=await p.evaluate(s=>Math.round(document.querySelector(s).getBoundingClientRect().top),RW(20));
  ok(Math.abs(y1-y0)<=6,'al cerrar '+k+' la fila queda en su lugar ('+y0+' → '+y1+')');
 }
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 await b.close(); if(fail){ console.log('✘ t632 con fallas'); process.exit(1);} })();
