// 💳 Cheques a pagar: único lugar para pagado, confirmar antes de aplicar, sin saldo obligatorio (banco queda negativo), cobertura solo bancos, urgente con transferencia
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(), h=new Date(), H=h.getFullYear()+'-'+String(h.getMonth()+1).padStart(2,'0')+'-'+String(h.getDate()).padStart(2,'0'); window.__H=H;
   T.sal.push({id:'s1',cta:'Basa-G',f:H,m:10000000},{id:'s2',cta:'Itau-G',f:H,m:50000000},{id:'s3',cta:'BAUL',f:H,m:20000000});
   T.chq.push({id:'k1',prov:'PROV HOY',cta:'Basa-G',num:'501',monto:30000000,co:H,st:'pend',tipo:'Diferido'},{id:'k2',prov:'PROV ANULAR',cta:'Basa-G',num:'502',monto:1000000,co:H,st:'pend',tipo:'Diferido'});
   window.__tes.ui.tab='apag'; window.__tes.open(); });
 await p.waitForTimeout(800);
 const urg=await p.evaluate(()=>document.querySelector('#tesoreria').textContent);
 const finde=[0,6].includes(new Date().getDay()); ok(finde || (/URGENTE/.test(urg) && /Transferir de Itau-G/.test(urg)),'urgente: sugiere transferir de otro banco primero'+(finde?' (fin de semana: el banco debita el lunes, no hay urgente hoy)':''));
 ok(!/Depositar del BAUL/.test(urg),'no usa el Baúl si otro banco alcanza');
 ok(await p.evaluate(()=>!!document.querySelector('#tesoreria [data-tesst="k1"][data-ap]')),'módulo 💳 Cheques a pagar con ESTADO');
 // cambiar a anulado → pide confirmar
 await p.selectOption('#tesoreria [data-tesst="k2"]','anu'); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>window.__tes.st().chq.find(x=>x.id==='k2').st==='pend' && !!document.querySelector('.ask-ov')),'antes de aplicar pide confirmar');
 await p.click('.ask-ov [data-ak="yes"]'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>window.__tes.st().chq.find(x=>x.id==='k2').st==='anu'),'confirmado → aplicado');
 // pagado sin saldo
 await p.selectOption('#tesoreria [data-tesst="k1"]','pag'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>!document.querySelector('[data-k="vis"]') && /OPCIONAL/.test(document.querySelector('.ico-ov').textContent)),'formulario simple: saldo opcional, sin «lo viste»');
 await p.evaluate(()=>document.querySelector('.ico-ov [data-tx="ok"]').click()); await p.waitForTimeout(500);
 const st=await p.evaluate(()=>({st:window.__tes.st().chq.find(x=>x.id==='k1').st, s:window.__tes.saldo('Basa-G').m}));
 console.log(JSON.stringify(st)); ok(st.st==='pag','marcado debitado y pagado sin cargar saldo'); ok(st.s<0,'el banco queda en negativo hasta cargar el saldo real');
 // desde gestión no deja pagar: redirige
 await p.evaluate(()=>{ const T=window.__tes.st(); T.chq.push({id:'k3',prov:'OTRO',cta:'Basa-G',num:'503',monto:500000,co:window.__H,st:'pend',tipo:'Diferido'}); window.__tes.ui.tab='chq'; window.__tes.ui.est='all'; window.__tes.draw(); }); await p.waitForTimeout(500);
 await p.selectOption('#tesoreria [data-tesst="k3"]','pag'); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>window.__tes.st().chq.find(x=>x.id==='k3').st==='pend' && /CHEQUES A PAGAR/.test((document.querySelector('.ask-ov')||{}).textContent||'')),'en Gestión no marca pagado: ofrece ir a Cheques a pagar');
 await p.click('.ask-ov [data-ak="yes"]'); await p.waitForTimeout(500);
 ok(await p.evaluate(()=>window.__tes.ui.tab==='apag'),'lleva a 💳 Cheques a pagar');
 // cobertura solo bancos
 ok(await p.evaluate(()=>{ const H=window.__tes.cob(2); return H[0].start <= 60000000; }),'la cobertura de cheques no cuenta el Baúl');
 console.log('errs',errs,'fallas',fail); await b.close(); process.exit(fail?1:0); })();
