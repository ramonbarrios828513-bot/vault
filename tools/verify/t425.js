// v1237 · ⚡ negociación rápida por producto (también en celular): buscás, tocás y negociás igual que en la orden
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos .cp-b.y'); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>!!document.getElementById('rnQ') && document.activeElement.id==='rnQ'),'abre la búsqueda con el cursor listo');
 await p.fill('#rnQ','metf'); await p.waitForTimeout(200);
 ok(/Metformina/.test(await p.evaluate(()=>document.getElementById('rnL').innerText)),'encuentra el producto sin importar el proveedor');
 await p.press('#rnQ','Enter'); await p.waitForTimeout(1200);
 const N=await p.evaluate(()=>{ const A=window.__ar.st(); const n=A.negs[A.ui.ng]; return n?{rap:n.rap,l:n.lines.length,n:n.lines[0].n}:null; }); console.log('   '+JSON.stringify(N));
 ok(N && N.rap===1 && N.l===1 && /Metformina/.test(N.n),'se abre una orden rápida con ese producto');
 const r='#articulos [data-ngrowid="demo23"]';
 await p.fill(r+' [data-k="q"]','10'); await p.fill(r+' [data-k="pvp"]','10000'); await p.fill(r+' [data-k="d1"]','30'); await p.waitForTimeout(300);
 const f=await p.evaluate(r=>document.querySelector(r+' [data-ngcv$="|fac"]').innerText,r); ok(f==='7.000','negocia igual que en la orden: PVP 10.000 − 30 % = costo 7.000');
 ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'en el celular no se sale de la pantalla a los costados');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
