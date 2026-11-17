// v1243 · 🧭 pasos del comprador + ⌨️ Enter y flechas en TODAS las vistas (franja, 2 filas, lineal, tabla)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const A=window.__ar.st(); A.ven=Object.assign({},A.ven,{dias:90,s:{demo23:{'KM 7':900,'KM 8':1800,'Franco':450}}}); A.stk=Object.assign({},A.stk,{s:{demo23:{'KM 7':600,'KM 8':0,'Franco':60}}}); });
 await p.click('#articulos .cp-b.o'); await p.waitForTimeout(300); await p.fill('#plQ','distrimed'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200);
 const st=await p.evaluate(()=>[...document.querySelectorAll('#articulos .ng-st')].map(x=>x.className.replace('ng-st','').trim()+':'+x.innerText.split('\n')[1]));
 console.log('   '+st.join(' | '));
 ok(st.length===6 && /ok/.test(st[0]),'🧭 barra de 6 pasos, ① Proveedor ✔');
 await p.click('#articulos [data-ngstep="next"]'); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>!!document.activeElement && !!document.activeElement.dataset.k),'«Siguiente paso» lleva el cursor al campo que falta ('+await p.evaluate(()=>document.activeElement.dataset.k)+')');
 await p.click('#articulos [data-ngstep="5"]'); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>/REVISIÓN DE LA ORDEN/.test(document.querySelector('#articulos').innerText)),'⑤ Revisar abre el resumen');
 const who=()=>p.evaluate(()=>{ const a=document.activeElement; const w=a.closest('[data-ngrowid]'); return (a.dataset.k||a.dataset.ng||a.tagName)+'|'+(w?w.dataset.ngrowid:''); });
 for (const v of ['tab3','tab2','lin','tab']) {
  await p.click('#articulos [data-ng="view"][data-v="'+v+'"]'); await p.waitForTimeout(700);
  const sel='#articulos [data-ngrowid="demo23"] [data-k="q"]';
  await p.evaluate(s=>{ const e=document.querySelector(s); e.focus(); e.select(); },sel);
  const seen=new Set(), rows=new Set(); let stuck=0, prev='';
  for(let i=0;i<45;i++){ await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40); const w=await who(); if(w===prev) stuck++; prev=w; seen.add(w.split('|')[0]); rows.add(w.split('|')[1]); }
  ok(stuck<2 && seen.size>10,'['+v+'] → recorre a la derecha sin trabarse ('+seen.size+' campos)');
  await p.evaluate(s=>{ const e=document.querySelector(s); e.focus(); e.select(); },sel);
  for(let i=0;i<5;i++){ await p.keyboard.press('ArrowRight'); await p.waitForTimeout(40); } const r5=await who();
  for(let i=0;i<5;i++){ await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(40); } const l5=await who();
  ok(l5==='q|demo23','['+v+'] ← vuelve al mismo campo ('+r5+' → '+l5+')');
  await p.evaluate(s=>{ const e=document.querySelector(s); e.focus(); e.select(); },sel);
  await p.keyboard.press('ArrowDown'); await p.waitForTimeout(80); const d1=await who(); await p.keyboard.press('ArrowUp'); await p.waitForTimeout(80); const u1=await who();
  ok(d1!=='q|demo23' && u1==='q|demo23','['+v+'] ↓ baja y ↑ vuelve ('+d1+')');
  await p.evaluate(s=>{ const e=document.querySelector(s); e.focus(); e.select(); },sel);
  await p.keyboard.press('Enter'); await p.waitForTimeout(80); const e1=await who();
  ok(e1!=='q|demo23' && !/BODY/.test(e1),'['+v+'] Enter salta al siguiente ('+e1+')');
 }
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
