// v1229 · ⏎ Enter salta campo por campo en TODA la tarjeta de negociación (también el último de cada bloque) y todos los campos tienen nombre
const setup=require('./rvlib.js');
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>(window.__ar.st().ui.ngOpen={cols:true,pol:true,mon:true,tools:true}, window.__ar.open())); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos [data-ar="tab"][data-v="neg"]'); await p.waitForTimeout(300); await p.click('#articulos [data-ng="calc"]'); await p.waitForTimeout(300);
 await p.fill('#articulos [data-ngadd]','ibu'); await p.press('#articulos [data-ngadd]','Enter'); await p.waitForTimeout(400);
 await p.fill('#articulos [data-ngadd]','met'); await p.press('#articulos [data-ngadd]','Enter'); await p.waitForTimeout(400);
 const sel=process.env.SEL||'#articulos .ng-card input:not([type=checkbox]), #articulos .ng-card select'; if(process.env.QC){ await p.click('#qcFab'); await p.waitForTimeout(300); await p.fill('#qcQ','met'); await p.press('#qcQ','Enter'); await p.waitForTimeout(300); }
 const n=await p.evaluate(s=>document.querySelectorAll(s).length,sel); const bad=[], nolab=[];
 for(let i=0;i<n;i++){ const info=await p.evaluate(([s,i])=>{ const el=document.querySelectorAll(s)[i]; el.focus(); const lb=el.closest('label'); const txt=lb?[...lb.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent).join('').trim():''; return {k:(el.dataset.k||el.dataset.qv||el.dataset.ngh||'')+'|'+(el.dataset.ngv||el.dataset.ngl||''), lab:txt}; },[sel,i]);
  if(!info.lab) nolab.push(info.k);
  await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  const nk=await p.evaluate(()=>{ const a=document.activeElement; return a?(a.dataset.k||a.dataset.qv||a.dataset.ngh||a.tagName)+'|'+(a.dataset.ngv||a.dataset.ngl||''):''; });
  if(nk===info.k && i<n-1) bad.push(info.k+' ('+info.lab+')'); }
 const vi=await p.$('#articulos .ng-card [data-k="venc"]'); await vi.fill('10112027'); await vi.press('Tab'); await p.waitForTimeout(250); const vv=await vi.inputValue(); if(vv!=='10/11/2027') bad.push('venc '+vv); else console.log('✔ vencimiento 10112027 → 10/11/2027'); if(!(await p.$('#articulos [data-ngcal]'))) bad.push('sin 📅'); else console.log('✔ tiene botón 📅 calendario');
 console.log('campos',n); if(bad.length||nolab.length||errs.length){ console.log('✘ FALLA Enter/nombres'); } else console.log('✔ Enter salta en los '+n+' campos de la orden y todos tienen nombre'); console.log('Enter NO salta:',bad.join(' ; ')||'ninguno'); console.log('sin nombre:',nolab.join(' ; ')||'ninguno');
 console.log(errs.slice(0,3)); await b.close(); process.exit(bad.length||nolab.length||errs.length?1:0); })();
