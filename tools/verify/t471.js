// v1260 · en la central (baul-nissi.pages.dev) la IA NO queda «apagada»: usa la clave guardada en el aparato o permite recibirla con el número
const { chromium } = require('playwright');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const b=await chromium.launch(); const port=process.env.PORT||8100;
 const run=async(key)=>{ const ctx=await b.newContext({viewport:{width:1280,height:900}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/api/**',r=>r.fulfill({status:503,body:'{}'})); await p.route('https://api.anthropic.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:[{type:'text',text:'ok'}],stop_reason:'end_turn'})}));
  await p.addInitScript((k)=>{ try{ if(!sessionStorage.getItem('t471')){ sessionStorage.setItem('t471','1'); localStorage.setItem('nube-code','TEST-CODE-1234'); if(k) localStorage.setItem('iv-ai-key',k); } }catch(e){} },key);
  await p.goto('http://localhost:'+port+'/work.html'); await p.waitForTimeout(5000);
  const r=await p.evaluate(()=>{ const x=document.createElement('button'); x.dataset.aipanel='1'; document.body.appendChild(x); x.click(); x.remove(); const d=document.querySelector('.ai-diag'); return { shim:!!(window.claude&&window.claude.use&&window.claude.use.__nube), txt:d?d.innerText:'' }; });
  await ctx.close(); return {r,errs}; };
 let {r,errs}=await run('sk-ant-test-0000000000000000000000000000abcd');
 ok(r.shim,'la central marca su «claude» como central');
 ok(/autom[aá]tico/i.test(r.txt) && !/IA apagada/.test(r.txt),'con clave guardada: modo automático (no «apagada») · '+r.txt.replace(/\s+/g,' ').slice(0,160));
 ({r}=await run(''));
 ok(/Recibir la IA con el n[uú]mero/.test(r.txt),'sin clave: aparece «📥 Recibir la IA con el número»');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
