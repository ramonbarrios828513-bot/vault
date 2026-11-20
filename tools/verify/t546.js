// v1306 · una ventana vieja no queda pegada: con la Calculadora abierta debajo, al tocar Planilla desde el inicio se ve la Planilla (y la Calculadora se cierra); Modo oficina → Calculadora → Volver sigue volviendo a Modo oficina
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const vis=()=>p.evaluate(()=>[].slice.call(document.querySelectorAll('.big-ov:not([hidden])')).map(x=>x.id).filter(x=>x!=='home'&&x!=='ciudad').join(','));
 const cl=async(s,w)=>{ await p.evaluate((s)=>document.querySelector(s).click(),s); await p.waitForTimeout(w||900); };
 await cl('[data-plopen]',1400); await cl('[data-caopen]'); ok(await vis()==='calcx','Planilla y después Calculadora: queda solo la Calculadora: '+await vis());
 await cl('[data-plopen]',1400); ok(await vis()==='planilla','al tocar Planilla se ve la Planilla, no la Calculadora: '+await vis());
 await cl('#planilla .bo-x, #planilla [data-pl="x"]',900).catch(()=>{}); await p.evaluate(()=>{ const a=document.getElementById('planilla'); if(a&&!a.hidden){ const v=[...a.querySelectorAll('button')].find(x=>/Volver/.test(x.innerText)); v&&v.click(); } }); await p.waitForTimeout(900);
 ok(await vis()==='','Volver en la Planilla vuelve al inicio (no reaparece la Calculadora): '+await vis());
 await cl('[data-ofopen]'); await cl('#oficina [data-oft]'); ok(await vis()==='calcx','Modo oficina → Calculadora');
 await cl('#calcx .bo-x',900); ok(await vis()==='oficina','⬅ Volver vuelve a Modo oficina: '+await vis());
 await cl('#oficina .bo-x',900); ok(await vis()==='','y otro Volver, al inicio');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
