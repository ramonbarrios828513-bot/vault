// v1266 · después de 🔒 bloquear y volver a entrar, el inicio empieza con «Mis archivos» cerrado
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup(); await p.evaluate(()=>{ try{ document.querySelectorAll('.big-ov:not([hidden])').forEach(x=>{ if(x.id!=='home') x.hidden=true; }); }catch(e){} });
 await p.evaluate(()=>{ window.__hmFiles=true; }); 
 await p.evaluate(()=>document.getElementById('btnLockNow').click()); await p.waitForTimeout(1200);
 await p.click('#heroPass'); await p.keyboard.type('1234'); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>({ f:window.__hmFiles, fonly:document.body.classList.contains('hm-fonly') }));
 ok(r.f===false && !r.fonly,'al volver a entrar la lista de archivos está cerrada ('+JSON.stringify(r)+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
