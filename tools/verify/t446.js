// (empleado de prueba: turno híbrido)
// v1250 · 🎌 FERIADO (domingos sin cambios): trabajó → horas × (salario÷30÷8) aparte, todas las horas (día o noche, más de 8 también);
//   faltó horas → se descuentan (salvo permiso) · abandonó sin aviso → descuenta el día · no vino → descuenta 8 h (salvo permiso)
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 const r=await p.evaluate(()=>{ const P=window.__pla.st(), C=P.cfg, E=P.emps[3]; delete E.aud; E.sal=3044000; E.valFer=0; E.con={};
   const full=()=>{ const D={}; for(let d=1;d<=30;d++){ const w=new Date(2026,5,d).getDay(); if(w===0||d===22) continue; D[d]={e:'07:00',s:'11:00'}; } return D; };
   const run=(x)=>{ const D=full(); if(x) D[22]=x; E.days['2026-06']=D; const R=window.__pla.calc(E,'2026-06',C); const plus=(R.ferDet||[]).filter(q=>/22\/6/.test(q.n) && !/no suma nocturnas/.test(q.n)).reduce((a,q)=>a+q.m,0); return {falta:Math.round(R.L.falta), exD:Math.round(R.L.exD+R.L.exN), plus, det:(R.ferDet||[]).filter(q=>/22\/6/.test(q.n)).map(q=>q.n).join(' | '), all:(R.ferDet||[]).map(q=>q.n).join(' | '), keep:JSON.stringify(E.days['2026-06'][22]||null), con:(E.con['2026-06']||[]).length}; };
   return { nada:run(null), fd:run({fsel:'fd'}), fl:run({fsel:'fl'}), h8:run({e:'07:00',s:'15:00',fsel:'fp'}), h4:run({e:'07:00',s:'11:00',fsel:'fp'}), h4p:run({e:'07:00',s:'11:00',fsel:'fpp'}), fab:run({e:'07:00',s:'11:00',fsel:'fab'}), h10n:run({e:'18:00',s:'04:00',fsel:'fp'}) }; });
 for (const k in r) console.log('   '+k+' '+JSON.stringify(r[k]).slice(0,240));
 const H=3044000/30/8;
 ok(r.nada.falta===r.fd.falta && r.fd.plus===0 && r.nada.falta>r.h8.falta,'feriado sin nada cargado = no vino, se descuenta igual que elegir «No vino»');
 ok(r.fl.plus===0 && r.fl.falta<r.fd.falta,'no vino con permiso: se devuelven las 8 h (no se descuenta)');
 ok(Math.abs(r.h4.plus-4*H)<2 && r.h4.falta>r.h8.falta && Math.abs(r.h8.plus-7*H)<2,'trabajó 4 h: cobra 4 h de feriado y del salario se descuentan las horas que faltó (8 h con 1 h de almuerzo = 7 h)');
 ok(Math.abs(r.h4p.plus-4*H)<2 && r.h4p.falta<r.h4.falta,'trabajó 4 h con permiso: cobra 4 h y no se descuentan las otras 4');
 ok(r.fab.plus===0 && r.fab.falta===r.fd.falta,'abandonó sin aviso: no cobra nada y se descuenta el día');
 ok(Math.abs(r.h10n.plus-(8*H+1*H*1.3))<3 && /Horas extra nocturnas/.test(r.h10n.det) && /no suma nocturnas/.test(r.h10n.all),'feriado de noche con 9 h: 8 h de feriado + 1 h extra nocturna (+30 %), sin nocturnas del día ('+r.h10n.plus+')');
 ok(r.h10n.exD===r.h8.exD,'las horas extra del feriado no se pagan dos veces');
 ok(r.h4.keep.indexOf('"fsel":"fp"')>=0 && r.h4.con===0,'los datos guardados no se cambian al calcular');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
