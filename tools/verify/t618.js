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
 // v1347 · 🎁 regla de bonificación: «1» solo NO es bonificación; 1+1 · 1+0,3 (10+3) · 1+0,5 (10+5) · «2 cj» fijas
 const rows=await p.evaluate(()=>[...document.querySelectorAll('#articulos [data-ngfrow]')].map(x=>x.dataset.ngfrow));
 await p.click('#articulos [data-ngfrow="'+rows[5]+'"] [data-ngflt="neg"]'); await p.waitForTimeout(900);
 const B='#articulos .ng-fbox', set=async(k,v)=>{ await p.fill(B+' [data-k="'+k+'"]',v); await p.dispatchEvent(B+' [data-k="'+k+'"]','change'); await p.waitForTimeout(700); };
 await set('q','10'); await set('pvp','100000'); await set('d1','30');
 const bon=async(v)=>{ await set('br',v); return await p.evaluate(b=>{ const t=document.querySelector(b).innerText; const m=t.match(/Bonificado[^\n]*\n[^\d—]*([\d.]+|—)/); return {bon:m?m[1]:'?', warn:/incompleta/.test(document.querySelector('#articulos').innerText)}; },B); };
 await p.fill(B+' [data-k="br"]',''); await p.dispatchEvent(B+' [data-k="br"]','change'); await p.waitForTimeout(600); await p.click(B+' [data-k="br"]'); await p.keyboard.type('1'); await p.waitForTimeout(600);
 const r1=await p.evaluate(()=>{ const A=window.__ar.st(), N=A.negs[A.ui.ng], id=A.ui.flt.id; return String((N.v[id]||{}).br||''); }); ok(r1==='','mientras escribís «1» (para llegar a 1+1) todavía no se aplica nada ('+JSON.stringify(r1)+')');
 await p.keyboard.type('+1'); await p.keyboard.press('Tab'); await p.waitForTimeout(700);
 const r2=await bon('1+1'); console.log('   1+1',JSON.stringify(r2)); ok(r2.bon==='10','1+1 con 10 cajas → 10 bonificadas');
 const r3=await bon('1+0,3'); console.log('   1+0,3',JSON.stringify(r3)); ok(r3.bon==='3','1+0,3 con 10 cajas → 3 bonificadas (10+3)');
 const r4=await bon('1+0,5'); ok(r4.bon==='5','1+0,5 con 10 cajas → 5 bonificadas (10+5)');
 const r5=await bon('10+3'); ok(r5.bon==='3','10+3 → 3 bonificadas');
 await set('q','100'); const r7=await bon('1+07'); ok(r7.bon==='70','1+07 con 100 cajas → 70 bonificadas (100+70)'); const r8=await bon('1+070'); ok(r8.bon==='70','1+070 con 100 cajas → 70 bonificadas'); await set('q','10');
 const r6=await bon('2'); ok(r6.bon==='2','«2» (número solo, al terminar) → 2 cajas fijas, como antes');
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 await b.close(); console.log(fail?'fallas '+fail:'✔ t618 ok'); process.exit(fail?1:0); })();
