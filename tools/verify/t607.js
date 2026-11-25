// v1341 · 📍 barra «dónde estás» en todos los módulos (Ciudad › edificio › módulo › herramienta) + «↩️ Volver a donde estabas»
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ for(const vp of [{width:1366,height:768},{width:390,height:800}]){ const {b,p,errs}=await setup({vp}); const W=vp.width+'px · ';
 await p.waitForTimeout(800);
 await p.evaluate(()=>{ const x=[...document.querySelectorAll('#ciudad [data-cyb],#ciudad [data-cy]')].find(e=>/Financiero/.test(e.innerText)); x&&x.click(); }); await p.waitForTimeout(600);
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(800);
 for(const [v,l] of [['apag','CHEQUES A PAGAR'],['carga','CARGAR CHEQUES NUEVOS']]){ await p.evaluate(v=>document.querySelector('#tesoreria .tes-tabs [data-v="'+v+'"]').click(),v); await p.waitForTimeout(1100);
  const r=await p.evaluate(()=>{ const n=document.getElementById('navCrumb'); return {t:n&&!n.hidden?n.innerText.replace(/\s+/g,' '):'', nb:Math.round(n.getBoundingClientRect().bottom), ot:Math.round(document.getElementById('tesoreria').getBoundingClientRect().top)}; });
  ok(/(Ciudad Nissi|🏙️).*(Distrito Financiero|🏦).*GESTION DE CHEQUES.*/.test(r.t)&&r.t.includes(l),W+'arriba dice: '+r.t);
  ok(r.ot>=r.nb-1,W+'la barra no tapa el módulo ('+r.ot+' ≥ '+r.nb+')');
  await p.evaluate(()=>{ const a=document.getElementById('tesoreria'); a.scrollTop=a.scrollHeight; }); await p.waitForTimeout(700);
  const s=await p.evaluate(()=>{ const n=document.getElementById('navCrumb').getBoundingClientRect(); return n.top===0&&n.height>20; }); ok(s,W+'al bajar hasta el fondo la barra sigue arriba'); }
 await p.evaluate(()=>document.querySelector('#tesoreria [data-tes="x"]').click()); await p.waitForTimeout(900);
 const bk=await p.evaluate(()=>[document.getElementById('navCrumb').hidden,(document.querySelector('#ciudad .nv-back')||{}).innerText||'']);
 ok(bk[0]&&/Volver a donde estabas.*CARGAR CHEQUES NUEVOS/.test(bk[1].replace(/\s+/g,' ')),W+'al salir, en la Ciudad aparece «↩️ Volver a donde estabas» ('+bk[1].replace(/\s+/g,' ').slice(0,90)+')');
 await p.click('#ciudad .nv-back .go'); await p.waitForTimeout(1300);
 const ro=await p.evaluate(()=>[!document.getElementById('tesoreria').hidden, window.__tes.ui.tab]); ok(ro[0]&&ro[1]==='carga',W+'tocándolo vuelve al mismo módulo y la misma herramienta ('+ro.join(',')+')');
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1000);
 const pl=await p.evaluate(()=>document.getElementById('navCrumb').innerText.replace(/\s+/g,' ')); ok(/Planilla inteligente/.test(pl),W+'en Planilla también: '+pl);
 await p.evaluate(()=>[...document.querySelectorAll('#navCrumb [data-nvm]')].find(b=>/GESTION/.test(b.innerText)).click()); await p.waitForTimeout(700);
 const up=await p.evaluate(()=>[document.getElementById('planilla').hidden,!document.getElementById('tesoreria').hidden]); ok(up[0]&&up[1],W+'tocar «GESTION…» en la barra cierra lo de arriba y te deja ahí');
 await p.evaluate(()=>[...document.querySelectorAll('#navCrumb [data-nvc]')].find(b=>/Ciudad Nissi/.test(b.title)).click()); await p.waitForTimeout(800);
 const cy=await p.evaluate(()=>[[...document.querySelectorAll('.big-ov:not(#ciudad)')].every(a=>a.hidden), /Ciudad Nissi/.test((document.querySelector('#ciudad .cy-crumb')||{}).innerText||''), !!document.querySelector('#ciudad [data-cycr]')]);
 ok(cy[0]&&cy[1]&&!cy[2],W+'tocar «Ciudad Nissi» vuelve al inicio de la Ciudad');
 await p.click('#ciudad .nv-back .no'); await p.waitForTimeout(300); ok(await p.evaluate(()=>!document.querySelector('#ciudad .nv-back')),W+'✕ quita el aviso de volver');
 ok(!errs.length,W+'sin errores '+errs.join(' | ')); await b.close(); }
 console.log(fail?'✘ t607 con fallas':'✔ t607 ok'); process.exit(fail?1:0); })();
