// v1229 · cada producto de la negociación es AUTÓNOMO: su propia escala, sus propias herramientas, sus propios descuentos
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos [data-ar="tab"][data-v="neg"]'); await p.waitForTimeout(300); await p.click('#articulos [data-ng="new"]'); await p.waitForTimeout(300);
 for(const w of ['omep','metf']){ await p.fill('#articulos [data-ngadd]',w); await p.press('#articulos [data-ngadd]','Enter'); await p.waitForTimeout(400); }
 const ids=await p.evaluate(()=>[...document.querySelectorAll('#articulos .ng-card')].map(c=>c.dataset.ngcard));
 const has=(id,k)=>p.evaluate(([id,k])=>!!document.querySelector(`#articulos [data-ngv="${id}"][data-k="${k}"]`),[id,k]);
 ok(!(await has(ids[0],'esc.0.d')) && !(await has(ids[1],'esc.0.d')),'al empezar ninguno tiene escala (herramienta apagada)');
 await p.click(`#articulos [data-ngrow="${ids[0]}"][data-t="esc"]`); await p.waitForTimeout(400);
 ok(await has(ids[0],'esc.0.d') && !(await has(ids[1],'esc.0.d')),'activo la escala SOLO en el producto 1: el producto 2 no la tiene');
 await p.click(`#articulos [data-ngrow="${ids[1]}"][data-t="bon"]`); await p.waitForTimeout(400);
 ok(await has(ids[1],'br') && !(await has(ids[0],'br')),'activo bonificación SOLO en el producto 2');
 await p.click(`#articulos [data-ngrow="${ids[0]}"][data-t="cas"]`); await p.waitForTimeout(300); await p.click(`#articulos [data-ngrow="${ids[1]}"][data-t="cas"]`); await p.waitForTimeout(300);
 const f=async(id,k,v)=>{ const s=`#articulos [data-ngv="${id}"][data-k="${k}"]`; await p.fill(s,v); await p.press(s,'Tab'); await p.waitForTimeout(200); };
 await f(ids[0],'esc.0.d','100'); await f(ids[0],'esc.0.p','20'); await f(ids[0],'d1','30'); await f(ids[1],'d1','25'); await f(ids[1],'br','10');
 const V=await p.evaluate(()=>{ const A=window.__ar.st(); const N=Object.values(A.negs).find(n=>!n.del&&n.lines.length===2); return JSON.stringify(N.v); });
 const v=JSON.parse(V); ok(v[ids[0]].esc[0].d==='100' && !(v[ids[1]].esc||[]).some(t=>t&&t.d) && v[ids[0]].d1==='30' && v[ids[1]].d1==='25' && v[ids[1]].br==='10' && !v[ids[0]].br,'cada producto guarda su propia escala y sus propios descuentos');
 await p.click(`#articulos [data-ngrow="${ids[0]}"][data-t="esc"]`); await p.waitForTimeout(300);
 ok(await has(ids[0],'esc.0.d'),'si la escala tiene datos no se oculta (no se pierde nada)');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
