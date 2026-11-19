// v1269 · 🧾 Caja inteligente con botón visible: inicio (panel Trabajo), Cierre de caja, Gestión de cheques
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1600,height:900}});
 const vis=()=>p.evaluate(()=>{ const v=document.getElementById('ventas'); return !!(v&&!v.hidden&&v.offsetHeight>0&&v.querySelector('[data-vt="tab"]')); });
 const close=async()=>{ await p.evaluate(()=>{ const x=document.querySelector('#ventas [data-vt="x"]'); x&&x.click(); }); await p.waitForTimeout(400); };
 const hs=await p.evaluate(()=>{ try{ window.hsPaint&&hsPaint(); }catch(e){} return !!document.querySelector('[data-vtopen]'); });
 const src=await p.evaluate(()=>document.documentElement.innerHTML.includes("'vtopen', '1', '🧾'"));
 ok(src,'el panel 💼 Trabajo del inicio tiene 🧾 Caja inteligente');
 // desde Cierre de caja
 await p.evaluate(()=>{ const b=document.createElement('button'); b.setAttribute('data-czopen','1'); document.body.appendChild(b); b.click(); }); await p.waitForTimeout(700);
 const inCz=await p.evaluate(()=>!!document.querySelector('#cierre [data-vtopen]'));
 ok(inCz,'en 💵 Cierre de caja aparece el botón 🧾 Caja inteligente');
 if(inCz){ await p.click('#cierre [data-vtopen]'); await p.waitForTimeout(700); ok(await vis(),'tocando el botón se abre la Caja inteligente encima'); await close(); }
 // desde cualquier botón data-vtopen
 await p.evaluate(()=>{ const b=document.createElement('button'); b.setAttribute('data-vtopen','1'); document.body.appendChild(b); b.click(); }); await p.waitForTimeout(700);
 ok(await vis(),'cualquier botón 🧾 abre la caja');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
