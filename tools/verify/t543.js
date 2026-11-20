// v1304 · producto sin caja en Vital: la presentación principal es la Tableta (no es error) y se ve «Tableta x4» en la ficha y en la venta
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__vt.open());
 await p.evaluate(async()=>{ const wb=await (await fetch('/mig.json')).json(); const keep=c=>String(c).split('.')[0]==='376'; wb.SheetNames.forEach(n=>{ if(/^MIG 0[457]/.test(n)){ const R=wb.Sheets[n]; wb.Sheets[n]=[R[0]].concat(R.slice(1).filter(r=>keep(r[0]))); if(/^MIG 07/.test(n)) wb.Sheets[n].slice(1).forEach(r=>{ r[6]=8; r[7]=8; }); } }); window.__fichas.mig(wb); });
 await p.waitForTimeout(800);
 const pv=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].filter(o=>o.querySelector('[data-impgo]')).pop().innerText.replace(/\s+/g,' '));
 ok(/1 nuevas/.test(pv)&&/sin errores/.test(pv),'sin caja ya no es error: '+(pv.match(/🆕[^🧹]*/)||[''])[0].slice(0,120));
 ok(/principal es la Tableta x4/.test(pv),'avisa que la principal es la Tableta x4');
 await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].filter(o=>o.querySelector('[data-impgo]')).pop().querySelector('[data-impgo]').click());
 await p.waitForFunction(()=>/Importadas/.test((document.getElementById('toast')||{}).textContent||'')||!!document.querySelector('[data-ak]'),null,{timeout:60000});
 await p.evaluate(()=>{ const a=document.querySelector('[data-ak]'); if(a) a.click(); }); await p.waitForTimeout(500);
 const r=await p.evaluate(()=>{ const V=window.__vt.st(); const x=Object.values(V.arts).find(a=>String(a.cod)==='376'); return x&&{pm:x.pm,u:x.u,pvp:x.pvp,pres:(V.pres[x.id]||[]).map(q=>q.dsc||'')}; });
 ok(r&&r.pm==='Tableta'&&r.u===4&&r.pvp===7200,'ficha 376: principal Tableta x4, PVP 7.200 · '+JSON.stringify(r));
 ok(r&&/Tableta x4/.test(r.pres[0]||''),'la descripción de la principal dice «Tableta x4»: '+(r&&r.pres[0]));
 const f=await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); window.__fichas.open(); const id=Object.values(window.__vt.st().arts).find(a=>String(a.cod)==='376').id; document.querySelector('#fichasMod [data-ae="'+id+'"]').click(); const ov=[...document.querySelectorAll('.vt-ov')].filter(o=>o.querySelector('[data-ar="pm"]')).pop(); return { sel:ov.querySelector('[data-ar="pm"]').value, t:/1 Tableta x/.test(ov.innerText) }; });
 ok(f.sel==='Tableta'&&f.t,'al editar, «Presentación principal: Tableta» y la fila dice «1 Tableta x…»');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
