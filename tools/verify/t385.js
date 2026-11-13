// v1212 · el aparato del DUEÑO (tiene su Baúl, no fue instalado como aparato de trabajo): al bloquearse muestra SU entrada con su clave, no la de empleados
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:412,height:900}});
 await p.evaluate(()=>{ try{ localStorage.removeItem('wk-face'); sessionStorage.removeItem('wk-face'); }catch(e){} });
 await p.reload(); await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>({pass:!!document.getElementById('heroPass') && document.getElementById('heroPass').getClientRects().length>0, code:!!document.getElementById('wkCode'), crear:!!document.getElementById('heroPass2')}));
 console.log(JSON.stringify(r));
 ok(r.pass && !r.crear,'aparato del dueño bloqueado: se ve el lugar para SU clave');
 ok(!r.code,'no aparece la pantalla de empleados («número de 8 cifras»)');
 await p.click('#heroPass'); await p.keyboard.type('1234'); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
 ok(await p.evaluate(()=>!!(window.__rvOpen && window.__rvOpen())),'entra con su clave');
 // un aparato NUEVO (sin Baúl) sigue mostrando la instalación para empleados
 const ctx2=await b.newContext({viewport:{width:412,height:900}}); const p2=await ctx2.newPage(); await p2.route(/fonts\.googleapis|jsdelivr|gstatic|cdnjs/, r=>r.abort());
 await p2.goto('http://localhost:'+(process.env.PORT||8099)+'/work.html'); await p2.waitForTimeout(2500);
 ok(await p2.evaluate(()=>!!document.getElementById('wkCode')),'aparato nuevo: sigue mostrando «Instalar el sistema» para empleados');
 await b.close(); console.log(fail?'RESULTADO: '+fail+' FALLA(S)':'RESULTADO: TODO OK'); process.exit(fail?1:0);
})().catch(e=>{ console.log('✘ FALLA excepción '+e.message.slice(0,300)); process.exit(1); });
