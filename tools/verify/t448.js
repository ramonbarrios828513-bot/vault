// v1252 · desde dic-2026 sin turno híbrido ni extendido: se paga como turno común (meses anteriores sin cambios, el dato no se borra)
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 const r=await p.evaluate(()=>{ const P=window.__pla.st(), C=P.cfg, E0=P.emps[3];
  const nw=[0,1,2,3,4,5,6].map(i=>({e:'15:00',s:'23:00',off:i===0}));
  const run=(mon,tipo)=>{ const X=JSON.parse(JSON.stringify(E0)); delete X.aud; delete X.solo; X.sch=nw; X.tipo=tipo; const y=+mon.slice(0,4),m=+mon.slice(5,7),nd=new Date(y,m,0).getDate(); X.days={}; X.days[mon]={}; for(let d=1;d<=nd;d++){ const dt=new Date(y,m-1,d); if(dt.getDay()===0) continue; let f=false; try{f=!!plFerOf(mon,d)}catch(x){} if(f) continue; X.days[mon][d]={e:'06:30',s:'23:00'}; } const R=window.__pla.calc(X,mon,C); return {neto:Math.round(R.neto), tipo:X.tipo}; };
  return {jun_hib:run('2026-06','hib'), jun_normal:run('2026-06','normal'), dic_hib:run('2026-12','hib'), dic_normal:run('2026-12','normal')}; });
 ok(r.dic_hib.neto===r.dic_normal.neto,'diciembre: híbrido se paga igual que turno común '+JSON.stringify(r)); ok(r.jun_hib.neto!==r.jun_normal.neto,'junio (auditoría) no cambia');
 await p.evaluate(()=>{ const P=window.__pla.st(); const E=P.emps[3]; E.tipo='hib'; P.cur.emp=E.id; P.cur.mon='2026-12'; delete E.aud; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1500);
 ok(await p.evaluate(()=>!!document.querySelector('#planilla .pl-nohib')),'aviso visible en diciembre'); ok(await p.evaluate(()=>window.__pla.st().emps[3].tipo==='hib'),'el dato guardado no se borra');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
