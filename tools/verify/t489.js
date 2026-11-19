// v1266 · en la central (Cloudflare) «Familia en línea» no dice «dentro de Claude» (la central no es Claude)
const { chromium } = require('playwright');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/api/**',r=>r.fulfill({status:503,body:'{}'}));
 await p.addInitScript(()=>{ try{ if(!sessionStorage.getItem('t489')){ sessionStorage.setItem('t489','1'); localStorage.setItem('nube-code','TEST-CODE-1234'); } }catch(e){} });
 await p.goto('http://localhost:'+(process.env.PORT||8100)+'/work.html'); await p.waitForTimeout(4000);
 const r=await p.evaluate(()=>({ shim:!!(window.claude&&window.claude.use&&window.claude.use.__nube) }));
 ok(r.shim,'está en modo central');
 await p.evaluate(()=>{ const x=document.createElement('button'); x.dataset.famopen='1'; document.body.appendChild(x); x.click(); x.remove(); }); await p.waitForTimeout(800); const t=await p.evaluate(()=>{ const a=document.getElementById('familia'); return a? a.textContent : ''; });
 ok(t.length>20&&!/Dentro de Claude no se puede conectar/.test(t),'no dice «Dentro de Claude no se puede conectar»');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
