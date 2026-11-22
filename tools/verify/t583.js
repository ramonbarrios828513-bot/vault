// v1321 · ficha de artículo: ✂️ Fraccionar crea las presentaciones con su barra interna, ➕ presentaciones por concepto (blíster…), 🤝 negociación con el proveedor con los campos de la orden de compra → costo final
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}});
 await p.evaluate(()=>{ window.__fichas.open(); }); await p.waitForTimeout(600); await p.evaluate(()=>{ document.querySelector('#fichasMod [data-an]').click(); }); await p.waitForTimeout(600);
 const F=async(sel,v)=>{ await p.fill('.ico-ov '+sel,v); await p.keyboard.press('Tab'); await p.waitForTimeout(500); };
 const g=()=>p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); const v=k=>{ const i=o.querySelector('[data-ar="'+k+'"]'); return i?i.value:''; }; return {frac:o.querySelector('[data-frac]').checked,bt:v('bt'),bf:v('bf'),cCaja:v('cCaja'),px:[...o.querySelectorAll('tr.v21-px')].map(r=>[...r.querySelectorAll('[data-pk]')].map(i=>i.value).join('|')),ngr:(o.querySelector('.v21-ngr')||{}).innerText||'',prx:(o.querySelector('.vt-prx')||{}).innerText||'',sw:document.documentElement.scrollWidth}; });
 await F('[data-ar="n"]','Kitadol Forte 400'); await F('[data-ar="pa"]','Ibuprofeno 400 mg'); await F('[data-ar="u"]','20');
 let s=await g(); ok(s.frac,'caja x20 → se marca fraccionado'); ok(/^2\d{12}$/.test(s.bt)&&/^2\d{12}$/.test(s.bf)&&s.bt!==s.bf,'tableta y fracción reciben su barra interna: '+s.bt+' / '+s.bf);
 await F('[data-ar="tb"]','10'); await F('[data-ar="pvp"]','40000');
 await F('[data-ng21="d1"]','30'); await F('[data-ng21="d2"]','10'); await F('[data-ng21="bq"]','10'); await F('[data-ng21="br"]','2'); await F('[data-ng21="nc"]','1000'); await F('[data-ng21="ret"]','3');
 s=await g(); ok(/COSTO FINAL ₲ 20\.000/.test(s.ngr),'negociación 30 % + 10 % + 10+2 + NC 1.000 → costo final 20.000'); ok(/Retorno comercial 3% = ₲ 600/.test(s.ngr),'retorno comercial aparte (no baja el costo)'); ok(s.cCaja==='20.000','el costo de la caja sale de la negociación: '+s.cCaja);
 await p.evaluate(()=>{ [...document.querySelectorAll('.ico-ov')].pop().querySelector('[data-pxadd]').click(); }); await p.waitForTimeout(500); await F('[data-px="0"][data-pk="q"]','5');
 s=await g(); ok(s.px.length===1&&/^Blíster\|5\|2\d{12}\|\|5\.000\|10\.000\|100$/.test(s.px[0]),'➕ blíster x5 con barra propia, costo 5.000 y PVP 10.000: '+s.px[0]); ok(/Blíster/.test(s.prx),'el resumen muestra la presentación nueva'); ok(s.sw<=392,'no se sale de la pantalla del teléfono: '+s.sw);
 await p.evaluate(()=>{ [...document.querySelectorAll('.ico-ov')].pop().querySelector('[data-ok]').click(); }); await p.waitForTimeout(900);
 const sv=await p.evaluate(()=>{ const k=Object.keys(localStorage).find(k=>{try{const j=JSON.parse(localStorage.getItem(k));return j&&j.arts&&j.pres;}catch(e){return false;}}); const V=JSON.parse(localStorage.getItem(k)); const id=Object.keys(V.arts).find(i=>V.arts[i].n==='Kitadol Forte 400'); return id?{x:V.arts[id],pres:V.pres[id]}:null; });
 ok(sv&&sv.x.costo===20000&&sv.x.ng.d1==='30'&&sv.x.ng.ret==='3','la ficha guarda el costo y cómo se negoció'); const bl=sv&&sv.pres.find(q=>q.cn==='Blíster'); ok(bl&&bl.q===5&&bl.pvp===10000&&bl.t==='otro','se guarda el blíster x5'); ok(sv&&sv.pres.some(q=>q.t==='tab'&&q.bar)&&sv.pres.some(q=>q.t==='fr'&&q.bar),'tableta y fracción guardadas con barra');
 // reabrir: sigue todo y se puede quitar el blíster
 await p.evaluate(()=>{ const b=[...document.querySelectorAll('#fichasMod [data-ae]')].pop(); b.click(); }); await p.waitForTimeout(600);
 s=await g(); ok(s.px.length===1&&/COSTO FINAL ₲ 20\.000/.test(s.ngr),'al reabrir: presentación y negociación siguen');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
