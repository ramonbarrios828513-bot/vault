const setup=require("./rvlib.js");
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>{ window.__vt.open(); }); await p.waitForTimeout(300);
 await p.evaluate(async()=>{ const wb=await (await fetch('/mig.json')).json(); window.__fichas.mig(wb); }); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const g=document.querySelector('[data-impgo]'); g&&g.click(); }); await p.waitForTimeout(20000);
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(o=>o.remove()); const v=document.getElementById('ventas'); if(v) v.hidden=true; window.__ar.open(); }); await p.waitForTimeout(2500);
 await p.evaluate(async()=>{ const b=[...document.querySelectorAll('#articulos .cp-b')].find(x=>/PREPARAR ORDEN/.test(x.textContent)); b.click(); await new Promise(r=>setTimeout(r,900)); const q=document.getElementById('plQ'); q.value='policlinica sa sr'; q.dispatchEvent(new Event('input')); await new Promise(r=>setTimeout(r,300)); document.querySelector('#plL [data-plp]').click(); });
 await p.waitForTimeout(5000);
 await p.evaluate(()=>{ const b=document.querySelector('#articulos [data-ng="view"][data-v="tab3"]'); b&&b.click(); }); await p.waitForTimeout(1500);
 // v1346 · 🎛️ vista «Fila simple + cuadros flotantes»
 let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
 await p.evaluate(()=>{ const b=document.querySelector('#articulos [data-ng="view"][data-v="flt"]'); b&&b.click(); }); await p.waitForTimeout(1500);
 // v1346 · ⏎ Enter y herramientas en la vista «Fila simple + cuadros flotantes»
 const rows=await p.evaluate(()=>[...document.querySelectorAll('#articulos [data-ngfrow]')].map(x=>x.dataset.ngfrow));
 const RW=i=>'#articulos [data-ngfrow="'+rows[i]+'"]';
 for (const tb of ['data-rx','data-qcrow','data-ngtr']) { await p.click(RW(1)+' ['+tb+']'); await p.waitForTimeout(900); const o=await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.ico-ov, .qc-w, .rx-ov, [class*="rx"]')].filter(x=>x.offsetParent!==null||getComputedStyle(x).position==='fixed').pop(); return ov?(ov.className+' | '+ov.innerText.slice(0,80).replace(/\s+/g,' ')):'NADA'; }); ok(o!=='NADA','la herramienta '+tb+' se abre desde la línea ('+o.slice(0,40)+')'); await p.keyboard.press('Escape'); await p.waitForTimeout(400); await p.evaluate(()=>document.querySelectorAll('.ico-ov').forEach(x=>x.remove())); }
 await p.click(RW(1)+' [data-ngflt="neg"]'); await p.waitForTimeout(900);
 let seq=[]; for(let i=0;i<18;i++){ await p.keyboard.press('Enter'); await p.waitForTimeout(450); seq.push(await p.evaluate(()=>{ const a=document.activeElement; return (a.closest&&a.closest('.ng-fbox')?'':'OUT:')+((a.dataset||{}).k||a.dataset&&a.dataset.ngesp&&'esp'||a.tagName); })); }
 ok(!seq.some(x=>/^OUT/.test(x))&&new Set(seq).size>=8&&seq.indexOf('pvp')!==seq.lastIndexOf('pvp'),'🤝 Enter recorre todos los cuadros de la negociación y vuelve al primero, sin salir del cuadro ('+seq.slice(0,12).join('→')+')');
 await p.click('#articulos .ng-fbox [data-ngflt="suc"]'); await p.waitForTimeout(900);
 seq=[]; for(let i=0;i<18;i++){ await p.keyboard.press('Enter'); await p.waitForTimeout(450); seq.push(await p.evaluate(()=>{ const a=document.activeElement; return (a.closest&&a.closest('.ng-fbox')?'':'OUT:')+((a.dataset||{}).k||a.tagName); })); }
 ok(!seq.some(x=>/^OUT/.test(x))&&new Set(seq).size>=8,'📦 Enter recorre sucursal por sucursal (días, pide, envía) sin salir del cuadro');
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 await b.close(); console.log(fail?'fallas '+fail:'✔ t615 ok'); process.exit(fail?1:0); })();
