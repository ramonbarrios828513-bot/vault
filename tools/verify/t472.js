// v1260 · un aparato viejo que sincroniza la ficha (con 06:30–23:00 y cambio más nuevo) NO devuelve el horario: rige el turno aplicado (15–23); y se repone si ya quedó mal
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; P.cur.emp=E.id; P.cur.mon='2026-11'; E.tipo='norm'; delete E.schM; E.sch=[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})); E.asig=[]; const C=P.cfg, t=C.turnos.find(t=>t.e==='15:00'&&t.s==='23:00'); window.__plTurApply(E,C,t.id,'2026-06',true); E.mt=Date.now(); });
 const r=await p.evaluate(()=>{ const P=window.__pla.st(), NEW=JSON.parse(JSON.stringify(P)), OLD=JSON.parse(JSON.stringify(P)); const eo=OLD.emps[3]; eo.sch=[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})); delete eo.turDesde; eo.schM={'2026-11':{sch:eo.sch,n:'X',ts:1}}; eo.mt=Date.now()+60000; eo.nota='tocado en el aparato viejo';
   const L={pla:NEW,__mt:{pla:1}}, R={pla:OLD,__mt:{pla:2}}; const m=window.__memcMerge(L,R), E=m.pla.emps.find(x=>x.id===NEW.emps[3].id); return {sch:E.sch[1].e+'-'+E.sch[1].s, schM:!!(E.schM&&E.schM['2026-11']), nota:E.nota}; });
 ok(r.sch==='15:00-23:00'&&!r.schM,'la sincronización mantiene 15:00–23:00 ('+JSON.stringify(r)+')');
 ok(r.nota==='tocado en el aparato viejo','lo demás que cambió el otro aparato sí se guarda');
 const h=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; E.sch=[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})); window.__pla.open(); return new Promise(res=>setTimeout(()=>res(E.sch[1].e+'-'+E.sch[1].s+' '+E.turnoX),1500)); });
 ok(/^15:00-23:00/.test(h),'si ya quedó 06:30–23:00, al abrir la planilla se repone el turno aplicado ('+h+')');
 const m2=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; E.sch=[0,1,2,3,4,5,6].map(i=>({e:'16:00',s:'24:00',off:i===0})); E.schT=Date.now()+5; return window.__plTurHeal(E,P.cfg)+' '+E.sch[1].e; });
 ok(m2==='false 16:00','un cambio a mano posterior en la ficha (16–24) se respeta ('+m2+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
