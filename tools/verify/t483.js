// v1261 · 🔒 si cambiaste días y no tocaste «Aplicar y guardar firme», al salir avisa y no deja salir sin elegir
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>{ window.__svStrict=true; const P=window.__pla.st(); P.cur.emp=P.emps[3].id; P.cur.mon='2026-11'; window.__pla.open(); }); await p.waitForTimeout(1200); await p.evaluate(()=>document.querySelectorAll('.k-party,.ico-ov').forEach(x=>x.remove()));
 const inp=p.locator('#planilla .pl-r[data-d="3"] input[data-k="e"]'); await inp.fill('15:10'); await inp.press('Tab'); await p.waitForTimeout(600); console.log('pend', await p.evaluate(()=>JSON.stringify(window.__plFirmPend())));
 const bx=await p.$('#planilla [data-pl="x"]'); ok(!!bx,'hay botón para salir de la planilla'); await bx.click(); await p.waitForTimeout(600);
 const t=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); return { txt:o?o.textContent:'', open:!document.getElementById('planilla').hidden }; });
 ok(/Falta «🔒 Aplicar y guardar firme»/.test(t.txt)&&t.open,'avisa que falta guardar firme y NO sale');
 await p.click('.ico-ov [data-fq="seal"]'); await p.waitForTimeout(900);
 const r=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3], s=window.__plSeal.last(E,'2026-11'); return { s:!!s, hid:document.getElementById('planilla').hidden, d:((E.days['2026-11']||{})['3']||{}).e }; });
 ok(r.s&&r.d==='15:10','al elegir «Aplicar y guardar firme» queda guardado firme ('+JSON.stringify(r)+')');
 ok(r.hid,'y después sale como pediste');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
