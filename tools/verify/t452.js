// v1253 · planillas de asistencia para imprimir: A4 vertical, una hoja por funcionario (como el Excel)
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 const html=await p.evaluate(()=>window.__plaAsis('2026-11',3));
 ok(/size:A4 portrait/.test(html),'hoja A4 vertical');
 ok((html.match(/class="pg"/g)||[]).length===3,'una hoja por funcionario');
 ok(/PLANILLA N\.º/.test(html)&&/FIRMAS DE CIERRE/.test(html)&&/Horario<br>programado/.test(html),'trae número, horario programado y firmas');
 const q=await b.newPage(); await q.setContent(html,{waitUntil:'load'}); await q.emulateMedia({media:'print'});
 const pdf=await q.pdf({preferCSSPageSize:true,printBackground:true}); const n=(pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;
 ok(n===3,'imprime exactamente 3 páginas para 3 funcionarios ('+n+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
