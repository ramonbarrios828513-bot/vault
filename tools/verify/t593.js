// v1332 · Fichas: «Código Nissi» + barra de la presentación principal en la lista, botón 👁️ Presentaciones, bloque de arriba en la ficha y «➕ Crear nueva presentación»
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:800}});
 await p.evaluate(()=>{ window.__fichas.open(); }); await p.waitForTimeout(600);
 const F=async(sel,v)=>{ await p.fill('.ico-ov '+sel,v); await p.keyboard.press('Tab'); await p.waitForTimeout(450); };
 await p.evaluate(()=>document.querySelector('#fichasMod [data-an]').click()); await p.waitForTimeout(600);
 let top=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.vt-ov')].pop(); const t=o.querySelector('.v32-top'); return t?t.innerText.replace(/\s+/g,' '):''; });
 ok(/CÓDIGO NISSI \(código padre\)/.test(top)&&/Crear nueva presentación/.test(top)&&/Presentaciones de este código/.test(top),'la ficha abre con el CÓDIGO NISSI arriba, sus presentaciones y el botón para crear una nueva');
 await F('[data-ar="n"]','Jarabe Prueba 120 ml'); await F('[data-ar="pa"]','Prueba 1 mg'); await F('[data-ar="pvp"]','40000'); await F('[data-ar="costo"]','20000'); await F('[data-ar="bar0"]','7840000000017').catch(()=>{});
 await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().querySelector('[data-pxnew]').click()); await p.waitForTimeout(900);
 let s=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.vt-ov')].pop(); return {frac:o.querySelector('[data-frac]').checked,px:[...o.querySelectorAll('.v21-px')].map(t=>(t.querySelector('[data-pk="bar"]')||{}).value)}; });
 ok(s.frac&&s.px.length>=1&&/^2\d{12}$/.test(s.px[s.px.length-1]||''),'«➕ Crear nueva presentación» agrega un renglón nuevo con su barra propia ('+s.px.join(',')+')');
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.vt-ov')].pop(); const c=[...o.querySelectorAll('[data-pk="cant"]')].pop(); c.value='6'; c.dispatchEvent(new Event('input',{bubbles:true})); c.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(700);
 await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().querySelector('[data-ok]').click()); await p.waitForTimeout(1000);
 let L=await p.evaluate(()=>{ const M=document.querySelector('#fichasMod'); const r=[...M.querySelectorAll('.vt-li')].find(x=>/Jarabe Prueba/.test(x.innerText)); if(!r) return {t:'sin fila: '+[...document.querySelectorAll('.toast,.tst,#toast,.vt-toast')].map(t=>t.innerText).join('|')}; const t=r.innerText.replace(/\s+/g,' '); r.querySelector('[data-apx]').click(); return {t}; }); await p.waitForTimeout(500);
 ok(/Código Nissi \d+/.test(L.t)&&/▮▯/.test(L.t)&&/Presentaciones \(2\)/.test(L.t),'en la lista cada fila dice «Código Nissi N», la barra de la presentación principal y el botón 👁️ Presentaciones ('+L.t.slice(0,110)+')');
 const px=await p.evaluate(()=>[...document.querySelectorAll('#fichasMod .v32-px tr')].map(t=>t.innerText.replace(/\s+/g,' ')));
 ok(px.length===3&&/⭐/.test(px[1]+px[2])&&/x6FR/.test(px.join(' '))&&px.slice(1).every(x=>/\d{8,13}/.test(x)),'👁️ muestra todas las presentaciones de ese código, cada una con su barra ('+px.slice(1).join(' || ').slice(0,150)+')');
 // ficha que se fracciona: Blíster preparado
 await p.evaluate(()=>document.querySelector('#fichasMod [data-an]').click()); await p.waitForTimeout(600);
 await F('[data-ar="n"]','Comprimido Prueba cj x20'); await F('[data-ar="pa"]','Prueba 2 mg'); await F('[data-ar="u"]','20'); await F('[data-ar="pvp"]','20000'); await F('[data-ar="costo"]','8000'); await F('[data-ar="tb"]','10').catch(()=>{});
 await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().querySelector('[data-ok]').click()); await p.waitForTimeout(1000);
 const bl=await p.evaluate(async()=>{ const M=document.querySelector('#fichasMod'); const r=[...M.querySelectorAll('.vt-li')].find(x=>/Comprimido Prueba/.test(x.innerText)); if(!r) return 'sin fila'; r.querySelector('[data-ae]').click(); await new Promise(r=>setTimeout(r,1000)); const o=[...document.querySelectorAll('.vt-ov')].pop(); return [...o.querySelectorAll('.v21-px')].map(t=>(t.querySelector('select')||{}).value+':'+((t.querySelector('[data-pk="cant"]')||{}).value)).join(','); });
 ok(/Blíster:$/.test(bl)||/Blíster:(,|$)/.test(bl),'al abrir una ficha que se fracciona ya está preparado el renglón del Blíster, vacío ('+bl+')');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
