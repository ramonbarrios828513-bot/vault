// v1250 · 🎌 feriado con desplegable: asistió y cobra aparte / asistió sin pago / no asistió y se descuenta / no asistió y no se descuenta
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>{ const P=window.__pla.st(); const E=P.emps[3]; P.cur.emp=E.id; P.cur.mon='2026-06'; delete E.aud; E.days['2026-06']={}; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1500); await p.evaluate(()=>document.querySelectorAll('.ico-ov,.k-party').forEach(x=>x.remove()));
 ok(await p.evaluate(()=>document.querySelectorAll('#planilla .pl-fsel').length>=28),'cada día tiene el desplegable de feriado');
 const pick=async(v)=>{ await p.evaluate((v)=>{ const s=document.querySelector('#planilla .pl-fsel[data-plf="22"]'); s.value=v; s.dispatchEvent(new Event('change',{bubbles:true})); },v); await p.waitForTimeout(700); return p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps.find(x=>x.id===P.cur.emp), X=(E.days['2026-06']||{})['22']||{}, r=document.querySelector('#planilla .pl-r[data-d="22"]'); return {f:!!X.f, fsel:X.fsel, st:r.dataset.st, shown:r.querySelector('.pl-fsel').value}; }); };
 let r=await pick('fp'); console.log('   fp '+JSON.stringify(r)); ok(r.f && r.st==='trab' && r.shown==='fp','asistió · cobra aparte');
 r=await pick('fs'); console.log('   fs '+JSON.stringify(r)); ok(!r.f && r.st==='trab' && r.shown==='fs','asistió · sin pago extra');
 r=await pick('fd'); console.log('   fd '+JSON.stringify(r)); ok(!r.f && r.st==='falta' && r.shown==='fd','no asistió · se descuenta');
 r=await pick('fl'); console.log('   fl '+JSON.stringify(r)); ok(!r.f && r.st!=='falta' && r.shown==='fl','no asistió · no se descuenta');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
