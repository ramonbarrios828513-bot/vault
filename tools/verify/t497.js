// v1267 · prueba de un día de trabajo: listas enteras en el cierre, barra de bloques finita al bajar, Tesorería baja hasta lo que se abrió, concepto nuevo con el cursor listo
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(900);
 const s=await p.evaluate(()=>{ const t=[...document.querySelectorAll('#cierre select')].filter(x=>x.getBoundingClientRect().width>0); const lab=t.map(x=>({w:x.getBoundingClientRect().width,p:x.parentElement.getBoundingClientRect().width})); return lab.filter(x=>x.p>150&&x.w<x.p*0.8).length; });
 ok(s===0,'las listas del cierre usan todo el ancho de su casilla ('+s+' cortadas)');
 const h0=await p.evaluate(()=>document.querySelector('#cierre .cz-blk').getBoundingClientRect().height);
 await p.evaluate(()=>{ const c=document.getElementById('cierre'); c.scrollTop=2200; }); await p.waitForTimeout(500); await p.evaluate(()=>window.__czStuck&&window.__czStuck());
 const h1=await p.evaluate(()=>{ const b=document.querySelector('#cierre .cz-blk'); return {h:b.getBoundingClientRect().height,st:b.classList.contains('cz-stuck')}; });
 ok(h1.st && h1.h<h0*0.7,'al bajar, «Bloques del cierre» queda finita ('+Math.round(h0)+' → '+Math.round(h1.h)+')');
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov:not([hidden])').forEach(x=>x.hidden=true); window.__tes.open(); }); await p.waitForTimeout(900);
 await p.click('#tesoreria button[data-v="prov"]'); await p.waitForTimeout(1300);
 const y=await p.evaluate(()=>{ const m=document.querySelector('#tesoreria .mod-ban'); return Math.round(m.getBoundingClientRect().top); });
 ok(y>=0 && y<300,'Tesorería: al tocar PROVEEDORES baja hasta lo que se abrió (queda a '+y+' px)');
 await p.click('#tesoreria button[data-v="gasto"]'); await p.waitForTimeout(1200); await p.click('[data-tes="tgNew"]'); await p.waitForTimeout(400);
 const f=await p.evaluate(()=>{ const a=document.activeElement; return a && a.closest('.ico-ov') && a.dataset.k; }); ok(f==='n','«Crear concepto»: el cursor ya está en el nombre ('+f+')');
 await p.setViewportSize({width:412,height:900}); await p.evaluate(()=>{ document.querySelectorAll('.big-ov:not([hidden])').forEach(x=>x.hidden=true); window.__cz.open(); }); await p.waitForTimeout(900); await p.evaluate(()=>document.getElementById('cierre').scrollTop=2500); await p.waitForTimeout(300);
 const tb=await p.evaluate(()=>{ const t=document.querySelector('#cierre .tes-tabs').getBoundingClientRect(); return Math.round(t.bottom); }); ok(tb<=0,'celular: el menú del cierre no queda pegado arriba tapando el formulario ('+tb+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
