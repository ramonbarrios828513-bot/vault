// v1260 · «⬅ Volver» de una herramienta abierta desde Modo oficina vuelve a Modo oficina (no sale del módulo)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}});
 const vis=id=>p.evaluate(id=>{ const e=document.getElementById(id); return !!e&&!e.hidden; },id);
 await p.evaluate(()=>{ const x=document.createElement('button'); x.dataset.ofopen='1'; document.body.appendChild(x); x.click(); x.remove(); }); await p.waitForTimeout(500);
 ok(await vis('oficina'),'Modo oficina abierto');
 await p.evaluate(()=>document.querySelector('#oficina [data-oft]').click()); await p.waitForTimeout(600);
 ok(await vis('calcx') && !(await vis('oficina')),'la herramienta se abre');
 await p.evaluate(()=>document.querySelector('#calcx [data-cax]').click()); await p.waitForTimeout(600);
 ok(!(await vis('calcx')) && await vis('oficina'),'«Volver» regresa a Modo oficina');
 await p.evaluate(()=>document.querySelectorAll('#oficina [data-oft]')[2].click()); await p.waitForTimeout(600);
 await p.evaluate(()=>document.querySelector('#calcx [data-cax]').click()); await p.waitForTimeout(600);
 ok(await vis('oficina'),'otra vez: vuelve a Modo oficina');
 await p.evaluate(()=>document.querySelector('#oficina [data-ofx]').click()); await p.waitForTimeout(600);
 ok(!(await vis('oficina')) && !(await vis('calcx')),'«Volver» de Modo oficina sale sin reabrir la herramienta');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
