// v1272 · Clientes: precargados de prueba, ⚡ rápido, 📋 completo (individual / funcionario ANDE), y las tarjetas del titular se guardan solas al pagar
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const W=+(process.env.W||1366); const {b,p,errs}=await setup({vp:{width:W,height:W>1000?768:900}});
 await p.evaluate(()=>window.__vt.open()); await p.waitForTimeout(700);
 const n0=await p.evaluate(()=>window.__vt.st().clients.length); ok(n0>=13,'ya hay clientes de prueba en el buscador ('+n0+')');
 await p.click('#ventas [data-vt="pickcli"]'); await p.waitForTimeout(200); await p.fill('.vt-ov [data-cq]','ande'); await p.waitForTimeout(200);
 const ande=await p.evaluate(()=>document.querySelectorAll('.vt-ov [data-cp]:not([data-cp="sd"])').length); ok(ande===0&&/No se busca por nombre/.test(await p.evaluate(()=>[...document.querySelectorAll('.vt-ov .vt-list')].pop().innerText)),'v1307: en la venta no se busca por nombre ni empresa, solo por C.I. o RUC');
 await p.click('.vt-ov [data-cqk]'); await p.waitForTimeout(200);
 await p.fill('.vt-ov:last-of-type [data-q="n"]','Nuevo Rápido'); await p.fill('.vt-ov:last-of-type [data-q="doc"]','5551234'); await p.fill('.vt-ov:last-of-type [data-q="tel"]','0991 555 123'); await p.click('.vt-ov:last-of-type [data-ok]'); await p.waitForTimeout(300);
 let t=await p.evaluate(()=>{ const V=window.__vt.st(); return {cli:V.tabs.find(x=>x.id===V.cur).cli, cat:V.tabs.find(x=>x.id===V.cur).cat}; }); ok(t.cli==='Nuevo Rápido'&&t.cat==='cd','⚡ rápido desde el buscador: queda en la venta como registrado '+JSON.stringify(t));
 // ficha completa: funcionario de ANDE
 await p.click('#ventas [data-vt="editcli"]'); await p.waitForTimeout(200); await p.click('.vt-ov [data-tp="emp"]'); await p.waitForTimeout(150);
 await p.fill('.vt-ov [data-c="emp"]','ANDE'); await p.fill('.vt-ov [data-c="mail"]','malcorreo'); await p.click('.vt-ov [data-ok]'); await p.waitForTimeout(150);
 const tx=await p.evaluate(()=>document.getElementById('toast').textContent); ok(/correo/.test(tx),'valida el correo: '+tx);
 await p.fill('.vt-ov [data-c="mail"]','nuevo@correo.com'); await p.click('.vt-ov [data-tja]'); await p.waitForTimeout(150);
 await p.selectOption('.vt-ov [data-tj="0:bk"]','Itaú'); await p.selectOption('.vt-ov [data-tj="0:tp"]','cre'); await p.selectOption('.vt-ov [data-tj="0:mc"]','Visa'); await p.dispatchEvent('.vt-ov [data-tj="0:mc"]','change');
 await p.click('.vt-ov [data-ok]'); await p.waitForTimeout(300);
 let c=await p.evaluate(()=>{ const V=window.__vt.st(); const c=V.clients.find(x=>x.ci==='5551234'); return {tipo:c.tipo,emp:c.emp,cat:c.cat,mail:c.mail,tjs:c.tjs,bks:c.bks}; });
 ok(c.tipo==='emp'&&c.emp==='ANDE'&&c.cat==='ce'&&c.mail==='nuevo@correo.com'&&c.bks.join()==='Itaú','📋 completo: funcionario ANDE → convenio empresa, correo, tarjeta Itaú Visa crédito '+JSON.stringify(c));
 // pagar con débito Continental Mastercard → se guarda sola
 await p.evaluate(()=>{ const V=window.__vt.st(); V.open=true; V.stock={GS:{},BRL:{},USD:{}}; const t=V.tabs.find(x=>x.id===V.cur); t.fp='td'; t.bk='Continental'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:100000,cost:35000,uq:1}]; window.__vt.open(); });
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 await p.selectOption('.vt-ov [data-pmc="0"]','Mastercard'); await p.dispatchEvent('.vt-ov [data-pmc="0"]','change'); await p.click('.vt-ov [data-vp="resto"]'); await p.waitForTimeout(200); await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(300); await p.evaluate(()=>{ const v=document.querySelector('[data-vok]'); if(v) v.click(); }); await p.waitForTimeout(400);
 c=await p.evaluate(()=>{ const c=window.__vt.st().clients.find(x=>x.ci==='5551234'); return c.tjs.map(x=>x.tp+' '+x.bk+' '+x.mc+' n'+x.n); }); ok(c.some(x=>/^deb Continental Mastercard n1/.test(x)),'al pagar, guarda solo débito Continental Mastercard en la ficha '+JSON.stringify(c));
 // en el próximo cobro con débito, sugiere su tarjeta
 await p.evaluate(()=>{ const V=window.__vt.st(); const t=V.tabs.find(x=>x.id===V.cur); t.cid=V.clients.find(x=>x.ci==='5551234').id; t.cli='Nuevo Rápido'; t.cat='ce'; t.fp='td'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:100000,cost:35000,uq:1}]; window.__vt.open(); });
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300); const sug=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-vp="usetj"]')].map(x=>x.textContent)); ok(sug.some(x=>/Continental Mastercard/.test(x)),'en el cobro sugiere sus tarjetas guardadas '+JSON.stringify(sug));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
