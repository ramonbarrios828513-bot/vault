// v1266 · «Volver al inicio» dentro de un módulo va al inicio, no reabre una ventana vieja (ej.: 📺 Videos)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup();
 const r=await p.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); const mk=(id,html)=>{ const d=document.createElement('div'); d.className='big-ov'; d.id=id; d.hidden=true; d.innerHTML=html; document.body.appendChild(d); return d; };
  const V=mk('tVid','<b>📺 Videos</b><button class="go">abrir otro</button>'), X=mk('tX','<b>Otro</b><button class="home">⬅ Volver al inicio</button><button class="bk">⬅ Volver</button>');
  V.querySelector('.go').onclick=()=>{ V.hidden=true; X.hidden=false; }; X.querySelector('.home').onclick=()=>{ X.hidden=true; }; X.querySelector('.bk').onclick=()=>{ X.hidden=true; };
  V.hidden=false; await w(100); V.querySelector('.go').click(); await w(200);
  X.querySelector('.bk').click(); await w(400); const backOk=!V.hidden; // Volver normal: vuelve a Videos
  V.querySelector('.go').click(); await w(200); X.querySelector('.home').click(); await w(400); const homeOk=V.hidden;
  V.remove(); X.remove(); return {backOk,homeOk}; });
 ok(r.backOk,'«⬅ Volver» sigue volviendo a la pantalla anterior');
 ok(r.homeOk,'«⬅ Volver al inicio» NO reabre la ventana vieja (Videos)');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
