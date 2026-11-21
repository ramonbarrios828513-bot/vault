// v1313 · 🏙️ VOLVER POR EL MISMO CAMINO: lo que se abre desde la Ciudad vuelve al edificio de donde saliste (Volver, Esc o la barrita) · «✈️ Inicio» sale de una vez · 🏠 también · dentro de la Ciudad, Esc sube un nivel
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:800}});
 const st=()=>p.evaluate(()=>{ const c=document.getElementById('ciudad'); const vis=e=>e&&!e.hidden&&getComputedStyle(e).display!=='none'; return {ciudad:vis(c),donde:((document.querySelector('#ciudad .cy-crumb')||{}).textContent||'').replace(/\s+/g,' ').trim(),bar:!!document.getElementById('cyRetBar'),bigs:[...document.querySelectorAll('.big-ov')].filter(vis).map(e=>e.id).join(','),ret:window.__cyret.get()}; });
 const enter=async(pathToBuilding,a)=>{ await p.evaluate(([pp,a])=>{ window.__city.open(); window.__city.go(pp); window.__city.run(a); },[pathToBuilding,a]); await p.waitForTimeout(1800); };
 // 1) una herramienta de pantalla completa (Gestión de cheques) desde el Distrito Financiero
 await enter(['finanzas'],'f:tes'); let s=await st();
 const fin=await p.evaluate(()=>window.__city.CITY.map(d=>d.id+':'+d.n).join(' | '));
 if(!/tesoreria/.test(s.bigs)){ console.log('edificios: '+fin); }
 ok(/tesoreria/.test(s.bigs)&&!s.ciudad&&s.bar,'entrar a «Gestión de cheques» desde la Ciudad: se abre y aparece la barrita de regreso: '+JSON.stringify(s).slice(0,200));
 const lbl=await p.evaluate(()=>document.querySelector('#cyRetBar [data-cyret="step"]').textContent); ok(/Volver a/.test(lbl)&&/Financiero/.test(lbl),'la barrita dice a dónde vuelve: «'+lbl+'»');
 await p.evaluate(()=>{ const x=[...document.querySelectorAll('#tesoreria button')].find(b=>/Volver|Cerrar|✕/.test(b.textContent)); x.click(); }); await p.waitForTimeout(1200); s=await st();
 ok(s.ciudad&&/Financiero/.test(s.donde)&&!s.bar,'al tocar «Volver» de la herramienta se vuelve al Distrito Financiero: '+s.donde.slice(0,90));
 // 2) Esc dentro de la ciudad sube un nivel y después cierra
 await p.keyboard.press('Escape'); await p.waitForTimeout(500); s=await st(); ok(s.ciudad&&!/Financiero/.test(s.donde),'Esc dentro del edificio sube a la ciudad: '+s.donde.slice(0,60));
 await p.keyboard.press('Escape'); await p.waitForTimeout(500); s=await st(); ok(!s.ciudad,'Esc en la ciudad la cierra (inicio)');
 // 3) Esc fuera: vuelve al edificio
 await enter(['finanzas'],'f:tes'); console.log('  (foco: '+await p.evaluate(()=>document.activeElement.tagName+'#'+document.activeElement.id+' · '+[...document.querySelectorAll('.ask-ov, .rh-pop, .node-menu, .hojas-pop, .ico-ov, .vt-ov, .tap-info')].map(e=>e.className).join(','))+')'); await p.keyboard.press('Escape'); await p.waitForTimeout(400); if(!(await st()).ciudad){ await p.keyboard.press('Escape'); } await p.waitForTimeout(1200); s=await st();
 ok(s.ciudad&&/Financiero/.test(s.donde)&&!/tesoreria/.test(s.bigs),'Esc en la herramienta vuelve al Distrito Financiero');
 // 4) ✈️ Inicio: sale de una vez
 await enter(['finanzas'],'f:tes'); await p.click('#cyRetBar [data-cyret="fly"]'); await p.waitForTimeout(1200); s=await st();
 ok(!s.ciudad&&!s.bigs&&!s.bar&&s.ret===null,'«✈️ Inicio» cierra todo y queda en el inicio: '+JSON.stringify(s).slice(0,120));
 // 5) el botón de la barrita «⬅ Volver a…»
 await enter(['finanzas'],'f:tes'); await p.click('#cyRetBar [data-cyret="step"]'); await p.waitForTimeout(1000); s=await st();
 ok(s.ciudad&&/Financiero/.test(s.donde)&&!/tesoreria/.test(s.bigs),'«⬅ Volver a…» de la barrita vuelve al edificio');
 await p.evaluate(()=>window.__city.close());
 // 6) una sala que va al inicio mismo (Mis archivos) no rebota a la ciudad
 await p.evaluate(()=>{ window.__city.open(); window.__city.run('f:files'); }); await p.waitForTimeout(7500); s=await st();
 ok(!s.ciudad&&!s.bar,'«Mis archivos» (que es el inicio) no rebota a la ciudad y la barrita se va sola');
 // 7) 🏠 sale de una vez
 await enter(['finanzas'],'f:tes'); await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); document.querySelector('.home-btn').click(); }); await p.waitForTimeout(1200); s=await st();
 ok(!s.ciudad&&s.ret===null,'🏠 no vuelve a la ciudad');
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
