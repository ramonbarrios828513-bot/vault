// v1323 · «🗑️ Borrar datos de prueba» también saca de las ventas abiertas los renglones de productos de prueba (incluso si ya se habían borrado antes)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:800}});
 const st=()=>p.evaluate(()=>{ const k=Object.keys(localStorage).find(k=>{try{const j=JSON.parse(localStorage.getItem(k));return j&&j.arts&&j.tabs;}catch(e){return false;}}); return JSON.parse(localStorage.getItem(k)); });
 const nl=V=>V.tabs.reduce((a,t)=>a+t.lines.length,0);
 const si=async()=>{ await p.waitForTimeout(400); await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ask-ov,.ico-ov')].pop(); const b=o&&[...o.querySelectorAll('button')].find(x=>/s[ií]|borrar|aceptar|ok/i.test(x.innerText)&&!/cancel|no\b/i.test(x.innerText)); if(b) b.click(); }); await p.waitForTimeout(900); };
 await p.evaluate(()=>window.__vt.open()); await p.waitForTimeout(800);
 await p.evaluate(()=>document.querySelector('#ventas [data-vt="tdemo"]').click()); await p.waitForTimeout(1200);
 await p.fill('#vtQ','2900000100019'); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
 let V=await st(); ok(nl(V)>=1,'producto de prueba cargado en una venta abierta ('+nl(V)+')');
 await p.evaluate(()=>document.querySelector('#ventas [data-vt="tdel"]').click()); await si();
 V=await st(); ok(nl(V)===0,'al borrar los datos de prueba sale también de la venta abierta ('+nl(V)+')'); ok(!Object.keys(V.arts).some(k=>V.arts[k].demo),'no quedan fichas de prueba');
 // caso del dueño: ya había borrado y el renglón quedó huérfano
 await p.evaluate(()=>{ const k=Object.keys(localStorage).find(k=>{try{const j=JSON.parse(localStorage.getItem(k));return j&&j.arts&&j.tabs;}catch(e){return false;}}); const V=JSON.parse(localStorage.getItem(k)); V.tabs[0].lines.push({val:true,aid:'vademo1',pid:'caja',pn:'Caja',pt:'caja',n0:'Kitadol Forte',n:'Kitadol Forte · Caja x20',uq:20,pvp:100000,cost:35000,q:1}); V.tabs[0].lines.push({val:true,aid:'m1',n:'Artículo manual',n0:'Artículo manual',pvp:5000,cost:0,q:1}); localStorage.setItem(k,JSON.stringify(V)); });
 await p.reload(); await p.waitForTimeout(1500); await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); window.__vt.open(); }); await p.waitForTimeout(900);
 V=await st(); ok(nl(V)===2,'renglón huérfano de prueba + uno manual ('+nl(V)+')');
 await p.evaluate(()=>document.querySelector('#ventas [data-vt="tdel"]').click()); await si();
 V=await st(); ok(nl(V)===1&&V.tabs[0].lines[0].aid==='m1','se va el huérfano de prueba y el renglón manual queda');
 const er=errs.filter(e=>!/baúl cerrado/.test(e)); /* la recarga de la prueba cierra el baúl: no es un error de la app */ ok(!er.length,'sin errores '+er.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
