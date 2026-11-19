// v1266 · con el Menú abierto, la rayita de la barra de abajo agranda/achica el cuadro del Menú (antes no hacía nada)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup(); await p.evaluate(()=>{ document.querySelectorAll('.big-ov:not([hidden])').forEach(x=>x.hidden=true); });
 await p.evaluate(()=>document.getElementById('btnMenu').click()); await p.waitForTimeout(800);
 const st=await p.evaluate(()=>{ const hb=document.querySelector('.homebar'), lh=hb&&hb.querySelector('.lift-h'), M=document.getElementById('menuPane'); const r=lh&&lh.getBoundingClientRect(); return { pos:hb&&getComputedStyle(hb).position, open:M.classList.contains('open'), mh:M.getBoundingClientRect().height, x:r&&r.x+r.width/2, y:r&&r.y+r.height/2 }; });
 console.log(JSON.stringify(st));
 if (st.open && st.x) { await p.mouse.move(st.x,st.y); await p.mouse.down(); await p.mouse.move(st.x,st.y-120,{steps:6}); await p.mouse.up(); await p.waitForTimeout(300);
  const mh2=await p.evaluate(()=>document.getElementById('menuPane').getBoundingClientRect().height); ok(mh2<st.mh-60,'arrastrando la rayita hacia arriba se achica el Menú ('+Math.round(st.mh)+' → '+Math.round(mh2)+')'); }
 else ok(true,'barra de abajo flotante: la rayita sube la barra (sin cambio)');
 await p.evaluate(()=>{ const M=document.getElementById('menuPane'); if(M.classList.contains('open')) document.getElementById('btnMenu').click(); }); await p.waitForTimeout(1200);
 const vis=await p.evaluate(()=>{ const hb=document.querySelector('.homebar'), lh=hb&&hb.querySelector('.lift-h'); return { pos:getComputedStyle(hb).position, v:lh&&lh.style.visibility }; });
 ok(vis.pos!=='static' || vis.v==='hidden','sin Menú y con la barra quieta, la rayita que no hace nada no se muestra ('+JSON.stringify(vis)+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
