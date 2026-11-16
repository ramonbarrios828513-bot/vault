// v1236 · 🗂️ filtro por forma de compra: 💵 contado · 📅 crédito · 💊 controlados (normal o cuadruplicada), cada uno con su 🖨️ aparte
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos .cp-b.o'); await p.waitForTimeout(300); await p.fill('#plQ','distrimed'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200);
 const ch=await p.evaluate(()=>[...document.querySelectorAll('#articulos .ng-gch')].map(x=>x.innerText.replace(/\n/g,' '))); console.log('   '+ch.join(' | '));
 ok(ch.length===3 && /CONTADO/.test(ch[0]) && /CRÉDITO/.test(ch[1]) && /CONTROLADOS/.test(ch[2]),'arriba hay 3 filtros: contado, crédito y controlados');
 const nc=+((ch[2].match(/\((\d+)\)/)||[])[1]||0); ok(nc>=1,'los controlados (normal o cuadruplicada) van aparte ('+nc+')');
 await p.click('#articulos .ng-gch.g-ctrl [data-ng="fl"]'); await p.waitForTimeout(400);
 const vis=await p.evaluate(()=>[...document.querySelectorAll('#articulos [data-ngrowid]')].map(x=>x.querySelector('.ng-pn, b').innerText)); console.log('   '+vis.join(' · '));
 ok(vis.length===nc && vis.some(x=>/Quetiapina/.test(x)),'el filtro 💊 muestra solo los controlados');
 ok(await p.evaluate(()=>!!document.querySelector('#articulos .ng-gch.g-ctrl [data-ng="print"]')),'cada grupo tiene su 🖨️ para imprimir o guardar en PDF por separado');
 await p.evaluate(()=>{ window.print=()=>{}; }); await p.click('#articulos .ng-gch.g-ctrl [data-ng="print"]'); await p.waitForTimeout(500);
 const pr=await p.evaluate(()=>{ const w=document.getElementById('ngPrint'); return w?w.innerText:''; }); ok(/CONTROLADOS/.test(pr) && /Quetiapina/.test(pr) && !/Metformina/.test(pr),'la impresión de controlados trae solo los controlados');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
