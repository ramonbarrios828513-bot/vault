// v1342 · 💵 Cobrar en efectivo: al escribir el billete que da el cliente y dar Enter, el cuadro ⬆ SALIDA · vuelto queda entero a la vista (no salta ni se esconde a medias)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:87500,uq:1}]; window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(500);
 await p.click('.vt-ov [data-rqn="100000"]'); await p.keyboard.type('1'); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); const h=[...ov.querySelectorAll('h4')].find(x=>/SALIDA/.test(x.textContent)), bx=h&&h.parentElement, sc=ov.querySelector('.ico-box'); if(!bx||!sc) return null; const B=bx.getBoundingClientRect(), R=sc.getBoundingClientRect(); return {t:Math.round(B.top),b:Math.round(B.bottom),rt:Math.round(R.top),rb:Math.round(R.bottom),vu:/vuelto ₲ 12\.500/.test(bx.textContent),act:document.activeElement!==document.body}; });
 ok(r&&r.vu,'Enter con ₲ 100.000 muestra el vuelto ₲ 12.500');
 ok(r&&r.t>=r.rt&&r.b<=r.rb+1,'el cuadro del vuelto queda entero a la vista ('+JSON.stringify(r)+')');
 ok(r&&r.act,'el cursor queda en el cuadro del vuelto (no se pierde)');
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 await b.close(); console.log(fail?'fallas '+fail:'✔ t609 ok'); process.exit(fail?1:0); })();
