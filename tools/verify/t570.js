// v1313 · 🖍️ Pizarrón: entra entero en la pantalla de la notebook — las hojas arriba y las herramientas abajo se ven a la vez, sin que «← Volver» tape ninguna
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:650}});
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); window.__ateneo.goSala('pizarra'); }); await p.waitForTimeout(1200);
 await p.evaluate(()=>document.querySelector('[data-pzb-tab]').click()); await p.waitForTimeout(1200);
 const r=await p.evaluate(()=>{ const q=s=>document.querySelector(s).getBoundingClientRect(); const top=q('.pzb-top'), bd=q('.pzb-board'), cv=q('#pzbCv'); const btn=[...document.querySelectorAll('.pzb-tools button')].map(e=>e.getBoundingClientRect()); const vol=[...document.querySelectorAll('button')].filter(e=>/^\s*←\s*Volver\s*$/.test(e.textContent)&&getComputedStyle(e).position==='fixed'||(/Volver/.test(e.textContent)&&e.closest('[style*="fixed"],.at-back-fab'))).map(e=>e.getBoundingClientRect())[0]; const tapa=vol?btn.filter(x=>x.left<vol.right&&x.right>vol.left&&x.top<vol.bottom&&x.bottom>vol.top).length:0; return {ih:innerHeight,top:Math.round(top.top),toolsBottom:Math.round(Math.max.apply(null,btn.map(x=>x.bottom))),bw:Math.round(bd.width),bh:Math.round(bd.height),cv:Math.abs(cv.width-bd.width)<2&&Math.abs(cv.height-bd.height)<2,n:btn.length,tapa}; });
 ok(r.top>=0&&r.toolsBottom<=r.ih,'las hojas (arriba) y las herramientas (abajo) entran en la misma pantalla: '+JSON.stringify(r));
 ok(r.bw>1000&&r.bh>=220,'el pizarrón sigue ocupando todo el ancho');
 ok(r.cv,'el dibujo ocupa todo el pizarrón');
 ok(r.tapa===0,'«← Volver» no tapa ninguna herramienta');
 // se puede escribir: doble toque desbloquea y el trazo queda guardado
 const n0=await p.evaluate(()=>JSON.stringify(window.__pzb.pages()).length);
 const bb=await p.evaluate(()=>{ const q=document.querySelector('#pzbCv').getBoundingClientRect(); return {x:q.left+q.width/2,y:q.top+q.height/2}; });
 await p.mouse.dblclick(bb.x,bb.y); await p.waitForTimeout(400);
 await p.mouse.move(bb.x-100,bb.y); await p.mouse.down(); await p.mouse.move(bb.x,bb.y+30,{steps:6}); await p.mouse.move(bb.x+120,bb.y-20,{steps:6}); await p.mouse.up(); await p.waitForTimeout(700);
 const n1=await p.evaluate(()=>JSON.stringify(window.__pzb.pages()).length);
 ok(n1>n0,'se puede escribir en el pizarrón ('+n0+' → '+n1+')');
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
