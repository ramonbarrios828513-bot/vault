// v1311 · «Cheques a pagar» muestra los cheques de TODOS los meses (diciembre, febrero del año que viene…)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const r=await p.evaluate((TAB)=>{ const u=window.__tes.ui; window.__tes.open(); const T=window.__tes.st(); T.chq=T.chq.filter(c=>c.st!=='pend');
  const mk=(id,co,m,extra)=>T.chq.push(Object.assign({id:id,src:'man',st:'pend',tipo:'CHEQUE',fp:'Cheque diferido',prov:'PROV '+id,cat:'Mercaderías',monto:m,cta:'Basa-G',num:'9'+id,em:'2026-11-20',co:co,key:'Basa-G|9'+id,entg:'si',u:Date.now()},extra||{}));
  mk('a1','2026-12-14',26810000); mk('a2','2026-12-20',11069000); mk('a3','2027-02-08',40843641);
  u.tab=TAB; u.solo=''; window.__tes.draw(); const a=document.getElementById('tesoreria'); const days=[...a.querySelectorAll('.ap-day')].map(x=>x.querySelector('.ap-dn').textContent).filter(t=>/cheque\(s\)/.test(t)); const em=[...a.querySelectorAll('.ap-day .tes-em')].map(x=>x.textContent); return {days, em, n:a.querySelectorAll('.ap-day').length, txt:a.textContent.slice(0,300)}; }, process.env.TAB||'apag');
 console.log(JSON.stringify(r).slice(0,900));
 ok(r.days.length===3,'los tres cheques aparecen cada uno en su día ('+r.days.join(' | ')+')');
 ok(/21\/12/.test(r.days.join(' '))&&/08\/02/.test(r.days.join(' ')),'el del domingo 20/12 sale el lunes 21/12 y el de febrero 2027 también se ve');
 ok(r.em.length===3&&/emitido 20\/11/.test(r.em[0]),'cada cheque muestra su fecha de emisión ('+r.em[0]+')');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
