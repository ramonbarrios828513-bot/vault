// v1253 · «Bien» con bloque de mañana cargado: completa Vuelve/Salida con su turno y la mañana queda como extra
const setup=require('./rvlib2.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}, pla:true});
 await p.evaluate(()=>{ const P=window.__pla.st(); const E=P.emps[3]; P.cur.emp=E.id; P.cur.mon='2026-12'; delete E.aud; E.tipo='normal'; E.opt=Object.assign({},E.opt,{noCut:true}); E.sch=[0,1,2,3,4,5,6].map(i=>({e:'15:00',s:'23:00',off:i===0})); E.days['2026-12']={'2':{e:'10:00',s:'12:00'}}; });
 await p.evaluate(()=>window.__pla.open()); await p.waitForTimeout(1500); await p.evaluate(()=>document.querySelectorAll('.ico-ov,.k-party').forEach(x=>x.remove()));
 const st=()=>p.evaluate(()=>{const E=window.__pla.st().emps[3], b=document.querySelector('#planilla [data-plok="2"]'); return {x:E.days['2026-12']['2'], btn:b&&b.textContent, dis:b&&b.disabled}});
 const a0=await st(); ok(!a0.dis,'con bloque de mañana el botón Bien está activo');
 await p.evaluate(()=>document.querySelector('#planilla [data-plok="2"]').scrollIntoView({block:'center'})); await p.click('#planilla [data-plok="2"]'); await p.waitForTimeout(600);
 const a1=await st(); ok(a1.x.e==='10:00'&&a1.x.sd==='12:00'&&a1.x.vd==='15:00'&&a1.x.s==='23:00','Bien completa el turno: '+JSON.stringify(a1.x));
 const m=JSON.parse(await p.evaluate(()=>{const P=window.__pla.st(),E=P.emps[3]; const D=E.days['2026-12']; for(let d=1;d<=31;d++){ if(d!==2&&new Date(2026,11,d).getDay()!==0) D[d]={e:'15:00',s:'23:00'}; } const R=window.__pla.calc(E,'2026-12',P.cfg); const o={}; Object.keys(R.L).forEach(k=>{ if(typeof R.L[k]==='number'&&R.L[k]) o[k]=Math.round(R.L[k]); }); Object.keys(D).forEach(k=>{ if(k!=='2') delete D[k]; }); return JSON.stringify(o);})); ok(Math.abs(m.exD-2*12683)<3 && !m.falta,'2 h extras de la mañana, sin descuento: '+JSON.stringify(m));
 await p.click('#planilla [data-plok="2"]'); await p.waitForTimeout(600);
 const a2=await st(); ok(a2.x.e==='10:00'&&a2.x.s==='12:00'&&!a2.x.vd,'desmarcar vuelve al bloque de mañana');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
