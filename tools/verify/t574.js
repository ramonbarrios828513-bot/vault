// v1313 · lectura y cierres: (1) ☰ Menú se ve entero mientras leés y su ✕ lo cierra · (2) «Todas las herramientas» abre el menú de verdad · (3) «Mis herramientas» explica qué es y su «Cerrar» no queda tapado · (4) «✖ Cerrar lectura» con tres opciones claras y aviso para seguir
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:650}});
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); });
 // (2) ficha «Todas las herramientas» del inicio
 await p.evaluate(()=>{ const t=[...document.querySelectorAll('.home-side [data-hsa="tools"]')][0]; t.click(); }); await p.waitForTimeout(700);
 let r=await p.evaluate(()=>{ const m=document.getElementById('menuPane'); const vis=e=>e&&getComputedStyle(e).display!=='none'; const x=m.querySelector('[data-mn="close"]'); const q=x.getBoundingClientRect(); const top=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2); return {open:m.classList.contains('open'),sheet:!!document.querySelector('.sheet.open'),L:vis(document.getElementById('homeSideL')),R:vis(document.getElementById('homeSideR')),x:!!(top&&x.contains(top)),h:Math.round(m.getBoundingClientRect().height)}; });
 ok(r.open&&!r.sheet,'«Todas las herramientas» abre el menú con todas las herramientas');
 ok(!r.L&&!r.R&&r.x,'los cuadros del inicio no tapan el menú y su ✕ se puede tocar: '+JSON.stringify(r));
 await p.evaluate(()=>document.querySelector('#menuPane [data-mn="close"]').click()); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>!document.getElementById('menuPane').classList.contains('open')&&getComputedStyle(document.getElementById('homeSideR')).display!=='none'),'la ✕ cierra el menú y vuelven los cuadros del inicio');
 // (3) «Mis herramientas» (lo creado a pedido)
 await p.evaluate(()=>{ window.__city.open(); window.__city.run('m:tools'); }); await p.waitForTimeout(1200);
 r=await p.evaluate(()=>{ const sh=document.querySelector('.sheet.open'); const c=[...sh.querySelectorAll('button')].find(b=>b.textContent.trim()==='Cerrar'); const q=c.getBoundingClientRect(); const top=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2); return {id:sh.id,txt:sh.innerText.slice(0,600),cerrar:!!(top&&c.contains(top)),b2:sh.querySelectorAll('[data-tl2]').length}; });
 ok(/hechas a tu pedido/.test(r.txt)&&/Todavía no pediste ninguna/.test(r.txt)&&r.b2===2,'«Mis herramientas» explica qué es, por qué está vacío y cómo pedir');
 ok(r.cerrar,'su botón «Cerrar» no queda tapado');
 await p.click('.sheet.open [data-tl2="menu"]'); await p.waitForTimeout(600);
 ok(await p.evaluate(()=>!document.querySelector('.sheet.open')&&document.getElementById('menuPane').classList.contains('open')),'«☰ Ver todas las herramientas del Baúl» lleva al menú');
 await p.evaluate(()=>{ document.querySelector('#menuPane [data-mn="close"]').click(); try{ window.__cyret.go(true); }catch(e){} window.__city.close(); }); await p.waitForTimeout(500);
 // (1) leyendo un archivo, en Hojas
 await p.evaluate(()=>window.__rd.open('guia-empresa-py')); await p.waitForTimeout(2200);
 await p.evaluate(()=>{ const h=document.querySelector('#viewSw [data-vm="hojas"]'); h&&h.click(); }); await p.waitForTimeout(700);
 await p.click('#btnMenu'); await p.waitForTimeout(700);
 r=await p.evaluate(()=>{ const m=document.getElementById('menuPane'), q=m.getBoundingClientRect(); const x=m.querySelector('[data-mn="close"]'), xq=x.getBoundingClientRect(); const top=document.elementFromPoint(xq.left+xq.width/2,xq.top+xq.height/2); return {h:Math.round(q.height),top:Math.round(q.top),ih:innerHeight,x:!!(top&&x.contains(top)),sh:getComputedStyle(m).flexShrink}; });
 ok(r.h>=Math.min(300,Math.floor(r.ih*0.56))-2&&r.top>=0&&r.top<r.ih/2&&r.sh==='0','leyendo, ☰ Menú se abre a la vista y no se aplasta: '+JSON.stringify(r));
 await p.evaluate(()=>document.querySelector('#menuPane [data-mn="close"]').click()); await p.waitForTimeout(400);
 ok(r.x&&await p.evaluate(()=>!document.getElementById('menuPane').classList.contains('open')),'y su ✕ lo cierra');
 // (4) ✖ Cerrar lectura
 await p.evaluate(()=>{ const n=[...document.querySelectorAll('button')].find(b=>/^Siguiente|^▶▶|⏭/.test(b.textContent.trim())&&b.offsetParent); }); 
 await p.waitForTimeout(1000); ok(await p.evaluate(()=>{ const b=document.getElementById('rcBtn'); return !!b&&!b.hidden&&/Cerrar lectura/.test(b.textContent); }),'en la lectura hay un botón «✖ Cerrar lectura»');
 await p.click('#rcBtn'); await p.waitForTimeout(400);
 const op=await p.evaluate(()=>document.getElementById('rcOv').innerText);
 ok(/seguir después en el mismo lugar/.test(op)&&/que me avise para seguir/.test(op)&&/ya terminé/.test(op)&&/Seguir leyendo/.test(op),'ofrece: seguir después en el mismo lugar · que me avise · ya terminé · seguir leyendo');
 await p.click('#rcOv [data-rc="no"]'); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>!document.getElementById('rcOv')&&!document.getElementById('viewReader').classList.contains('no-file')),'«Seguir leyendo» no cierra nada');
 await p.click('#rcBtn'); await p.waitForTimeout(300); await p.click('#rcOv [data-rc="avisar"][data-m="30"]'); await p.waitForTimeout(900);
 r=await p.evaluate(()=>({home:document.getElementById('viewReader').classList.contains('no-file'),rems:window.__rc.rems().map(x=>x.id+':'+Math.round((x.at-Date.now())/60000))}));
 ok(r.home&&r.rems.length===1&&/guia-empresa-py:(29|30)/.test(r.rems[0]),'«avisame en 30 min» cierra la lectura y deja el aviso anotado: '+r.rems.join());
 await p.evaluate(()=>{ window.__rc.rems()[0].at=Date.now()-1000; window.__rc.due(); }); await p.waitForTimeout(500);
 ok(/Es hora de seguir leyendo/.test(await p.evaluate(()=>(document.getElementById('rcDue')||{}).innerText||'')),'cuando llega la hora aparece el aviso «Es hora de seguir leyendo»');
 await p.click('#rcDue [data-rd="si"]'); await p.waitForTimeout(2500);
 ok(await p.evaluate(()=>window.__rd.mat()&&window.__rd.mat().id==='guia-empresa-py'&&!document.getElementById('viewReader').classList.contains('no-file')&&window.__rc.rems().length===0),'«Abrir ahora» vuelve a esa lectura y borra el aviso');
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
