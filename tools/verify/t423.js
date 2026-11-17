// v1236 · ⬅➡⬆⬇ flechas en la vista de 2 filas: derecha/izquierda dentro del producto, abajo/arriba al campo de abajo/arriba
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos .cp-b.g'); await p.waitForTimeout(300); await p.fill('#plQ','distrimed'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200); await p.click('#articulos [data-ng="view"][data-v="tab2"]').catch(()=>{}); await p.waitForTimeout(500);
 const r='#articulos [data-ngrowid="demo23"]', who=()=>p.evaluate(()=>{ const a=document.activeElement; const w=a.closest('[data-ngrowid]'); return (a.dataset.k||'?')+'|'+(w?w.dataset.ngrowid:''); });
 await p.evaluate(r=>{ const e=document.querySelector(r+' [data-k="q"]'); e.focus(); e.select(); },r);
 await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150); const a1=await who(); ok(a1==='pvp|demo23','→ de CANTIDAD va a PVP ('+a1+')');
 await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(150); const a2=await who(); ok(a2==='q|demo23','← vuelve a CANTIDAD ('+a2+')');
 await p.keyboard.press('ArrowDown'); await p.waitForTimeout(150); const a3=await who(); ok(/\|demo23$/.test(a3) && !/^q\|/.test(a3),'↓ baja al campo de abajo del mismo producto ('+a3+')');
 await p.keyboard.press('ArrowUp'); await p.waitForTimeout(150); const a4=await who(); ok(a4==='q|demo23','↑ vuelve a CANTIDAD ('+a4+')');
 for(let i=0;i<6;i++){ await p.keyboard.press('ArrowDown'); await p.waitForTimeout(120); } const a5=await who(); ok(!/\|demo23$/.test(a5),'↓ varias veces pasa al producto de abajo ('+a5+')');
 await p.evaluate(r=>{ const e=document.querySelector(r+' [data-k="q"]'); e.focus(); e.select(); },r); const seen=new Set(); for(let i=0;i<40;i++){ await p.keyboard.press('ArrowRight'); await p.waitForTimeout(60); seen.add(await p.evaluate(()=>document.activeElement.dataset.k||'')); }
 console.log('   recorrió: '+[...seen].join(' ')); ok([...seen].some(k=>/^qs:/.test(k)) && seen.has('d1') && seen.has('cd'),'→ recorre TODO el producto de izquierda a derecha sin trabarse (hasta las sucursales)');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
