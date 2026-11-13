// 🔒 primero la versión: aparato viejo se actualiza ANTES de conectarse; si no puede, queda bloqueado y no habla con la central
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs=require('fs');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext(); await ctx.route(/fonts\.googleapis|jsdelivr|gstatic|cdnjs/, r=>r.abort());
 let apiCalls=0; await ctx.route('**/api/db', r=>{ apiCalls++; r.continue(); });
 await ctx.addInitScript(()=>{ window.__dblOK=true; try{ localStorage.setItem('wk-face','fam'); localStorage.setItem('nube-code','NISSI-ABCD-EFGH-JKLM-NPQR-STUV'); }catch(e){} }); const p=await ctx.newPage();
 fs.writeFileSync(process.env.SRV+'/version.json','{"build": 1299}');
 await p.goto('http://localhost:8105/work.html'); await p.waitForTimeout(9000);
 const t=await p.evaluate(()=>(document.getElementById('verGate')||{}).innerText||''); console.log(t.slice(0,160), 'url', p.url().slice(-30), 'api', apiCalls);
 ok(/desactualizada|Actualizando/.test(t),'versión publicada más nueva → primero intenta actualizarse');
 ok(apiCalls===0,'mientras la versión no está al día, NO habla con la central');
 fs.writeFileSync(process.env.SRV+'/version.json','{"build": '+process.env.VB+'}');
 await p.evaluate(()=>{ try{sessionStorage.removeItem('ver-upd')}catch(e){} }); await p.goto('http://localhost:8105/work.html'); await p.waitForTimeout(5000);
 ok(await p.evaluate(()=>window.__verOK===true && !document.getElementById('verGate')),'versión al día → entra y se conecta');
 ok(apiCalls>0,'recién con la versión al día habla con la central');
 console.log('fallas',fail); await b.close(); })();
