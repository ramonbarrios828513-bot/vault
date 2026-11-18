// v1259 · empresa: 👁 «¿Qué es?» en cada campo con listas para elegir · Faltan completar: «✏️ Ir a cargar» y tocar la tarjeta entera lleva a cargar
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1100,height:1000}});
 await p.evaluate(()=>{ const c=window.__tes.st().cfg; c.emp={nom:'Nissifarma'}; window.__fcEmp.edit('e1'); }); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>document.querySelectorAll('.ico-ov [data-eye]').length)>=12,'cada campo tiene 👁 ¿Qué es?');
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); o.querySelector('[data-k="tipo"]').closest('label').querySelector('[data-eye]').click(); }); await p.waitForTimeout(200);
 ok(await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); const h=o.querySelector('[data-k="tipo"]').closest('label').querySelector('.tx-hlp'); return !h.hidden && /Persona física/.test(h.innerText); }),'👁 explica «Unipersonal = Persona física»');
 ok(await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); const i=o.querySelector('[data-k="iva"]'); return [...document.getElementById(i.getAttribute('list')).options].some(x=>/SIMPLE/.test(x.value)); }),'régimen con lista para elegir');
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(x=>x.remove()); const bx=document.getElementById('bx'); bx&&bx.remove(); window.__fc.open(); }); await p.waitForTimeout(800);
 ok(await p.evaluate(()=>/Ir a cargar/.test(document.getElementById('faltan').innerText)),'los ítems dicen «✏️ Ir a cargar»');
 await p.evaluate(()=>{ const it=[...document.querySelectorAll('#faltan .fc-it')].find(x=>/empresa/i.test(x.innerText)); it.querySelector('.fc-tx b').click(); }); await p.waitForTimeout(900);
 ok(await p.evaluate(()=>!!document.getElementById('fcEmpOv')),'tocar la tarjeta (no el botón) abre «Mis empresas»');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
