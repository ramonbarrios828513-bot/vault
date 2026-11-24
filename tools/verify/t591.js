// v1330 · ♟️ en el Ajedrez y las Damas la barra «🔊 Leyendo» no aparece encima del juego; fuera del juego sigue apareciendo
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}});
 const bar=()=>p.evaluate(()=>{ const x=document.getElementById('sayBar'); return !!(x&&!x.hidden&&x.getClientRects().length); });
 await p.evaluate(()=>window.__chz.open()); await p.waitForTimeout(1500);
 let s=await p.evaluate(()=>({aj:!!(document.getElementById('ajedrez')&&!document.getElementById('ajedrez').hidden),voz:(document.querySelector('#ajedrez [data-chz="voz"]')||{}).textContent}));
 ok(s.aj&&/🔊/.test(s.voz||''),'el ajedrez abre con la voz prendida ('+s.voz+')');
 let seen=false; for(let i=0;i<12;i++){ if(await bar()) seen=true; await p.waitForTimeout(150); }
 ok(!seen,'con el ajedrez abierto la barra «🔊 Leyendo» no se muestra encima del juego');
 await p.evaluate(()=>document.querySelector('#ajedrez [data-chz="hint"]')&&document.querySelector('#ajedrez [data-chz="hint"]').click()); seen=false; for(let i=0;i<12;i++){ if(await bar()) seen=true; await p.waitForTimeout(150); }
 ok(!seen,'al pedir una pista tampoco aparece la barra');
 const g=await p.evaluate(()=>{ window.__sayES591('Te conviene mover el alfil. Segunda frase.'); const x=document.getElementById('sayBar'); return !!(x&&!x.hidden); });
 ok(!g,'aunque la voz esté leyendo, dentro del juego la barra queda escondida');
 await p.evaluate(()=>document.querySelector('#ajedrez [data-chz="voz"]').click()); await p.waitForTimeout(400);
 s=await p.evaluate(()=>({voz:document.querySelector('#ajedrez [data-chz="voz"]').textContent,sp:!!(window.speechSynthesis&&speechSynthesis.speaking)}));
 ok(/🔇/.test(s.voz),'el 🔊 de arriba apaga la voz del juego (queda 🔇)');
 await p.evaluate(()=>document.querySelector('#ajedrez [data-chz="voz"]').click()); await p.waitForTimeout(300);
 await p.evaluate(()=>document.querySelector('#ajedrez [data-chz="x"]').click()); await p.waitForTimeout(500);
 const r=await p.evaluate(()=>{ window.__sayES591('Esto es una prueba de lectura. Segunda frase de la prueba.'); const x=document.getElementById('sayBar'); return !!(x&&!x.hidden); });
 ok(r,'fuera del juego la barra de lectura sigue apareciendo');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
