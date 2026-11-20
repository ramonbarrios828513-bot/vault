// v1280 · el dueño con la notebook abierta puede marcar un cheque como pagado desde su celular (otro aparato suyo); otra persona sigue bloqueada
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844},ctx:{hasTouch:true,isMobile:true}});
 await p.evaluate(()=>{ const T=window.__tes.st(); const f=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); const h=new Date(); T.chq.push({id:'k1',prov:'PROV',cta:'Basa-G',num:'1',monto:1000000,co:f(h),st:'pend',tipo:'Diferido'}); window.__tes.save(); window.__tes.open(); }); await p.waitForTimeout(800);
 const me=await p.evaluate(()=>{ const A=window.__acc; A.st.locks.tes={who:A.who(),dev:'mi-notebook',dn:'💻 computadora',t:Date.now(),t0:Date.now()}; return A.can('tes'); }); ok(me,'la notebook del MISMO dueño no bloquea su celular');
 const other=await p.evaluate(()=>{ const A=window.__acc; A.st.locks.tes={who:'Encargada Ana',dev:'otro',dn:'💻 computadora',t:Date.now(),t0:Date.now()}; return A.can('tes'); }); ok(!other,'si es OTRA persona, sigue en «solo ver»');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
