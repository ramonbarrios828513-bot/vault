// v1274 · en el celular, tocar «📂 Abrir mis archivos» abre la lista (el toque directo llega como clic del sistema)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({ctx:{hasTouch:true,isMobile:true}}); await p.evaluate(()=>{ try{ document.querySelectorAll('.big-ov:not([hidden])').forEach(x=>{ if(x.id!=='home') x.hidden=true; }); }catch(e){} });
 await p.evaluate(()=>{ window.__hmFiles=true; });
 await p.evaluate(()=>document.getElementById('btnLockNow').click()); await p.waitForTimeout(1200);
 await p.tap('#heroPass'); await p.keyboard.type('1234'); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov:not([hidden])').forEach(x=>{ if(x.id!=='home') x.hidden=true; }); }); await p.waitForTimeout(300);
 const has=await p.evaluate(()=>{ const x=document.querySelector('[data-hmfiles]'); if(x) x.scrollIntoView({block:'center'}); return !!x; }); ok(has,'al entrar está el botón 📂 Abrir mis archivos (lista cerrada)');
 await p.waitForTimeout(300); await p.tap('[data-hmfiles]'); await p.waitForTimeout(800);
 const r=await p.evaluate(()=>({ f:window.__hmFiles, btn:!!document.querySelector('[data-hmfiles]') }));
 ok(r.f===true&&!r.btn,'con el dedo abre la lista de archivos '+JSON.stringify(r));
 // Biblioteca → «⬅ Volver al inicio» con el dedo
 await p.evaluate(()=>{ const x=document.querySelector('[data-htab="lib"]'); if(x) x.scrollIntoView({block:'center'}); }); await p.waitForTimeout(200); await p.tap('[data-htab="lib"]'); await p.waitForTimeout(600);
 const inLib=await p.evaluate(()=>!!document.querySelector('.hm-libback')); ok(inLib,'en 📚 Biblioteca está «⬅ Volver al inicio»');
 await p.evaluate(()=>{ const x=document.querySelector('.hm-libback'); if(x) x.scrollIntoView({block:'center'}); }); await p.waitForTimeout(200); const bb=await p.evaluate(()=>{ const r=document.querySelector('.hm-libback').getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; }); await p.touchscreen.tap(bb[0],bb[1]); await p.waitForTimeout(700);
 const back=await p.evaluate(()=>!document.querySelector('.hm-libback')); ok(back,'con el dedo «⬅ Volver al inicio» vuelve al inicio');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
