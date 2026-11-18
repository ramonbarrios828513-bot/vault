// v1261 · JUNTAR DATO POR DATO: un aparato atrasado no pisa la ficha entera; dos aparatos que cargan días distintos no se borran; el reloj adelantado no manda
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}});
 const r=await p.evaluate(()=>{ const M=window.__svMerge, S=window.__sv.st(); S.skew=0; const now=Date.now();
  const base={n:'MIL',sch:{1:{e:'06:30',s:'23:00'}},days:{'2026-11':{'3':{e:'15:00',s:'23:00'}}},con:{'2026-11':[{id:'a',m:1}]},nota:''};
  const cen=JSON.parse(JSON.stringify(base)); cen.sch={1:{e:'15:00',s:'23:00'}}; cen.days['2026-11']['4']={e:'15:05',s:'23:00'}; cen.con['2026-11'].push({id:'b',m:2});
  const mine=JSON.parse(JSON.stringify(base)); mine.days['2026-11']['5']={e:'15:10',s:'23:00'}; mine.nota='B'; mine.con['2026-11'].push({id:'c',m:3});
  const r1=M({v:mine},base,{v:cen},now+7200000,now).v; // aparato con hora adelantada y que llegó después
  const same1=JSON.parse(JSON.stringify(base)); same1.days['2026-11']['3']={e:'15:30',s:'23:00'}; const same2=JSON.parse(JSON.stringify(base)); same2.days['2026-11']['3']={e:'16:00',s:'23:00'};
  S.skew=-7200000; const r2=M({v:same1},base,{v:same2},now+3600000,now).v; // reloj adelantado 2h corregido: en realidad es 1h ANTES que la central
  S.skew=0; const r3=M({v:same1},base,{v:same2},now+5000,now).v;
  const r4=M({v:mine},null,{v:cen},now+99999999,now).v; // sin base conocida
  return {sch:r1.sch[1].e, d:Object.keys(r1.days['2026-11']).sort().join(','), nota:r1.nota, con:r1.con['2026-11'].map(x=>x.id).sort().join(','), r2:r2.days['2026-11']['3'].e, r3:r3.days['2026-11']['3'].e, r4:r4.sch[1].e+'|'+r4.nota}; });
 ok(r.sch==='15:00','el turno que cambió la central NO lo pisa el aparato atrasado ('+r.sch+')');
 ok(r.d==='3,4,5','días cargados en distintos aparatos se juntan ('+r.d+')');
 ok(r.nota==='B','lo que cambió el aparato atrasado sí entra ('+r.nota+')');
 ok(r.con==='a,b,c','registros nuevos de los dos aparatos se juntan ('+r.con+')');
 ok(r.r2==='16:00','mismo dato cambiado en los dos: el reloj adelantado NO gana (se mide con el reloj de la central) ('+r.r2+')');
 ok(r.r3==='15:30','mismo dato: gana el cambio más reciente ('+r.r3+')');
 ok(r.r4==='15:00|','sin base conocida: manda la central y solo se agrega lo que falta ('+r.r4+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
