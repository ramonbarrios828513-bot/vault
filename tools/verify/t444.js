// v1250 · 💻 módulo Informática: 8 lecciones (compu por dentro, discos y espacio, Baúl, archivos, BIOS y teclado, redes, cámaras, mantenimiento)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}});
 await p.evaluate(()=>window.__inf.open()); await p.waitForTimeout(600);
 const n=await p.evaluate(()=>document.querySelectorAll('#infAula [data-inft]').length); ok(n===9,'9 lecciones: las 8 de siempre más «Laravel y Python juntos» ('+n+')');
 const tx=[]; for (const id of ['pc','disk','baul','arch','bios','red','cam','mant']) { await p.evaluate(i=>document.querySelector('#infAula [data-inft="'+i+'"]').click(),id); await p.waitForTimeout(150); tx.push(await p.evaluate(()=>document.querySelector('#infAula .inf-mod h2').innerText)); }
 console.log('   '+tx.join(' | '));
 ok(/BIOS/.test(tx[4]) && /Redes/.test(tx[5]) && /Cámaras/.test(tx[6]),'cada lección se abre');
 await p.evaluate(()=>document.querySelector('#infAula [data-inft="baul"]').click()); await p.waitForTimeout(200);
 ok(await p.evaluate(()=>/depósito grande/.test(document.getElementById('infAula').innerText)),'explica el almacén grande del Baúl');
 await p.screenshot({path:'/tmp/claude-0/s130/inf.png'});
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
