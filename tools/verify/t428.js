// v1241 · 🔎 buscar cheques por N.º desde–hasta y estado «A pagar»; bajar a Excel
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(1200);
 await p.evaluate(()=>{ const T=window.__tes.st(); T.chq=[]; [['15508671','pend'],['15508700','pag'],['15566080','pend'],['15603599','pend'],['15603600','pend'],['15453830','pend']].forEach((x,i)=>T.chq.push({id:'c'+i,prov:'P'+i,cta:i%2?'Conti-difer-G':'Basa-G',num:x[0],monto:1000*(i+1),em:'2026-11-01',co:'2026-11-25',st:x[1]})); window.__tes.ui.tab='bus'; window.__tes.ui.bn1='15508671'; window.__tes.ui.bn2='15603599'; window.__tes.ui.bst='pend'; window.__tes.ui.bd1=''; window.__tes.ui.bd2=''; window.__tes.draw(); }); await p.waitForTimeout(600);
 ok(await p.evaluate(()=>!!document.querySelector('#tesoreria [data-busk="bn1"]') && !!document.querySelector('#tesoreria [data-busk="bn2"]')),'Buscar cheques tiene «N.º de cheque desde / hasta»');
 const L=await p.evaluate(()=>{ const t=document.querySelector("#tesoreria").innerText; const m=t.match(/Encontrados[^0-9]*(\d+)/i); return m?m[1]:t.slice(0,0); });
 ok(+L===3,'del 15508671 al 15603599, solo «A pagar», de las dos cuentas: 3 cheques ('+L+')');
 const [dl]=await Promise.all([p.waitForEvent('download',{timeout:5000}).catch(()=>null), p.click('#tesoreria [data-busx="csv"]')]);
 ok(!!dl && /\.csv$/.test(dl.suggestedFilename()),'📥 baja la lista a Excel ('+(dl?dl.suggestedFilename():'nada')+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
