// v1253 · el botón de turno cambia también el «Turno base» · tarjeta «Hora para descontar» = salario ÷ 240
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>{ const P=window.__pla.st(); const E=P.emps[3]; P.cur.emp=E.id; P.cur.mon='2026-06'; delete E.aud; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1500); await p.evaluate(()=>document.querySelectorAll('.ico-ov,.k-party').forEach(x=>x.remove()));
 await p.evaluate(()=>document.querySelector('#planilla [data-plg="ficha"]').click()); await p.waitForTimeout(800);
 const a=await p.evaluate(()=>document.getElementById('pfT')&&document.getElementById('pfT').selectedOptions[0].textContent);
 await p.evaluate(()=>document.querySelector('[data-ctp="tn"]').click()); await p.waitForTimeout(300);
 const b2=await p.evaluate(()=>({sel:document.getElementById('pfT').selectedOptions[0].textContent, e:document.getElementById('pfXe').value, s:document.getElementById('pfXs').value}));
 ok(/Tarde-noche/.test(b2.sel)&&b2.e==='15:00'&&b2.s==='23:00','tocar Tarde-noche cambia el Turno base: '+a+' → '+b2.sel);
 await p.evaluate(()=>document.querySelectorAll('.ico-ov').forEach(x=>x.remove()));
 await p.evaluate(()=>{const c=document.querySelector('#planilla [data-plcalc]'); c&&c.click();}); await p.waitForTimeout(800);
 const hc=await p.evaluate(()=>{ const t=[...document.querySelectorAll('span')].find(x=>/Hora para descontar/.test(x.textContent)); return t?t.textContent:'NO'; }); ok(/30 ÷ 8/.test(hc)&&/12\.683/.test(hc),'calculadora: hora para descontar = salario ÷ 30 ÷ 8 ('+hc+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
