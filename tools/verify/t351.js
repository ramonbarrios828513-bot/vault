// 🛡️ no se pierde lo cargado: merge suma días, registro de tecleo y 🛟 rescate
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>{ const P=window.__pla.st(); const E=P.emps[3]; P.cur.emp=E.id; P.cur.mon='2026-06'; delete E.aud; delete E.audSw; delete E.audW; E.days['2026-06']={'1':{e:'08:30',s:'23:00'}}; window.__plApplying=true; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1500); await p.evaluate(()=>document.querySelectorAll('.ico-ov,.k-party').forEach(x=>x.remove()));
 await p.evaluate(()=>document.querySelector('#planilla .pl-modebar [data-plaudm="on"]').click()); await p.waitForTimeout(900);
 ok(await p.evaluate(()=>!!document.querySelector('#planilla [data-plrescue]')),'botón 🛟 Rescate visible');
 // teclear en auditoría día 21 y 10
 const type=async(d,e,s)=>{ await p.evaluate(([d,e,s])=>{ const r=document.querySelector('#planilla .pl-r[data-d="'+d+'"]'); const sel=r.querySelector('select.pl-st'); if(sel && [...sel.options].some(o=>o.value==='trab')){ sel.value='trab'; sel.dispatchEvent(new Event('change',{bubbles:true})); } },[d,e,s]); await p.waitForTimeout(500); await p.evaluate(([d,e,s])=>{ const r=document.querySelector('#planilla .pl-r[data-d="'+d+'"]'); const ie=r.querySelector('input[data-k="e"]'), is=r.querySelector('input[data-k="s"]'); ie.value=e; ie.dispatchEvent(new Event('change',{bubbles:true})); is.value=s; is.dispatchEvent(new Event('change',{bubbles:true})); },[d,e,s]); await p.waitForTimeout(900); };
 await type(21,'07:03','22:00'); await type(10,'14:29','23:00');
 const st=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; return JSON.stringify({d21:E.days['2026-06']['21'], d10:E.days['2026-06']['10'], J:(window.__plJ?window.__plJ():[]).filter(z=>z.id===E.id).length}); }); console.log(st);
 const S=JSON.parse(st); ok(S.d21 && S.d21.e==='07:03' && S.d10 && S.d10.e==='14:29','se guardó lo tecleado'); ok(S.J>=2,'quedó en el registro ('+S.J+')');
 // copia vieja de otro equipo con mt mayor: no debe borrar días
 const m=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; const MM=window.__memcGet(); const old=JSON.parse(JSON.stringify(MM)); const oe=old.pla.emps.find(x=>x.id===E.id); delete oe.days['2026-06']['21']; delete oe.days['2026-06']['10']; oe.mt=Date.now()+99999; old.__mt=Object.assign({},old.__mt||{}, {pla:Date.now()+99999}); const nm=window.__memcMerge(MM, old); const ne=nm.pla.emps.find(x=>x.id===E.id); return JSON.stringify({d21:ne.days['2026-06']['21'], d10:ne.days['2026-06']['10']}); });
 const Mx=JSON.parse(m); ok(Mx.d21 && Mx.d10,'otro equipo con datos viejos NO borra los días (se suman)');
 // si igual se pierden, 🛟 rescate los vuelve a poner
 await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; delete E.days['2026-06']['21']; delete E.days['2026-06']['10']; }); 
 await p.evaluate(()=>document.querySelector('#planilla [data-plrescue]').click()); await p.waitForTimeout(500);
 const rs=await p.evaluate(()=>[...document.querySelectorAll('[data-rsd]')].map(c=>c.dataset.rsd+':'+c.checked).join(','));
 ok(/21:true/.test(rs) && /10:true/.test(rs),'rescate muestra los días faltantes tildados: '+rs);
 await p.evaluate(()=>document.querySelector('[data-rsc="go"]').click()); await p.waitForTimeout(800);
 const af=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; return JSON.stringify({d21:E.days['2026-06']['21'], d10:E.days['2026-06']['10']}); }); const A=JSON.parse(af);
 ok(A.d21 && A.d21.e==='07:03' && A.d10 && A.d10.s==='23:00','🛟 restaurados');
 const dom=await p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps[3]; E.valDom=200000; E.audF=E.audF||{}; E.audF['2026-06']=Object.assign({},E.audF['2026-06']||{},{valDom:200000}); const R=window.__pla.calc(E,'2026-06',P.cfg); return (R.domDet||[]).map(z=>z.d).join(',')+' L.dom='+R.L.dom+' audF='+JSON.stringify(E.audF); }); ok(/21/.test(dom),'domingo 21 cuenta en auditoría: '+dom);
 console.log('errs',errs,'fallas',fail); await b.close(); process.exit(fail?1:0); })();
