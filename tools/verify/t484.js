// v1261 · 🔎 Buscar mis archivos: encuentra archivos apartados en el aparato y los trae de vuelta sin borrar nada
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}});
 await p.evaluate(async()=>{ localStorage.setItem('nube-prev-le-mats', JSON.stringify([{id:'x1',title:'Contrato viejo',text:'hola',created:1},{id:'x2',title:'Notas RRHH',text:'chau',created:2}])); });
 await p.evaluate(()=>window.__ivFindFiles()); await p.waitForTimeout(600);
 const t=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); return o?o.textContent:''; });
 ok(/antes de unirse a la central/.test(t)&&/Traer 2/.test(t),'encuentra los 2 archivos apartados');
 await p.evaluate(()=>[...document.querySelectorAll('.ico-ov [data-ff="get"]')].pop().click()); await p.waitForTimeout(800);
 const r=await p.evaluate(async()=>{ const idb=window.__kv.idb(); const L=idb? await window.__kv.get('le-mats') : JSON.parse(localStorage.getItem('le-mats')||'[]'); return { ids:(L||[]).map(x=>x.id).filter(x=>/^x/.test(x)).join(','), kept:!!localStorage.getItem('nube-prev-le-mats') }; });
 ok(r.ids==='x1,x2','los archivos volvieron a la lista ('+r.ids+')');
 ok(r.kept,'lo apartado sigue guardado (no se borró nada)');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
