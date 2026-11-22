// v1322 · precio y costo PROVISORIOS bloquean vender y cargar stock · regla de vender SIN STOCK (general + excepción por ficha)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:800}});
 await p.evaluate(()=>{ window.__fichas.open(); }); await p.waitForTimeout(600);
 const F=async(sel,v)=>{ await p.fill('.ico-ov '+sel,v); await p.keyboard.press('Tab'); await p.waitForTimeout(450); };
 const toast=()=>p.evaluate(()=>[...document.querySelectorAll('.toast,.tst,#toast,.vt-toast')].map(t=>t.innerText).join(' | '));
 const nueva=async(n)=>{ await p.evaluate(()=>{ const f0=[...document.querySelectorAll('.vt-ov')].pop(); if(f0&&f0.querySelector('[data-ar]')) f0.querySelector('[data-x]').click(); document.querySelector('#fichasMod [data-an]').click(); }); await p.waitForTimeout(600); await F('[data-ar="n"]',n); await F('[data-ar="pa"]','Prueba 1 mg'); };
 const guardar=async()=>{ await p.evaluate(()=>{ [...document.querySelectorAll('.ico-ov')].pop().querySelector('[data-ok]').click(); }); await p.waitForTimeout(800); };
 const st=()=>p.evaluate(()=>{ const k=Object.keys(localStorage).find(k=>{try{const j=JSON.parse(localStorage.getItem(k));return j&&j.arts&&j.pres;}catch(e){return false;}}); return JSON.parse(localStorage.getItem(k)); });
 const abierta=()=>p.evaluate(()=>{ const f=[...document.querySelectorAll('.vt-ov')].pop(); return !!(f&&f.querySelector('[data-ar="n"]')); });
 // 1 · sin precio no guarda
 await nueva('Provisorio Uno'); await guardar(); ok(await abierta(),'sin precio público la ficha no se guarda (pide precio o provisorio)');
 // 2 · provisorio + stock → no
 await F('[data-ar="pvp"]','10000'); await F('[data-ar="costo"]','6000'); await p.check('.ico-ov [data-fict]'); await p.waitForTimeout(300); await F('[data-ar="stk0"]','5'); await guardar();
 ok(await abierta(),'con precio provisorio no acepta stock');
 await F('[data-ar="stk0"]',''); await guardar(); let V=await st(); let id=Object.keys(V.arts).find(i=>V.arts[i].n==='Provisorio Uno');
 ok(id&&V.arts[id].fict==='sí','se guarda marcada como provisoria');
 const lst=await p.evaluate(()=>document.querySelector('#fichaRows').innerText); ok(/PRECIO PROVISORIO/.test(lst),'la lista la muestra bloqueada');
 const vend=await p.evaluate(()=>{ window.__vt.open(); return new Promise(r=>setTimeout(()=>{ const q=document.getElementById('vtQ'); q.value='Provisorio'; q.dispatchEvent(new Event('input',{bubbles:true})); setTimeout(()=>r(document.getElementById('ventas').innerText.includes('Provisorio Uno')),500); },900)); });
 ok(!vend,'no aparece para vender');
 // 3 · vender sin stock: regla general y excepción por ficha
 await p.evaluate(()=>{ const v=document.getElementById('ventas'); const x=v&&v.querySelector('[data-vt="x"],[data-x]'); window.__fichas.open(); }); await p.waitForTimeout(600);
 await nueva('Sinstock Dos'); await F('[data-ar="bar0"]','7790000058401'); await F('[data-ar="pvp"]','10000'); await F('[data-ar="costo"]','6000'); await guardar();
 V=await st(); id=Object.keys(V.arts).find(i=>V.arts[i].n==='Sinstock Dos'); ok(!!id,'ficha normal sin stock guardada');
 const lineas=async()=>{ await p.evaluate(()=>window.__vt.open()); await p.waitForTimeout(700); await p.fill('#vtQ','7790000058401'); await p.keyboard.press('Enter'); await p.waitForTimeout(500); const V2=await st(); const n=(V2.tabs||[]).reduce((a,t)=>a+t.lines.filter(l=>l.aid===id).reduce((x,l)=>x+l.q,0),0); return n; };
 const n1=await lineas(); ok(n1===1,'regla general «avisar y dejar vender»: se agrega aunque no haya stock ('+n1+')');
 await p.evaluate(()=>{ window.__fichas.open(); }); await p.waitForTimeout(600); await p.selectOption('#fichasMod [data-ssg]','bloq'); await p.waitForTimeout(400);
 const n2=await lineas(); ok(n2===1,'regla general «bloquear»: ya no deja agregar otro ('+n2+')');
 await p.evaluate(()=>{ document.querySelector('#ventas [data-vt="cobrar"]').click(); }); await p.waitForTimeout(600);
 const cob=await p.evaluate(()=>!!document.querySelector('#cobOv,.vt-cob,[data-cob]')); const V3=await st(); const sigue=(V3.tabs||[]).some(t=>t.lines.some(l=>l.aid===id)); ok(sigue&&!cob,'y no deja cobrar lo que no tiene stock');
 await p.evaluate(()=>{ window.__fichas.open(); }); await p.waitForTimeout(600); await p.evaluate(()=>{ [...document.querySelectorAll('#fichasMod [data-ae]')].pop().click(); }); await p.waitForTimeout(600); await p.selectOption('.ico-ov [data-ar="vss"]','si'); await p.waitForTimeout(300); await guardar();
 const n3=await lineas(); ok(n3===2,'ficha con «habilitar vender sin stock»: se agrega igual ('+n3+')');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
