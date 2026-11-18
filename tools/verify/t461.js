// v1258 · Vigilante: un feriado trabajado (con horas) ya NO dice «no se paga como feriado» (sí se paga); sin aviso falso
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}, pla:true});
 const r=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; E.days['2026-06']=Object.assign({},E.days['2026-06']||{}, {'12':{e:'15:00',s:'23:00'}, '22':{e:'15:00',s:'23:00',fsel:'fs'}});
  window.__vg.scan(); const L=window.__vg.list().map(x=>JSON.stringify(x)); return L.filter(t=>/feriado/.test(t)); });
 ok(!r.some(t=>/día 12:.*NO se paga/.test(t)),'día 12 con horas: sin aviso falso');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
