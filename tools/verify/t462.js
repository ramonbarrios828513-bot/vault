// v1258 · modo AUDITORÍA: 🧹 vaciar con ♻️ recuperar; arranca vacío y la sincronización NO lo vuelve a llenar con los días de otro aparato (que no está en auditoría)
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}, pla:true});
 const r=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; E.days['2026-06']={'1':{e:'06:30',s:'23:00'},'2':{e:'06:30',s:'23:00'}}; delete E.audSw; delete E.audW;
  window.__vaultSaveNow&&window.__vaultSaveNow(); const otro=JSON.parse(JSON.stringify(window.__memcGet())); // aparato viejo: junio con datos, sin auditoría
  E.audSw={'2026-06':{days:E.days['2026-06'],con:(E.con||{})['2026-06']||null}}; E.days['2026-06']={}; E.aud=E.aud||{}; E.aud['2026-06']=1; E.days['2026-06']['5']={e:'15:00',s:'23:00'};
  const MM=window.__memcGet(); const yo=JSON.parse(JSON.stringify(MM)); const ye=yo.pla.emps.find(x=>x.id===E.id); ye.days=JSON.parse(JSON.stringify(E.days)); ye.audSw=JSON.parse(JSON.stringify(E.audSw)); ye.mt=Date.now()+99999; yo.__mt=Object.assign({},yo.__mt||{},{pla:Date.now()+99999});
  const nm=window.__memcMerge(yo, otro); const ne=nm.pla.emps.find(x=>x.id===E.id);
  return {aud:Object.keys(ne.days['2026-06']||{}), real:Object.keys(((ne.audSw||{})['2026-06']||{}).days||{})}; });
 ok(r.aud.join()==='5','la auditoría de junio tiene solo lo cargado en auditoría ('+r.aud.join()+')');
 ok(r.real.join()==='1,2','los datos reales de junio quedan guardados aparte, no se pierden ('+r.real.join()+')');
 // 🧹 vaciar la auditoría y que otro aparato (también en auditoría, con datos viejos) no la vuelva a llenar
 const z=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; P.cur.emp=E.id; P.cur.mon='2026-06'; E.aud={'2026-06':1}; E.audSw={'2026-06':{days:{'1':{e:'06:30',s:'23:00'}},con:null}}; E.days['2026-06']={'3':{e:'00:00',s:'00:00'},'4':{e:'06:30',s:'23:00'}}; return 1; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1200); await p.evaluate(()=>{ window.confirm=()=>true; document.querySelectorAll('.k-party').forEach(x=>x.remove()); });
 ok(await p.evaluate(()=>!!document.querySelector('#planilla [data-plaz="zero"]')),'en auditoría aparece 🧹 Vaciar esta auditoría');
 const otro2=await p.evaluate(()=>JSON.stringify(window.__memcGet()));
 await p.evaluate(()=>document.querySelector('#planilla [data-plaz="zero"]').click()); await p.waitForTimeout(500);
 const z2=await p.evaluate((o2)=>{ const P=window.__pla.st(), E=P.emps[3]; const otro=JSON.parse(o2); const oe=otro.pla.emps.find(x=>x.id===E.id); oe.days['2026-06']={'3':{e:'00:00',s:'00:00'},'4':{e:'06:30',s:'23:00'}}; oe.aud={'2026-06':1}; oe.audSw={'2026-06':{days:{'1':{e:'06:30',s:'23:00'}}}}; delete oe.audZ;
  const yo=JSON.parse(JSON.stringify(window.__memcGet())); const ye=yo.pla.emps.find(x=>x.id===E.id); Object.assign(ye,JSON.parse(JSON.stringify({days:E.days,aud:E.aud,audSw:E.audSw,audZ:E.audZ,audBk:E.audBk}))); ye.mt=Date.now()+99999; yo.__mt=Object.assign({},yo.__mt||{},{pla:Date.now()+99999});
  const nm=window.__memcMerge(yo,otro); const ne=nm.pla.emps.find(x=>x.id===E.id); return {d:Object.keys(ne.days['2026-06']||{}), bk:((ne.audBk||{})['2026-06']||[]).length, real:Object.keys(((ne.audSw||{})['2026-06']||{}).days||{})}; },otro2);
 ok(z2.d.length===0,'después de vaciar, la sincronización no la vuelve a llenar ('+z2.d.join()+')');
 ok(z2.bk===1&&z2.real.join()==='1','queda la copia para ♻️ Recuperar y los datos reales intactos');
 await p.evaluate(()=>document.querySelector('#planilla [data-plaz="rec"]').click()); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>Object.keys(window.__pla.st().emps[3].days['2026-06']).join()==='3,4'),'♻️ Recuperar devuelve lo vaciado');
 ok(await p.evaluate(()=>((window.__pla.st().emps[3].audBk||{})['2026-06']||[]).length>=1),'la copia de seguridad sigue guardada después de recuperar');
 for (const k of ['pra','prc']) { await p.evaluate((k)=>{ document.querySelectorAll('iframe').forEach(f=>f.remove()); document.querySelector('#planilla [data-plaz="'+k+'"]').click(); },k); await p.waitForTimeout(700);
  const t=await p.evaluate(()=>{ const f=[...document.querySelectorAll('iframe')].pop(); try{ return f.contentDocument.body.innerText.slice(0,200); }catch(e){ return ''; } });
  ok(k==='pra'?/AUDITORÍA/.test(t):/COPIA DE SEGURIDAD/.test(t),'🖨️ '+(k==='pra'?'imprimir auditoría':'imprimir copia de seguridad')+' ('+t.slice(0,60)+')'); }
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
