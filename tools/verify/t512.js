// v1279 · 🧾 Ticket: cada renglón sale con la descripción de la barra que se pasó y su presentación (CAJA / TABLETA / FRACCIÓN, en FR)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__vt.open()); await p.waitForTimeout(600);
 await p.evaluate(()=>{ const V=window.__vt.st(); V.arts.vaQ={id:'vaQ',va:1,n:'Quitador Forte',pc:'',u:20,bar:['7790000000011'],rx:'libre',neg:'pvp',pvp:100000,costo:35000,cod:'VA0100',frac:true}; V.pres.vaQ=[{id:'caja',dsc:'Quitador Forte · Caja x20'},{id:'ptab',t:'tab',n:'Tableta x10',q:10,bar:'7790000000028',cost:17500,pvp:50000,dsc:'Quitador Forte · Tableta x10'},{id:'pfr',t:'fr',n:'Fracción',q:1,bar:'7790000000035',cost:1750,pvp:7000,dsc:'Quitador Forte comprimido'}]; V.stk.vaQ=200; V.open=true; V.stock={GS:{100000:2,50000:5,20000:5,10000:5,5000:5,2000:5,1000:5,500:5,100:10,50:5},BRL:{},USD:{}}; const t=V.tabs[0]; V.cur=t.id; t.lines=[]; t.fp='ef'; window.__vt.open(); });
 for (const bar of ['7790000000035','7790000000028','7790000000011']) { await p.fill('#vtQ',bar); await p.keyboard.press('Enter'); await p.waitForTimeout(200); }
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300); await p.click('.vt-ov [data-vp="rq"][data-d="100000"]'); await p.click('.vt-ov [data-vp="rq"][data-d="100000"]'); await p.waitForTimeout(200); await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(500);
 const [pop]=await Promise.all([p.context().waitForEvent('page'), p.click('#ventas [data-vt="tklast"]')]); await pop.waitForLoadState(); await pop.waitForTimeout(300);
 const tx=await pop.evaluate(()=>document.body.innerText);
 ok(/\[FRACCIÓN · 1 FR\]\s*Quitador Forte comprimido/.test(tx),'la fracción sale como FRACCIÓN con su descripción');
 ok(/\[TABLETA · 10 FR\]\s*Quitador Forte · Tableta x10/.test(tx),'la tableta sale como TABLETA con su descripción');
 ok(/\[CAJA · 20 FR\]\s*Quitador Forte · Caja x20/.test(tx),'la caja sale como CAJA con su descripción');
 ok(/TOTAL/.test(tx)&&/Vuelto/.test(tx),'tiene total y vuelto');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
