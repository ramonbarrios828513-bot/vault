// v1303/v1304 · pendientes de importación: los que no entraron quedan en «⛔ Pendientes de importación» dentro de Fichas y se corrigen ahí (✏️ Corregir abre la ficha con los datos del Excel)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); }); await p.waitForTimeout(300);
// v1332: en el archivo ya no quedan errores entre los productos con stock; se siembra una ficha que ya tiene la barra de la Nivea para probar «Pendientes»
 await p.evaluate(()=>{ const V=window.__vt.st(); V.arts.vaT={id:'vaT',va:1,cod:'99999999',n:'Otra crema con la barra de la Nivea',bar:['42207573'],pvp:1000,costo:500,u:1,neg:'pvp',grp:'General',iva:'10',rx:'libre'}; });
 await p.evaluate(async()=>{ const wb=await (await fetch('/mig.json')).json(); window.__fichas.mig(wb); }); await p.waitForTimeout(1500);
 const pv=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().innerText);
 ok(/Pendientes de importación/.test(pv),'la vista previa avisa que los ⛔ quedan en Pendientes');
 await p.evaluate(()=>{ const c=[...document.querySelectorAll('.vt-ov')].pop().querySelector('[data-imperr]'); if(c&&c.checked) c.click(); }); await p.waitForTimeout(700); /* sin «importar también las que tienen error»: quedan en Pendientes */
 await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().querySelector('[data-impgo]').click());
 await p.waitForFunction(()=>/Importadas|demasiadas/.test((document.getElementById('toast')||{}).textContent||'')||!!document.querySelector('[data-ak]'),null,{timeout:600000});
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); });
 const n0=await p.evaluate(()=>(window.__vt.st().impErr||[]).length);
 ok(n0===1,'quedó 1 pendiente guardado: '+n0);
 const hd=await p.evaluate(()=>{ const V=window.__vt.st(); const x=Object.values(V.arts).find(a=>String(a.cod)==='7892128'); return x&&{u:x.u,pvp:x.pvp,costo:x.costo,frac:x.frac,pres:(V.pres[x.id]||[]).map(q=>(q.t||'caja')+':'+(q.pvp||'')).join('|')}; });
 ok(hd&&hd.u===30&&hd.pvp===240000&&hd.frac,'Hidrolágeno (Vital: unidad x1 con costo de caja) se arma Caja x30, PVP 240.000 y fracción: '+JSON.stringify(hd));
 const btn=await p.evaluate(()=>{ window.__fichas.open(); const x=document.querySelector('#fichasMod [data-ipend]'); return x&&x.textContent; });
 ok(/Pendientes de importación \(1\)/.test(btn||''),'botón en Fichas: '+btn);
 await p.evaluate(()=>document.querySelector('#fichasMod [data-ipend]').click()); await p.waitForTimeout(300);
 const lst=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].filter(o=>/Pendientes de importación \(/.test(o.innerText)&&o.id!=='fichasMod').pop().innerText.replace(/\s+/g,' '));
 ok(/13910/.test(lst)&&/barra/i.test(lst),'la lista muestra Nivea 13910 con su problema');
 await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].filter(o=>/Pendientes de importación \(/.test(o.innerText)&&o.id!=='fichasMod').pop(); const tr=[...ov.querySelectorAll('tr')].find(t=>/13910/.test(t.textContent)); tr.querySelector('[data-pfix]').click(); }); await p.waitForTimeout(400);
 const fv=await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].filter(o=>o.querySelector('[data-ar="bar0"]')).pop(); return { n:ov.querySelector('[data-ar="n"]').value, bar:ov.querySelector('[data-ar="bar0"]').value }; });
 ok(/nivea/i.test(fv.n),'la ficha se abre con los datos del Excel: '+fv.n+' · '+fv.bar);
 await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].filter(o=>o.querySelector('[data-ar="bar0"]')).pop(); const i=ov.querySelector('[data-ar="bar0"]'); i.value='7790000000017'; i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); ov.querySelector('[data-ok]').click(); });
 await p.waitForTimeout(600);
 const r=await p.evaluate(()=>{ const V=window.__vt.st(); return { n:(V.impErr||[]).length, f:Object.values(V.arts).some(x=>String(x.cod)==='13910') }; });
 ok(r.f,'Nivea 13910 quedó importada con la barra corregida');
 ok(r.n===0,'no quedan pendientes: '+r.n);
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
