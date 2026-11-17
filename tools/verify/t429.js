// v1242 · 🏦 bancos de los cheques: se corrigen según su chequera; cuentas sin uso se sacan de la lista (sin borrar cheques)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(1200);
 await p.evaluate(()=>{ const T=window.__tes.st(); T.chqras=[{id:'k1',cta:'Basa-G',ini:15603571,fin:15603620,tipo:'Diferido'},{id:'k2',cta:'Cont-vista-G',ini:855451,fin:855500,tipo:'A la vista'}]; T.chq=[{id:'a',prov:'A',cta:'Conti-difer-G',num:'15603580',monto:1,em:'2026-11-01',co:'2026-11-20',st:'pend'},{id:'b',prov:'B',cta:'Basa-G',num:'15603581',monto:1,em:'2026-11-01',co:'2026-11-20',st:'pend'},{id:'c',prov:'C',cta:'Viejo',num:'15603582',monto:1,em:'2026-11-01',co:'2026-11-20',st:'pag'},{id:'d',prov:'D',cta:'Otra',num:'99',monto:1,em:'2026-11-01',co:'2026-11-20',st:'pag'}]; window.__tes.ui.tab='chqra'; window.__tes.draw(); }); await p.waitForTimeout(500);
 ok(/2 cheque\(s\)/.test(await p.evaluate(()=>document.querySelector('#tesoreria').innerText)),'avisa: 2 cheques con un banco que no es el de su chequera');
 await p.click('#tesoreria [data-kb="fix"]'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const b=[...document.querySelectorAll('button')].reverse().find(x=>/^(Sí|Aceptar|OK|Confirmar)/i.test(x.innerText.trim())); b&&b.click(); }); await p.waitForTimeout(500);
 const c=await p.evaluate(()=>window.__tes.st().chq.map(x=>x.id+':'+x.cta+'<'+(x.ctaPrev||'')).join(',')); console.log('   '+c);
 ok(/a:Basa-G<Conti-difer-G/.test(c) && /c:Basa-G<Viejo/.test(c) && /d:Otra</.test(c),'✅ corrige según la chequera y anota de dónde venía; los que no tienen chequera no se tocan');
 await p.click('#tesoreria [data-kb="off"][data-c="Otra"]'); await p.waitForTimeout(400);
 const L=await p.evaluate(()=>{ const T=window.__tes.st(); return JSON.stringify(T.cfg.ctaOff)+'|'+T.chq.length; }); ok(/"Otra":1/.test(L) && /\|4$/.test(L),'🗑️ saca la cuenta «Otra» de la lista sin borrar cheques');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
