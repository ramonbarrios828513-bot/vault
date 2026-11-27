// v1298 · cobro rápido: ENTRADA y SALIDA lado a lado; escribir «1» (₲ 100.000) ya muestra el vuelto armado al lado, y Enter confirma. Sin mouse.
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.sales=[]; V.stock={GS:{10000:5,5000:5,2000:5,1000:5,500:5,100:10},BRL:{},USD:{}}; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:94300,uq:1}]; window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 await p.keyboard.type('1'); await p.waitForTimeout(300);
 const out=await p.evaluate(()=>{ const o=document.querySelector('.vt-out'); return {tx:o.innerText.replace(/\s+/g,' '), v:[...o.querySelectorAll('[data-vo]')].filter(i=>i.value).map(i=>i.value+'×'+i.dataset.vo).join(' + ')}; });
 ok(/SALIDA · vuelto ₲ 5\.700/.test(out.tx)&&/justo/.test(out.tx),'al escribir el billete, al lado ya aparece la SALIDA con el vuelto: '+out.v);
 ok(await p.evaluate(()=>!!document.querySelector('.vt-in')&&!!document.querySelector('.vt-out')),'dos bloques: ⬇ ENTRADA y ⬆ SALIDA');
 await p.keyboard.press('Enter'); await p.waitForTimeout(500); /* v1346: el 1.er Enter muestra el vuelto, el 2.º confirma */ await p.keyboard.press('Enter'); await p.waitForTimeout(500);
 const S=await p.evaluate(()=>{ const V=window.__vt.st(), s=V.sales[V.sales.length-1]; return {n:V.sales.length, vu:s&&s.vuDado, st:V.stock.GS[100000], ov:document.querySelectorAll('.ico-ov').length}; });
 ok(S.n===1&&S.vu===5700&&S.st===1&&!S.ov,'Enter muestra el vuelto y otro Enter confirma: venta cobrada, vuelto ₲ 5.700 y el billete entró a la caja '+JSON.stringify(S));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
