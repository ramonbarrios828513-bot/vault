// v1313 · 📱 lector en el celular con la Biblia abierta: la barra de arriba queda en 2 filas parejas (sin un botón suelto en una tercera), la etiqueta de versión no tapa botones y «Cita»/«Ocultar» van juntos
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}});
 await p.route('**/_blob/**', r=>{ const nm=['Génesis','Éxodo','Levítico','Números','Deuteronomio','Josué','Jueces','Rut','Amós','Mateo','Marcos','Juan']; r.fulfill({contentType:'application/json',body:JSON.stringify({books:nm.map((n,i)=>({n:n,t:i<9?'AT':'NT',c:[1,2,3].map(c=>[1,2,3,4,5,6].map(v=>'Texto de prueba del versículo '+v+' del capítulo '+c+' de '+n+'.'))}))})}); });
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.remove()); window.__rd.open(); }); await p.waitForTimeout(4000);
 ok((await p.evaluate(()=>window.__rd.mat())).books,'la Biblia se abre');
 const r=await p.evaluate(()=>{ const vis=[...document.getElementById('topBar').children].filter(e=>e.offsetParent&&e.getBoundingClientRect().width>0); const tops=[...new Set(vis.map(e=>Math.round(e.getBoundingClientRect().top)))]; const rows=tops.map(t=>vis.filter(e=>Math.round(e.getBoundingClientRect().top)===t).length); const vt=document.getElementById('verTag').getBoundingClientRect(); const tapa=vis.filter(e=>{ const q=e.getBoundingClientRect(); return q.top<vt.bottom-1&&q.left<vt.right; }).length; const cortado=vis.filter(e=>e.getBoundingClientRect().right>innerWidth+1).length; const a=document.querySelector('[data-bgx="type"]').getBoundingClientRect(), c=document.querySelector('[data-bgx="close"]').getBoundingClientRect(); return {n:vis.length,rows,tapa,cortado,juntos:Math.abs(a.top-c.top)<3}; });
 ok(r.rows.length===2&&Math.min.apply(null,r.rows)>=4,'la barra de arriba queda en 2 filas parejas: '+JSON.stringify(r));
 ok(r.tapa===0,'la etiqueta de versión no tapa ningún botón');
 ok(r.cortado===0,'ningún botón de arriba queda cortado');
 ok(r.juntos,'«Cita» y «Ocultar» quedan en la misma fila');
 await p.click('[data-bgx="close"]'); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>!document.querySelector('[data-bgx="close"]')||!document.querySelector('[data-bgx="close"]').offsetParent),'«Ocultar» sigue funcionando');
 await p.setViewportSize({width:1366,height:800}); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>getComputedStyle(document.getElementById('topBar')).display)!=='grid','en la compu la barra de arriba no cambia');
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
