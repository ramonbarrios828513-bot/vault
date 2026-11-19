// v1265 · tus archivos se ven solo al entrar a «📂 Mis archivos»; «Volver al inicio» los esconde; la Biblioteca sigue igual
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}}); await p.waitForTimeout(1000);
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>{ if(!/home/.test(x.id)) x.hidden=true; }); localStorage.setItem('nube-prev-le-mats', JSON.stringify([{id:'x1',title:'Contrato viejo',text:'hola',created:1}])); });
 await p.evaluate(()=>window.__ivFindFiles()); await p.waitForTimeout(500); await p.evaluate(()=>[...document.querySelectorAll('.ico-ov [data-ff="get"]')].pop().click()); await p.waitForTimeout(500);
 await p.evaluate(()=>document.querySelectorAll('.ico-ov').forEach(x=>x.remove())); await p.evaluate(()=>window.__ivFindFiles()); await p.waitForTimeout(500);
 await p.evaluate(()=>{ const s=[...document.querySelectorAll('.ico-ov [data-ff="show"]')].pop(); if(s) s.click(); document.querySelectorAll('.ico-ov').forEach(x=>x.remove()); document.querySelectorAll('.big-ov').forEach(x=>{ if(!/home/.test(x.id)) x.hidden=true; }); }); await p.waitForTimeout(500);
 const st=()=>p.evaluate(()=>({ rows:[...document.querySelectorAll('#homeList [data-hopen]')].length, abrir:!!document.querySelector('#homeList [data-hmfiles]'), back:!!document.querySelector('#homeList [data-hmback]'), grp:document.body.classList.contains('hm-fonly') }));
 await p.evaluate(()=>{ const x=document.createElement('button'); x.dataset.hmback='1'; document.body.appendChild(x); x.click(); x.remove(); }); await p.waitForTimeout(500);
 const z=await st(); ok(z.rows===0&&z.abrir,'el inicio NO muestra los archivos, solo «📂 Abrir mis archivos» ('+JSON.stringify(z)+')');
 await p.click('#homeList [data-hmfiles]'); await p.waitForTimeout(700);
 const a=await st(); ok(a.rows>=1&&a.back&&a.grp,'al entrar se ven los archivos y se esconden los otros botones ('+JSON.stringify(a)+')');
 await p.click('#homeList [data-hmback]'); await p.waitForTimeout(600);
 const c=await st(); ok(c.rows===0&&c.abrir&&!c.grp,'«Volver al inicio» esconde los archivos');
 await p.evaluate(()=>{ const t=[...document.querySelectorAll('[data-htab="lib"]')].find(x=>x.getClientRects().length); if(t) t.click(); }); await p.waitForTimeout(800);
 ok(await p.evaluate(()=>document.querySelectorAll('#homeList *').length>5),'la Biblioteca se muestra');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
