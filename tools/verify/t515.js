// v1281 · 📦 Inventario de billetes: por cada billete inicio + entró − vuelto − remesa − pagos = debe haber; en el cierre compara con lo contado y muestra faltan / sobran por billete
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.stock={GS:{50000:2,10000:3,5000:2},BRL:{},USD:{}}; V.movs=[{t:Date.now(),k:'ini',b:{GS:{50000:1,10000:3,5000:2}},g:90000},{t:Date.now(),k:'rem',n:'Remesa',b:{GS:{50000:1}},g:50000}]; V.sales=[{t:Date.now(),tab:'Venta 1',lines:[],total:80000,pays:[{fp:'ef',m:80000,rec:{GS:{50000:2}}}],vu:{GS:{10000:2}},vuelto:20000}]; V.stock={GS:{50000:2,10000:1,5000:2},BRL:{},USD:{}}; window.__vt.open(); });
 await p.click('#ventas [data-vt="ver"]'); await p.waitForTimeout(300);
 const row=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov .vt-inv tr')].map(r=>r.innerText.replace(/\s+/g,' ')).find(t=>/50\.000/.test(t)&&!/Total/.test(t)));
 ok(/1\s+2\s+−1\s+2/.test(row||''),'₲ 50.000: inicio 1 + entró 2 − remesa 1 = debe haber 2 · '+row);
 const r10=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov .vt-inv tr')].map(r=>r.innerText.replace(/\s+/g,' ')).find(t=>/₲ 10\.000/.test(t)));
 ok(/3\s+−2\s+1/.test(r10||''),'₲ 10.000: inicio 3 − vuelto 2 = 1 · '+r10);
 await p.click('.vt-ov [data-x]'); await p.waitForTimeout(200);
 // cierre: contamos 50.000×2, 10.000×0 (falta 1), 5.000×3 (sobra 1)
 await p.evaluate(()=>{ const b=[...document.querySelectorAll('#ventas button')].find(x=>/Cierre/.test(x.textContent)); b.click(); }); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); const set=(d,n)=>{ const i=ov.querySelector('[data-vn="GS:'+d+'"]'); if(i){ i.value=String(n); i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); } }; set(50000,2); set(5000,3); });
 await p.waitForTimeout(300);
 await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); const b=ov.querySelector('[data-vc="ok"]'); b&&b.click(); }); await p.waitForTimeout(400);
 /* v1349: cierre en 2 pasos (① remesa ② próximo turno): lo contado va como remesa y no queda nada */
 await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); const b=ov.querySelector('[data-vc="ok"]'); b&&b.click(); }); await p.waitForTimeout(400);
 const cie=await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); return ov?ov.innerText.replace(/\s+/g,' '):''; });
 ok(/faltante 1/.test(cie)&&/sobrante 1/.test(cie),'el cierre muestra faltan / sobran por billete: '+cie.slice(0,300));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
