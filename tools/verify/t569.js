// v1313 · (al cerrar se vuelve a la ciudad por el mismo camino) · Claude abierto desde la 🏙️ Ciudad (torre de comunicación) sobre la portada: el cuadro derecho del inicio no lo tapa y «Enviar» queda a la vista; al cerrar Claude el cuadro vuelve
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:800}});
 await p.evaluate(()=>window.__city.open()); await p.waitForTimeout(700);
 const a=await p.evaluate(()=>{ const s=document.documentElement.innerHTML.match(/t:Claude \(con[^']*/); return s?s[0]:''; });
 ok(!!a,'la Ciudad tiene la sala de Claude');
 await p.evaluate((a)=>{ window.__city.go(['torre']); window.__city.run(a); },a); await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>{ const cp=document.getElementById('cPanel'), R=document.getElementById('homeSideR'); const env=[...cp.querySelectorAll('button')].find(x=>/Enviar/.test(x.textContent)); const q=env.getBoundingClientRect(); const top=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2); return {open:cp.classList.contains('open'),R:!!(R&&getComputedStyle(R).display!=='none'),env:!!(top&&env.contains(top)),der:q.right<=innerWidth}; });
 ok(r.open,'se abre el panel de Claude');
 ok(!r.R,'el cuadro derecho del inicio no queda encima');
 ok(r.env&&r.der,'el botón «Enviar» se ve y se puede tocar: '+JSON.stringify(r));
 // ⤢ agrandar a pantalla completa y volver
 const full=()=>p.evaluate(()=>{ const x=[...document.querySelectorAll('#cPanel button')].find(b=>/Agrandar/.test(b.title||'')); x.click(); });
 await full(); await p.waitForTimeout(900);
 const f1=await p.evaluate(()=>{ const q=document.getElementById('cPanel').getBoundingClientRect(), L=document.getElementById('homeSideL'); return {w:Math.round(q.width),h:Math.round(q.height),iw:innerWidth,ih:innerHeight,L:!!(L&&getComputedStyle(L).display!=='none')}; });
 ok(f1.w===f1.iw&&f1.h===f1.ih&&!f1.L,'⤢ agranda Claude a toda la pantalla: '+JSON.stringify(f1));
 await full(); await p.waitForTimeout(900);
 const f2=await p.evaluate(()=>Math.round(document.getElementById('cPanel').getBoundingClientRect().width)); ok(f2<1000,'⤢ otra vez lo vuelve a su lugar ('+f2+' px)');
 await p.evaluate(()=>{ const x=[...document.querySelectorAll('#cPanel button')].find(b=>b.textContent.trim()==='✕'||/Cerrar/.test(b.title||'')); x&&x.click(); }); await p.waitForTimeout(1500);
 const r2=await p.evaluate(()=>{ const c=document.getElementById('ciudad'); return {panes:document.getElementById('paneArea').classList.contains('has-panes'),ciudad:!!(c&&!c.hidden),donde:(document.querySelector('#ciudad .cy-crumb')||{}).textContent||''}; });
 ok(!r2.panes&&r2.ciudad&&/Torre de comunicaciones/.test(r2.donde),'al cerrar Claude se vuelve a la Torre de comunicaciones (el mismo camino): '+JSON.stringify(r2).slice(0,160));
 // otra ventana de la torre (Ajustes): los cuadros del inicio no quedan encima
 await p.evaluate(()=>window.__city.open()); await p.waitForTimeout(600);
 await p.evaluate(()=>window.__city.run('t:Ajustes')); await p.waitForTimeout(1800);
 const g=await p.evaluate(()=>{ const sh=document.querySelector('.sheet.open'); const vis=e=>e&&getComputedStyle(e).display!=='none'; return {sheet:sh?sh.id:'',L:vis(document.getElementById('homeSideL')),R:vis(document.getElementById('homeSideR'))}; });
 ok(g.sheet&&!g.L&&!g.R,'con «Ajustes» abierto desde la Ciudad no hay cuadros encima: '+JSON.stringify(g));
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
