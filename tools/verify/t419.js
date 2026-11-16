// v1234 · ⭐ nuestra cotización propia: se carga, se aplica al arqueo y queda grabada en el historial
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(800);
 await p.evaluate(()=>{ const t=[...document.querySelectorAll('#cierre button')].find(x=>/Cotizaciones/.test(x.innerText)); t&&t.click(); }); await p.waitForTimeout(600);
 ok(await p.evaluate(()=>/Falta cargar la cotización de HOY/.test(document.querySelector('#cierre').innerText)),'🔔 avisa que falta cargar la cotización de hoy (la misma de Vital)');
 ok(await p.evaluate(()=>!!document.querySelector('#cierre [data-cz="cotProp"]')),'botón grande «⭐ Cargar NUESTRA cotización de hoy · aplicar y grabar»');
 await p.click('#cierre [data-cz="cotProp"]'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>/Aplicar y grabar/.test([...document.querySelectorAll('.ico-ov [data-tx="ok"]')].pop().innerText)),'el botón del formulario dice «✅ Aplicar y grabar»');
 ok(await p.evaluate(()=>document.querySelectorAll('.ico-ov .czm tbody tr').length===4),'📺 el monitor muestra dólar, real, peso argentino y euro al lado de las casas');
 await p.fill('.ico-ov [data-k="us"]','7.450'); await p.fill('.ico-ov [data-k="rs"]','1.330'); await p.fill('.ico-ov [data-k="ar"]','6,5'); await p.fill('.ico-ov [data-k="eu"]','8.600'); await p.click('.ico-ov [data-tx="ok"]'); await p.waitForTimeout(700);
 const r=await p.evaluate(()=>{ const C=window.__cz.st().cfg||{}; const K=C.cot||{}; return {car:C.car,ceu:C.ceu,cus:C.cus,crs:C.crs,usar:K.usar,h:(K.hist||[]).filter(h=>h.src&&h.src.indexOf('propia')===0).length, txt:document.querySelector('#cierre').innerText}; }); console.log('   '+JSON.stringify({cus:r.cus,crs:r.crs,usar:r.usar,h:r.h}));
 ok(+r.cus===7450 && +r.crs===1330 && r.usar==='propia','se APLICA al arqueo: dólar ₲ 7.450 y real ₲ 1.330 (usa nuestra cotización)');
 ok(+r.car===6.5 && +r.ceu===8600,'también aplica peso argentino (6,5) y euro (8.600)');
 ok(r.h===4 && /NUESTRA cotización propia · grabada/.test(r.txt),'queda GRABADA en el historial y se ve de dónde sale');
 ok(!/Falta cargar la cotización de HOY/.test(r.txt),'cargada la de hoy, el aviso desaparece');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
