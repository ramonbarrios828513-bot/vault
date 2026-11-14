// v1216 · «Cambiar contraseña» no se duplica al tocar varias veces; el nombre del aparato se escribe dentro de la ventana (sin prompt)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:412,height:900}});
 await p.evaluate(()=>{ try{ localStorage.removeItem('wk-face'); sessionStorage.removeItem('wk-face'); }catch(e){} });
 await p.reload(); await p.waitForTimeout(2500);
 for(let i=0;i<4;i++){ const bt=await p.$('.ps-rk'); if(bt){ await bt.click(); } await p.waitForTimeout(400); const pr=await p.$('[data-prof]'); if(pr){ try{ await pr.click({timeout:1000}); }catch(e){} await p.waitForTimeout(400);} }
 await p.waitForTimeout(800);
 const n=await p.evaluate(()=>({f:document.querySelectorAll('.ps-rkf').length, o:document.querySelectorAll('#rkOld').length}));
 console.log(JSON.stringify(n));
 ok(n.f<=1 && n.o<=1,'«Cambiar contraseña» aparece una sola vez');
 await p.evaluate(()=>{ document.querySelectorAll('.ps-rkf').forEach(x=>x.remove()); });
 let dlg=false; p.on('dialog',d=>{dlg=true; d.dismiss();});
 await p.evaluate(()=>window.__sv && window.__sv.panel && window.__sv.panel()); await p.waitForTimeout(600);
 await p.click('[data-devn]'); await p.waitForTimeout(300);
 ok(!dlg && !!(await p.$('#svDevIn')),'✏️ nombre abre un casillero dentro de la ventana');
 await p.fill('#svDevIn','OPPO de Ramón'); await p.click('[data-devok]'); await p.waitForTimeout(300);
 const t=await p.evaluate(()=>document.body.innerText.includes('Este aparato: OPPO de Ramón') && localStorage.getItem('sv-dev'));
 ok(t==='OPPO de Ramón','queda guardado y se ve «Este aparato: OPPO de Ramón»');
 ok(!errs.length,'sin errores: '+errs.slice(0,2).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
