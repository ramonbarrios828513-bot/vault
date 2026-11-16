// v1226 · 🧪 productos de prueba y 🔁 equivalentes / similares por composición (principio activo + concentración, sin importar el orden)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1300,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(1200);
 await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 ok(await p.evaluate(()=>Object.values(window.__ar.st().items).filter(x=>x.demo).length)===11,'se cargan 11 productos de prueba');
 ok(await p.evaluate(()=>{ const I=window.__ar.st().items; return window.__ar.eqKey(I.demo6)===window.__ar.eqKey(I.demo7); }),'«Paracetamol + Cafeína 500+65» y «Cafeína + Paracetamol 65+500» son equivalentes');
 await p.fill('#arQ','ibuprofeno 600 mg (lasca)'); await p.waitForTimeout(500); await p.click('#articulos [data-ar="eq"][data-id="demo0"]'); await p.waitForTimeout(600);
 const t=await p.evaluate(()=>document.querySelector('#articulos').innerText); console.log(t.slice(t.indexOf('EQUIVALENTES')-5, t.indexOf('EQUIVALENTES')+400).replace(/\n/g,' | '));
 ok(/EQUIVALENTES \(3\)/i.test(t) && /SIMILARES \(1\)/i.test(t),'Ibuprofeno 600: 3 equivalentes (Lasca, Indufar, Catedral) y 1 similar (400 mg)');
 ok(/Indufar/.test(t) && /Catedral/.test(t) && /cajas por mes/i.test(t),'muestra laboratorios y cuánto se vende entre todos');
 await p.click('#articulos [data-ar="tab"][data-v="lista"]'); await p.waitForTimeout(300); await p.click('#articulos [data-ar="demo0"]'); await p.waitForTimeout(200); await p.click('#articulos [data-ar="demo0"]'); await p.waitForTimeout(1200);
 ok(await p.evaluate(()=>Object.values(window.__ar.st().items).filter(x=>x.demo).length)===0,'«Borrar productos de prueba» los saca todos');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
