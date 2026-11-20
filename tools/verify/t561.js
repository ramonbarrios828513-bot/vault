// v1311 · 💻 Informática: lección «Laravel y Python juntos» (limitaciones de Laravel, qué hace Python, cómo se combinan)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__inf.open()); await p.waitForTimeout(400);
 const tabs=await p.evaluate(()=>[...document.querySelectorAll('#infAula [data-inft]')].map(x=>x.textContent).join(' | '));
 ok(/Laravel y Python juntos/.test(tabs)&&/La computadora por dentro/.test(tabs),'la lección nueva aparece junto a las demás de 💻 Informática: '+tabs.slice(-90));
 await p.click('#infAula [data-inft="lapy"]'); await p.waitForTimeout(300);
 const tx=await p.evaluate(()=>document.getElementById('infAula').innerText.replace(/\s+/g,' '));
 ok(/Limitaciones de Laravel y PHP/i.test(tx)&&/Cómo trabajan juntos/i.test(tx)&&/Proyección a un año/i.test(tx)&&/Web de la competencia/i.test(tx)&&/Por dónde empezar/i.test(tx),'tiene las limitaciones, cómo trabajan juntos, los objetivos, el aviso sobre la competencia y por dónde empezar');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
