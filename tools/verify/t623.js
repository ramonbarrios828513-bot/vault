// v1349 · 💳 Billetera virtual del cliente: enlace personal cifrado (solo lectura) + ticket con QR y WhatsApp
// Uso: node t623.js (levanta su propio mock en 8106 con work.html y billetera/)
const {execSync,spawn}=require('child_process'), fs=require('fs');
const R='/tmp/claude-0/t623root'; execSync('rm -rf '+R+' && mkdir -p '+R+'/billetera'); fs.copyFileSync(process.env.HTML||'/tmp/claude-0/s132/work.html',R+'/work.html'); fs.copyFileSync(__dirname+'/../../billetera/index.html',R+'/billetera/index.html');
const mk=spawn('node',[__dirname+'/central-mock.js',R,'8106'],{stdio:'ignore'}); process.env.PORT='8106';
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ await new Promise(r=>setTimeout(r,800)); const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const SP='a'.repeat(64), OWN='b'.repeat(64);
 await p.evaluate(([SP,OWN])=>{ window.__nubeSP=()=>Promise.resolve(SP); window.__nubeOp=async op=>{ const r=await fetch('/api/db',{method:'POST',headers:{'Content-Type':'application/json','X-Space':SP,'X-Key':OWN,'X-App':'99999'},body:JSON.stringify({ops:[op]})}); const j=await r.json(); return j.res?j.res[0]:j; }; },[SP,OWN]);
 await p.evaluate(()=>window.__nubeOp({op:'set',p:'x/init',d:{a:1}}));
 const url=await p.evaluate(async()=>{ const C={id:'cX',n:'María López',tel:'0981 123 456',favor:850,deuda:0,cta:[{t:Date.now(),k:'fav',m:850,tk:7}]}; const ok=await window.__bil.pub(C); return {ok, u:window.__bil.url(C), tel:window.__bil.tel(C.tel), vk:C.bil.vk, id:C.bil.id}; });
 console.log(JSON.stringify({ok:url.ok,tel:url.tel,u:url.u.slice(0,60)}));
 ok(url.ok && /\/billetera\/index\.html#s=a{64}&k=[0-9a-f]{64}&e=[\w-]+&b=b[0-9a-f]{20}$/.test(url.u),'publica la billetera cifrada y arma el enlace personal');
 ok(url.tel==='595981123456','teléfono para WhatsApp en formato internacional');
 const raw=await p.evaluate(async([SP,OWN,id])=>{ const r=await fetch('/api/db',{method:'POST',headers:{'Content-Type':'application/json','X-Space':SP,'X-Key':OWN},body:JSON.stringify({ops:[{op:'get',p:'bil/'+id+'/w'}]})}); return (await r.json()).res[0]; },[SP,OWN,url.id]);
 ok(raw && !/850|María/.test(raw),'en la central queda cifrado (no se lee el nombre ni el saldo)');
 const p2=await b.newPage(); await p2.goto(url.u); await p2.waitForTimeout(1500); const t=await p2.evaluate(()=>document.body.innerText); console.log('   '+t.replace(/\s+/g,' ').slice(0,200));
 ok(/María/.test(t) && /₲ 850/.test(t) && /Vuelto que dejaste a favor/.test(t) && !/López/.test(t),'el cliente ve su saldo y movimientos (solo su primer nombre)');
 const w=await p2.evaluate(async([SP,vk,id])=>{ const r=await fetch('/api/db',{method:'POST',headers:{'Content-Type':'application/json','X-Space':SP,'X-Key':vk,'X-Vend':'1'},body:JSON.stringify({ops:[{op:'set',p:'bil/'+id+'/w',d:{}}]})}); return r.status; },[SP,url.vk,url.id]);
 ok(w===403,'con el enlace del cliente NO se puede modificar nada (solo leer)');
 const o=await p2.evaluate(async([SP,vk])=>{ const r=await fetch('/api/db',{method:'POST',headers:{'Content-Type':'application/json','X-Space':SP,'X-Key':vk,'X-Vend':'1'},body:JSON.stringify({ops:[{op:'get',p:'bil/botro/w'}]})}); return r.status; },[SP,url.vk]);
 ok(o===403,'con su enlace no puede ver la billetera de otro cliente');
 console.log('errs',errs,'fallas',fail); await b.close(); mk.kill(); process.exit(fail?1:0); })().catch(e=>{ console.log('✘ FALLA',e.message); mk.kill(); process.exit(1); });
