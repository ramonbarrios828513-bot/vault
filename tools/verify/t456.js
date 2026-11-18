// v1254 · 🚫 desvincular / ↩️ reactivar empresas y cuentas en Mis empresas (sin borrar historial)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1100,height:900}}); p.on('dialog',d=>d.accept()); await p.evaluate(()=>{ window.confirm=()=>true; });
 await p.evaluate(()=>{ const T=window.__tes.st(), c=T.cfg; c.emp={nom:'Nissifarma',ruc:'1234567',dv:'1'}; c.emp2={nom:'KM 11',ruc:'7654321',dv:'5'}; T.sal.push({cta:'Basa-G',f:'2026-11-17',m:1000}); T.sal.push({cta:'Ueno',f:'2026-11-17',m:1000}); c.ctaEmp={'Ueno':'1234567-1'}; });
 await p.evaluate(()=>window.__fcEmp.edit('e1')); await p.waitForTimeout(500);
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); const lab=[...o.querySelectorAll('[data-pkl="off"]')]; lab[1].click(); }); 
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); [...o.querySelectorAll('button')].find(x=>/Guardar/.test(x.textContent)).click(); }); await p.waitForTimeout(800);
 const a=await p.evaluate(()=>({off:window.__tes.st().cfg.ctaOff, ctas:(function(){try{return tesCuentas()}catch(e){return 'x'}})()}));
 await p.click('[data-fe="baja"][data-k="e2"]'); await p.waitForTimeout(600);
 const t=await p.evaluate(()=>document.getElementById('fcEmpOv').innerText.replace(/\s+/g,' '));
 await p.screenshot({path:'/tmp/claude-0/s131/baja.png'});
 const e2=await p.evaluate(()=>window.__tes.st().cfg.emp2);
 await p.click('[data-fe="alta"][data-k="e2"]'); await p.waitForTimeout(600);
 await p.click('[data-fe="ctaon"]'); await p.waitForTimeout(600);
 const z=await p.evaluate(()=>({e2:window.__tes.st().cfg.emp2, off:window.__tes.st().cfg.ctaOff}));
 ok(a.off&&a.off.Ueno,'cuenta «ya no existe» queda desvinculada'); ok(e2.baja&&/KM 11/.test(t)&&/Reactivar/.test(t),'empresa desvinculada aparece en Desvinculadas'); ok(z.e2&&!z.e2.baja&&z.e2.ruc==='7654321','reactivar sin perder datos'); ok(z.off&&!z.off.Ueno,'reactivar la cuenta');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
