// v1283 · cliente de Brasil que paga con su tarjeta: se le lee el aviso (R$ = ₲ con la cotización, el cambio de su banco no es nuestro, sin devolución) y no se confirma hasta marcar que aceptó
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.rate.BRL=1150; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='tc'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:1150000,uq:1}]; window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const s=document.querySelector('.vt-ov [data-pf="0"]'); if(s.value!=='tc'){ s.value='tc'; s.dispatchEvent(new Event('change',{bubbles:true})); } }); await p.waitForTimeout(250);
 await p.click('.vt-ov [data-vp="resto"]'); await p.waitForTimeout(250);
 await p.click('.vt-ov [data-pbz="0"]'); await p.waitForTimeout(250);
 const w=await p.evaluate(()=>{ const x=document.querySelector('.vt-ov .vt-brw'); return x?x.textContent:''; });
 ok(/R\$ 1\.000/.test(w)&&/no lo maneja Nissifarma/.test(w)&&/no hay devolución/.test(w),'aviso para leer al cliente con R$ y ₲: '+w.slice(0,160));
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(250);
 let n=await p.evaluate(()=>window.__vt.st().sales.length); ok(n===0,'sin marcar «aceptó» no deja confirmar');
 await p.click('.vt-ov [data-pac="0"]'); await p.waitForTimeout(250); await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400);
 const sv=await p.evaluate(()=>{ const S=window.__vt.st().sales; return S[S.length-1]; }); ok(sv&&sv.pays[0].br===1&&sv.pays[0].acep===1,'la venta queda guardada con «cliente de Brasil aceptó»');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
