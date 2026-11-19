// v1267 · los montos con «🧮 Contar billetes» se ven enteros (1.000.000 y no «1.»), en notebook y celular
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ for (const vp of [{width:1366,height:768},{width:412,height:900},{width:1024,height:700}]) { const {b,p,errs}=await setup({vp});
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(700);
 for (const k of ['ini','v.ef','deja']) { await p.click('#cierre [data-czden="'+k+'"]'); await p.waitForTimeout(250); await p.fill('.ico-ov [data-dnd="100000"]','10'); await p.click('.ico-ov [data-dn="ok"]'); await p.waitForTimeout(500); }
 const r=await p.evaluate(()=>['ini','v.ef','deja'].map(k=>{ const i=document.querySelector('#cierre input[data-czk="'+k+'"]'); return {k,v:i.value,w:Math.round(i.clientWidth),sw:i.scrollWidth}; }));
 r.forEach(x=>ok(x.v==='1.000.000' && x.sw<=x.w+2 && x.w>=110, vp.width+'px · '+x.k+' se ve entero: '+x.v+' (ancho '+x.w+', texto '+x.sw+')'));
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); }
 process.exit(fail?1:0); })();
