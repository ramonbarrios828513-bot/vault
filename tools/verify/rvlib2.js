const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs=require('fs');
module.exports = async function setup(opts={}){ const b = await chromium.launch(); const p = await (await b.newContext(Object.assign({viewport:opts.vp||{width:412,height:900}}, opts.ctx||{}))).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error' && !/Failed to load|ERR_|favicon|404|net::/.test(m.text())) errs.push('console: '+m.text().slice(0,200)); }); p.on('dialog',d=>d.accept());
 await p.route('https://cdnjs.cloudflare.com/ajax/libs/xlsx/**', r=>r.fulfill({path:'/tmp/xlsx.full.min.js', contentType:'application/javascript'}));
 await p.route(opts.fb ? /fonts\.googleapis|jsdelivr|fonts\.gstatic|cdnjs\.cloudflare\.com\/ajax\/libs\/(pdf|mammoth)/ : /fonts\.googleapis|jsdelivr|gstatic|cdnjs\.cloudflare\.com\/ajax\/libs\/(pdf|mammoth)/, r=>r.abort());
 if(!opts.keepRcpt) await p.addInitScript(()=>{ /*svAuto*/ new MutationObserver(()=>{ document.querySelectorAll('.sv-ov').forEach(x=>setTimeout(()=>x.remove(),30)); }).observe(document,{childList:true,subtree:true}); });
 await p.addInitScript(()=>{ try { if (!localStorage.getItem('wk-face')) localStorage.setItem('wk-face','fam'); } catch(e){} }); await p.addInitScript(()=>{ window.__plModeOK=true; window.__dblOK=true; });
 if (opts.pre) await opts.pre(p);
 await p.goto('http://localhost:'+(process.env.PORT||8099)+'/work.html'); await p.waitForTimeout(1200);
 await p.click('#heroPass'); await p.keyboard.type('1234'); await p.click('#heroPass2'); await p.keyboard.type('1234'); await p.click('text=Crear y entrar'); await p.waitForTimeout(2500);
 try{await p.click('text=Ahora no',{timeout:1000});}catch(e){}
 if (opts.pla) { await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(600); const buf=fs.readFileSync('/tmp/claude-0/rh/r.xlsx'); await p.evaluate(async (arr)=>{ await window.__pla.impX(new Uint8Array(arr).buffer); }, [...buf]); await p.waitForTimeout(1200); await p.evaluate(()=>document.querySelectorAll('.ico-ov').forEach(x=>x.remove())); }
 if (opts.nis) { await p.evaluate(()=>window.__nis.open()); await p.waitForTimeout(800); await p.click('text=Cargar mis datos de Nissifarma'); await p.waitForTimeout(400); await p.fill('.nis-fm input','chipa-salud-parana-yerba-48'); await p.click('.nis-fm button:has-text("Cargar") >> nth=0'); await p.waitForTimeout(8000); await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); }); }
 return { b, p, errs }; };
