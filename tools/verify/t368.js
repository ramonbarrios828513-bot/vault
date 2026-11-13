// sync de cheques: un aparato desactualizado no deshace un pagado; el cambio más nuevo gana
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const r=await p.evaluate(()=>{ const M=window.__memcMerge; const base=()=>({id:'c1',prov:'X',cta:'Basa-G',monto:100,co:'2026-11-09',st:'pend'});
   const nb={__mt:{tes:2000}, tes:{chq:[Object.assign(base(),{st:'pag',u:1500,conc:{f:'2026-11-09'}})]}};   // notebook: pagó (cambio a las 1500)
   const op={__mt:{tes:3000}, tes:{chq:[base()]}};                                                      // OPPO desactualizado guardó otra cosa después
   const m1=M(nb,op), m2=M(op,nb);
   const rv1={__mt:{tes:5000}, tes:{chq:[Object.assign(base(),{st:'pend',u:4000,reab:4000})]}};                   // alguien lo volvió a «a pagar» a propósito, más tarde
   const m3=M(nb,rv1);
   return {a:m1.tes.chq[0].st, b:m2.tes.chq[0].st, c:m3.tes.chq[0].st}; });
 console.log(JSON.stringify(r));
 ok(r.a==='pag' && r.b==='pag','un aparato desactualizado no deshace el pagado (en los dos sentidos)');
 ok(r.c==='pend','un cambio hecho después a propósito sí gana');
 // marcar pagado deja la hora del cambio
 await p.evaluate(()=>{ const T=window.__tes.st(), h=new Date(), H=h.getFullYear()+'-'+String(h.getMonth()+1).padStart(2,'0')+'-'+String(h.getDate()).padStart(2,'0'); T.chq.push({id:'k1',prov:'P',cta:'Basa-G',num:'1',monto:1000,co:H,st:'pend',tipo:'Diferido'}); window.__tes.ui.tab='apag'; window.__tes.open(); });
 await p.waitForTimeout(700); await p.selectOption('#tesoreria [data-tesst="k1"]','pag'); await p.waitForTimeout(400); await p.evaluate(()=>document.querySelector('.ico-ov [data-tx="ok"]').click()); await p.waitForTimeout(500);
 const c=await p.evaluate(()=>window.__tes.st().chq.find(x=>x.id==='k1')); ok(c.st==='pag' && c.u>0,'el cheque pagado guarda la hora de su último cambio');
 console.log('errs',errs,'fallas',fail); await b.close(); process.exit(fail?1:0); })();
