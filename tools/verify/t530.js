// v1291 · prevención: TODOS los botones de 📋 Faltan completar («Ir a cargar» / «Ver») se tocan uno por uno: ninguno da error y ninguno te deja en la pantalla de inicio
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 p.on('dialog',d=>d.dismiss().catch(()=>{}));
 const openF=async()=>{ await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(o=>o.remove()); document.querySelectorAll('.big-ov').forEach(o=>{ if(o.id!=='ciudad') o.hidden=true; }); document.querySelector('[data-fcopen]').click(); }); await p.waitForTimeout(600); };
 await openF(); const n=await p.evaluate(()=>document.querySelectorAll('#faltan [data-fc="go"]').length); ok(n>5,'hay '+n+' botones en Faltan completar');
 for(let i=0;i<n;i++){ await openF(); const n0=errs.length;
  const q=await p.evaluate((i)=>{ const b=document.querySelectorAll('#faltan [data-fc="go"]')[i]; if(!b) return null; let t=b, s=''; for(let k=0;k<4&&t;k++){ t=t.parentElement; if(t&&t.textContent.length>s.length&&t.textContent.length<300) s=t.textContent; } b.click(); return s.replace(/\s+/g,' ').slice(0,70); },i); await p.waitForTimeout(700);
  const st=await p.evaluate(()=>({vis:[...document.querySelectorAll('.big-ov')].filter(x=>!x.hidden&&x.id!=='ciudad').map(x=>x.id), ov:[...document.querySelectorAll('.ico-ov,[data-ak]')].length}));
  ok(errs.length===n0&&(st.vis.length||st.ov),'«'+q+'» → '+(st.vis.join(',')||(st.ov?'ventana':'INICIO'))+(errs.length>n0?' ERROR '+errs.slice(n0).join(' | '):'')); }
 await b.close(); process.exit(fail?1:0); })();
