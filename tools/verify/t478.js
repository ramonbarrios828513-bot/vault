// v1261 · 🏦 crédito y débito a cuentas distintas (conciliación e impresión), y cada caja recuerda sus cuentas receptoras
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const S=window.__cz.st(); S.t.push({id:'old1',n:10,f:'2026-11-17',suc:'Local 1 KM7',caja:'Caja 1',tjb:'CONTI-CC',tjt:'GISELE',tjdb:'CONTI-AH',tjdt:'GISELE',qrb:'UENO-QR',trb:'ITAU-TR',v:{}}); window.__cz.open(); }); await p.waitForTimeout(700);
 await p.selectOption('#cierre [data-czk="suc"]','Local 1 KM7').catch(()=>{}); await p.waitForTimeout(400); await p.selectOption('#cierre [data-czk="caja"]','Caja 1').catch(()=>{}); await p.waitForTimeout(600);
 const d=await p.evaluate(()=>{ const t=window.__czD(); return t?[t.tjb,t.tjdb,t.qrb,t.trb].join(','):'sin borrador'; });
 ok(d==='CONTI-CC,CONTI-AH,UENO-QR,ITAU-TR','el cierre nuevo trae las cuentas de esa caja ('+d+')');
 const h=await p.evaluate(()=>{ const t={n:11,suc:'Local 1 KM7',caja:'Caja 1',f:'2026-11-18',tjb:'CONTI-CC',tjdb:'CONTI-AH',qrb:'UENO-QR',trb:'ITAU-TR',v:{cre:'100000',deb:'50000',qr:'20000',tr:'30000'},tjd:[{ty:'Crédito',tk:'1',m:100000},{ty:'Débito',tk:'2',m:50000}],qrd:[{op:'9',m:20000}],trd:[{op:'7',b:'Banco Itaú',m:30000}]}; return window.__czTkPrint(t); });
 ok(/CRÉDITO → [^<]*CONTI-CC/.test(h)&&/DÉBITO → [^<]*CONTI-AH/.test(h),'la impresión muestra la cuenta de crédito y la de débito por separado');
 ok(/Transferencias → [^<]*ITAU-TR/.test(h)&&/QR → [^<]*UENO-QR/.test(h),'QR y transferencias, cada uno con su cuenta');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
