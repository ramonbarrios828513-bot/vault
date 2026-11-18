// v1262 · 📍 Mis direcciones del Baúl (Cloudflare, GitHub, Claude) con copiar, mapa y guía; nombres de la familia también en la central
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}});
 await p.evaluate(()=>window.__ivDirs()); await p.waitForTimeout(500);
 const t=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); return { txt:o?o.textContent:'', svg:!!(o&&o.querySelector('svg')), cp:o?o.querySelectorAll('[data-dir="cp"]').length:0 }; });
 ok(/baul-nissi\.pages\.dev/.test(t.txt)&&/github\.io\/vault/.test(t.txt)&&/claude\.ai\/artifact/.test(t.txt),'muestra las tres direcciones');
 ok(t.cp===3,'cada dirección tiene su botón «Copiar»');
 ok(t.svg&&/Cómo viaja un dato/.test(t.txt)&&/Cómo se publica/.test(t.txt)&&/BIOS/.test(t.txt),'tiene el mapa y la guía paso a paso (incluye el BIOS)');
 await p.evaluate(()=>document.querySelectorAll('.ico-ov').forEach(x=>x.remove())); await p.evaluate(()=>{ const x=document.createElement('button'); x.dataset.ivdirs='1'; document.body.appendChild(x); x.click(); x.remove(); }); await p.waitForTimeout(300); ok(await p.evaluate(()=>/Mis direcciones del Baúl/.test(([...document.querySelectorAll('.ico-ov')].pop()||{}).textContent||'')),'el botón «📍 Mis direcciones» del inicio la abre');
 const n=await p.evaluate(async()=>{ const M=window.__memcGet(); M.profN=[['ramon','Ramón','🧔','#1d4ed8','v']]; localStorage.removeItem('iv-profiles'); await new Promise(r=>setTimeout(r,4500)); return localStorage.getItem('iv-profiles'); });
 ok(/Ramón/.test(n||''),'si el navegador pierde los nombres, vuelven solos de la central');
 const sd=await p.evaluate(async()=>{ const M=window.__memcGet(); delete M.profN; localStorage.setItem('iv-profiles', JSON.stringify([['ramon','Ramón X','🧔','#1d4ed8','v']])); window.__sv=window.__sv||{}; return true; });
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
