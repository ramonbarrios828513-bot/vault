// v1250 · 📌 planilla: al cerrar o actualizar vuelve al mismo funcionario, mes y filtros (guardado en este equipo)
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 const id=await p.evaluate(()=>{ const P=window.__pla.st(); P.cur.emp=P.emps[3].id; P.cur.mon='2026-06'; return P.emps[3].id; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1200);
 // otro equipo / estado viejo pisa la selección
 await p.evaluate(()=>{ const P=window.__pla.st(); P.cur.emp=P.emps[0].id; P.cur.mon='2026-11'; window.__pla.save(); window.__vaultSaveNow(); }); await p.waitForTimeout(1200);
 await p.reload(); await p.waitForTimeout(1500); await p.click('#heroPass'); await p.keyboard.type('1234'); await p.keyboard.press('Enter'); await p.waitForTimeout(3000);
 try{await p.click('text=Ahora no',{timeout:1000});}catch(e){}
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1500);
 const c=await p.evaluate(()=>JSON.stringify(window.__pla.st().cur)); console.log('   '+c.slice(0,150));
 ok(c.indexOf(id)>=0 && /2026-06/.test(c),'al volver a entrar está el mismo funcionario y el mismo mes');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
