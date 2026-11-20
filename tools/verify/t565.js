// v1311 · 🔎 Buscar cheques: al escribir número por número el cursor NO se sale del cuadro
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const u=window.__tes.ui; window.__tes.open(); const T=window.__tes.st(); T.chq.push({id:'cT565',src:'man',st:'pend',tipo:'CHEQUE',fp:'Cheque diferido',prov:'DISTRIMED T565',cat:'Mercaderías',monto:25775700,cta:'Basa-G',num:'15508713',em:'2026-09-10',co:'2026-11-16',key:'Basa-G|15508713',entg:'si',u:1000}); u.tab='bus'; u.solo='bus'; window.__tes.draw(); });
 await p.waitForTimeout(400);
 await p.click('#tesoreria [data-busk="bq"]'); const out=[];
 for(const ch of '15508713'){ await p.keyboard.type(ch); await p.waitForTimeout(450); out.push(await p.evaluate(()=>{ const a=document.activeElement; return (a&&a.dataset&&a.dataset.busk)||(a?a.tagName+'#'+a.id:''); })); }
 const r=await p.evaluate(()=>{ const n=document.querySelector('#tesoreria [data-busk="bq"]'); return {v:n.value, tx:document.getElementById('tesoreria').innerText}; });
 console.log(out.join(','), r.v);
 ok(out.every(x=>x==='bq'),'después de cada número el cursor sigue en el cuadro de búsqueda');
 ok(r.v==='15508713','queda escrito el número completo ('+r.v+')');
 ok(/DISTRIMED T565/.test(r.tx)&&/10\/09/.test(r.tx),'encuentra el cheque y muestra su fecha de emisión');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
