// v1252 · turno tarde-noche 15-23 sin corte: suma por bloques, lo de más es extra; más de 8 h seguidas sin descanso → resta 1 h obligatoria
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 const r=await p.evaluate(()=>{ const P=window.__pla.st(), C=P.cfg, X=JSON.parse(JSON.stringify(P.emps[3])); delete X.aud; delete X.solo; X.tipo='normal'; X.turnoX=''; X.opt=Object.assign({},X.opt,{noCut:true}); X.sch=[0,1,2,3,4,5,6].map(i=>({e:'15:00',s:'23:00',off:i===0}));
  const dt=new Date(2026,11,2,12), f=(D)=>{const d=qPlDay(X,D,C,dt); return {h:((d.diu+d.noc)/60).toFixed(2),cut:d.cut,tard:d.tard,salT:d.salT,why:String(d.why).slice(0,160)}};
  const run=(D)=>{ const Y=JSON.parse(JSON.stringify(X)); Y.days={'2026-12':{}}; for(let d=1;d<=31;d++){ if(new Date(2026,11,d).getDay()===0) continue; let fe=false; try{fe=!!plFerOf('2026-12',d)}catch(x){} if(fe) continue; Y.days['2026-12'][d]={e:'15:00',s:'23:00'}; } Y.days['2026-12']['2']=D; const R=window.__pla.calc(Y,'2026-12',C),L=R.L,o={}; Object.keys(L).forEach(k=>{ if(typeof L[k]==='number'&&L[k]) o[k]=Math.round(L[k]); }); return o; };
  const A={e:'08:00',sd:'12:00',vd:'15:00',s:'23:00'}, B={e:'06:30',s:'23:00'}, Cc={e:'15:00',s:'23:00'};
  return {bloques:run(A), seguido:run(B), turno:run(Cc), exD:X.opt.exD, exN:X.opt.exN, hora:Math.round(3044000/240)}; });
 const H=r.hora; ok(!r.turno.falta && !r.turno.exD,'15:00–23:00 = 8 h justas, sin descuento ni extra');
 ok(!r.bloques.falta && Math.abs(r.bloques.exD-4*H)<3,'08–12 + 15–23 = 4 h extras sumando por bloques: '+r.bloques.exD);
 ok(!r.seguido.falta && Math.abs(r.seguido.exD-7.5*H)<3,'06:30–23 sin descanso → resta 1 h obligatoria, 7:30 extras: '+r.seguido.exD);
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
