// v1282 · vuelto ₲ 15.000 según el stock: 10.000+5.000 · solo de 5.000 → 3×5.000 · solo de 2.000 y 1.000 → 7×2.000 + 1×1.000
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const caso=async(stk)=>{ await p.evaluate((stk)=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); window.__vt.open(); const V=window.__vt.st(); V.open=true; V.stock={GS:stk,BRL:{},USD:{}}; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:35000,uq:1}]; window.__vt.open(); },stk);
  await p.waitForTimeout(250); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
  await p.keyboard.press('Enter'); await p.keyboard.type('1'); await p.waitForTimeout(150); // 1 × 50.000, total 35.000 → vuelto 15.000
  return p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-vo]')].filter(i=>+i.value>0).map(i=>i.value+'×'+i.dataset.vo).sort((a,b)=>+b.split('×')[1]-+a.split('×')[1]).join(' + ')); };
 let r=await caso({10000:3,5000:3,2000:5,1000:5}); ok(r==='1×10000 + 1×5000','hay de todo → '+r);
 r=await caso({5000:4,2000:0,1000:5}); ok(r==='3×5000','solo de 5.000 → '+r);
 r=await caso({2000:10,1000:5}); ok(r==='7×2000 + 1×1000','solo de 2.000 y 1.000 → '+r);
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
