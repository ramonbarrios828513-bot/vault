// v1318 · 📐 Diseñador 2D entrando desde la Ciudad: tocar el lápiz o la pared habilita la edición y TRAZA (antes quedaba en «Solo mirar»), Esc corta el trazo sin sacarte de la obra, «Editar» no se pierde y la barra de vuelta no tapa los botones de abajo
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>{ const c=window.__city; c.open(); c.go(['obra']); c.run('m:arq'); }); await p.waitForTimeout(2500);
 const st=()=>p.evaluate(()=>{ const A=window.__arqState(), P=A&&A.P, a=document.getElementById('arq'); return {tool:A&&A.tool,lock:window.__lock.st().on,items:P&&P.items?P.items.length:0,arq:!!a&&!a.hidden,ask:!![...document.querySelectorAll('.ask-ov,.ico-ov')].find(x=>!x.hidden&&x.getClientRects().length&&/Hiciste cambios/.test(x.innerText))}; });
 await p.click('.aq-start >> text=Empezar la mía').catch(()=>{}); await p.waitForTimeout(800); await p.evaluate(()=>{ const x=[...document.querySelectorAll('#arq button, #arq [data-aqv]')].find(x=>x.dataset.aqv==='2d'||/^\s*\S*\s*2D\s*$/.test(x.textContent)); if(x) x.click(); }); await p.waitForTimeout(900); await p.click('.cf-hub >> text=Volver al plano').catch(()=>{}); await p.waitForTimeout(500);
 const s0=await st(); ok(s0.arq&&s0.lock&&s0.tool==='pan','entra en «Solo mirar» (candado puesto, herramienta mover)');
 const tap=async t=>{ const bx=await (await p.$('[data-aqt="'+t+'"]')).boundingBox(); await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2); await p.waitForTimeout(500); };
 const sv=await (await p.$('#aqSvg')).boundingBox(), cx=sv.x+sv.width/2, cy=sv.y+sv.height/2;
 await tap('pen'); const s1=await st(); ok(!s1.lock&&s1.tool==='pen','tocar el ✏️ lápiz con el candado puesto habilita la edición con el lápiz');
 await p.mouse.move(cx-150,cy-60); await p.mouse.down(); for(let i=0;i<12;i++){ await p.mouse.move(cx-150+i*20,cy-60+((i%2)?18:-18)); await p.waitForTimeout(25); } await p.mouse.up(); await p.waitForTimeout(700);
 const s2=await st(); ok(s2.items>s1.items,'el lápiz traza ('+s1.items+' → '+s2.items+' piezas)');
 await p.evaluate(()=>window.__lock.set(true)); await p.waitForTimeout(400); await tap('wall'); const s3=await st(); ok(!s3.lock&&s3.tool==='wall','con el candado puesto otra vez, tocar la 🧱 pared también habilita');
 await p.mouse.click(cx-160,cy+90); await p.waitForTimeout(300); await p.mouse.click(cx+120,cy+90); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(900);
 const s4=await st(); ok(s4.items>s2.items,'la pared se traza con dos clics ('+s2.items+' → '+s4.items+')'); ok(s4.arq&&!s4.ask,'Esc corta el trazo y NO te saca del diseñador ni pregunta por cerrar');
 // «Editar» no se redibuja bajo el dedo
 await p.evaluate(()=>window.__lock.set(true)); await p.waitForTimeout(400); const same=await p.evaluate(async()=>{ const b1=document.querySelector('#aqLock [data-lk="edit"]'); await new Promise(r=>setTimeout(r,800)); return b1===document.querySelector('#aqLock [data-lk="edit"]'); }); ok(same,'el botón ✏️ Editar no se reemplaza solo cada instante (el toque no se pierde)');
 await p.click('#aqLock [data-lk="edit"]'); await p.waitForTimeout(400); ok(!(await st()).lock,'✏️ Editar habilita');
 // la barra de vuelta a la ciudad: chica y a un costado
 const rb=await p.evaluate(()=>{ const r=document.getElementById('cyRetBar'); if(!r) return null; const q=r.getBoundingClientRect(); return {w:Math.round(q.width),l:Math.round(q.left),n:r.querySelectorAll('button').length}; }); ok(rb&&rb.w<=130&&rb.l>innerWidthOr(900),'la barra «volver a la ciudad» queda chica y a la derecha, sin tapar los botones de abajo ('+(rb?rb.w+' px de ancho, x='+rb.l:'no está')+')');
 ok(!errs.length,'sin errores de consola'+(errs.length?': '+errs.slice(0,2).join(' | '):''));
 await b.close(); console.log(fail?'fallas '+fail:'OK t579'); process.exit(fail?1:0); })();
function innerWidthOr(v){ return v; }
