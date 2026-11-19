// v1258 · 🖨️ Cheques a cubrir (PDF): cheques que se debitan hasta hoy, por cuenta, con saldo y lo que falta depositar
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}});
 const r=await p.evaluate(()=>{ const T=window.__tes.st(), hoy=new Date(); const f=d=>{const x=new Date(hoy); x.setDate(x.getDate()+d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');};
  T.chq.push({id:'z1',st:'pend',tipo:'cheque',cta:'Basa-G',num:'1001',prov:'Parma Internacional S.A.',monto:5000000,fdeb:f(0)});
  T.chq.push({id:'z2',st:'pend',tipo:'cheque',cta:'Basa-G',num:'1002',prov:'Lab X',monto:3000000,fdeb:f(-2)});
  T.chq.push({id:'z3',st:'pend',tipo:'cheque',cta:'Itau',num:'77',prov:'Prov Y',monto:1000000,fdeb:f(3)});
  T.sal.push({cta:'Basa-G',f:f(0),m:6000000}); T.cfg.ctaInfo={'Basa-G':{banco:'Basa',nom:'Cuenta corriente Gisele',n4:'1234',tit:'Gisele Simon'}};
  return window.__txChqHoy(); });
 ok(/Parma/.test(r)&&/Lab X/.test(r)&&!/Prov Y/.test(r),'trae los cheques de hoy y atrasados, no los futuros'); ok(/FALTA DEPOSITAR/.test(r)&&/2\.000\.000/.test(r),'calcula lo que falta depositar por cuenta'); ok(/•••1234/.test(r)&&/Gisele Simon/.test(r),'muestra banco, últimos 4 y titular');
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(1000);
 ok(await p.evaluate(()=>!!document.querySelector('#tesoreria [data-tx2="chqhoy"]')),'botón en Tesorería'); ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
