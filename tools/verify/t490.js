// v1266 · al entrar con la clave NO se pone pantalla completa: quedan las barras lilas del teléfono arriba y abajo
const { chromium } = require('/opt/node-tools/node_modules/playwright');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:412,height:900}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.route(/fonts\.googleapis|jsdelivr|gstatic|cdnjs\.cloudflare\.com\/ajax\/libs\/(pdf|mammoth)/, r=>r.abort());
 await p.addInitScript(()=>{ window.__fsN=0; const f=function(){ window.__fsN++; return Promise.resolve(); }; Element.prototype.requestFullscreen=f; Element.prototype.webkitRequestFullscreen=f; const mm=window.matchMedia.bind(window); window.matchMedia=q=>/display-mode: *browser/.test(q)?{matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}:mm(q); try{ if(!localStorage.getItem('wk-face')) localStorage.setItem('wk-face','fam'); }catch(e){} new MutationObserver(()=>{ document.querySelectorAll('.sv-ov').forEach(x=>setTimeout(()=>x.remove(),30)); }).observe(document,{childList:true,subtree:true}); });
 await p.goto('http://localhost:'+(process.env.PORT||8099)+'/work.html'); await p.waitForTimeout(1200);
 await p.click('#heroPass'); await p.keyboard.type('1234'); await p.click('#heroPass2'); await p.keyboard.type('1234'); await p.click('text=Crear y entrar'); await p.waitForTimeout(2500);
 ok(await p.evaluate(()=>window.__fsN)===0,'al entrar no pide pantalla completa (las barras lilas quedan)');
 await p.evaluate(()=>{ const s=JSON.parse(localStorage.getItem('le-settings')||'{}'); return s.autoFull; }).then(v=>ok(v!==true,'por defecto el ajuste «pantalla entera al entrar» está apagado'));
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
