// v1268 · 🧾 Caja inteligente: 5 ventas + 5 presupuestos, caja por stock de billetes (₲/R$/US$), vuelto por billetes, códigos de barra por presentación, clientes
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const W=+(process.env.W||1366); const {b,p,errs}=await setup({vp:{width:W,height:W>1000?768:900}});
 await p.evaluate(()=>{ window.__ar.demo(true); }); await p.waitForTimeout(600);
 await p.evaluate(()=>window.__vt.open()); await p.waitForTimeout(600);
 const tabs=await p.evaluate(()=>({ v:document.querySelectorAll('#ventas [data-vt="tab"]').length }));
 ok(tabs.v>=10,'hay 5 ventas de salón y 5 presupuestos ('+tabs.v+')');
 // inicio de caja: 3 de 100.000, 4 de 10.000, 2 de 5.000, 10 de 1.000 + R$ 2×50
 await p.click('#ventas [data-vt="ini"]'); await p.waitForTimeout(300);
 for (const [k,v] of [['GS:100000','3'],['GS:10000','9'],['GS:5000','2'],['GS:1000','10'],['GS:500','4'],['GS:100','10'],['GS:50','10'],['BRL:50','2']]) { await p.fill('.vt-ov [data-vn="'+k+'"]',v); await p.dispatchEvent('.vt-ov [data-vn="'+k+'"]','change'); await p.waitForTimeout(80); }
 await p.click('.vt-ov [data-vc="ok"]'); await p.waitForTimeout(300);
 let st=await p.evaluate(()=>window.__vt.st().stock); ok(st.GS[100000]===3&&st.GS[5000]===2&&st.BRL[50]===2,'inicio de caja por billetes '+JSON.stringify(st.GS));
 // venta 1: buscar y agregar ibuprofeno
 await p.fill('#vtQ','ibuprofeno 600'); await p.waitForTimeout(200); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
 // venta 2 en simultáneo
 const ids=await p.evaluate(()=>window.__vt.st().tabs.map(t=>t.id)); await p.click('#ventas [data-id="'+ids[1]+'"]'); await p.waitForTimeout(200);
 await p.fill('#vtQ','amoxi'); await p.waitForTimeout(200); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
 const L=await p.evaluate(()=>window.__vt.st().tabs.slice(0,2).map(t=>t.lines.length)); ok(L[0]===1&&L[1]===1,'dos ventas cargadas a la vez sin mezclarse '+JSON.stringify(L));
 // código de barra fracción para el ibuprofeno
 const art=await p.evaluate(()=>{ const t=window.__vt.st().tabs[0]; return t.lines[0].aid; });
 await p.click('#ventas [data-id="'+ids[0]+'"]'); await p.waitForTimeout(200);
 await p.click('#ventas [data-vt="lbar"][data-i="0"]'); await p.waitForTimeout(300);
 await p.selectOption('.vt-ov [data-b="t"]','fr'); await p.dispatchEvent('.vt-ov [data-b="t"]','change'); await p.click('.vt-ov [data-bg="1"]'); await p.waitForTimeout(100);
 const code=await p.inputValue('.vt-ov [data-b="bar"]'); await p.click('.vt-ov [data-ba="1"]'); await p.waitForTimeout(200);
 ok(/^29\d{11}$/.test(code),'✨ crea un código de barra interno para la fracción ('+code+')');
 await p.click('.vt-ov [data-x="1"]'); await p.waitForTimeout(200);
 await p.fill('#vtQ',code); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
 const fr=await p.evaluate(()=>window.__vt.st().tabs[0].lines.map(l=>({n:l.n,uq:l.uq,pvp:l.pvp})));
 ok(fr.length===2 && fr[1].uq===1,'al pasar el código de la fracción entra la UNIDAD (descuenta 1) '+JSON.stringify(fr));
 // cliente nuevo rápido (nombre, C.I., WhatsApp) desde la venta
 await p.click('#ventas [data-vt="quickcli"]'); await p.waitForTimeout(200);
 await p.fill('.vt-ov [data-q="n"]','Cliente QA'); await p.fill('.vt-ov [data-q="doc"]','1234567'); await p.fill('.vt-ov [data-q="tel"]','0981 123 456'); await p.click('.vt-ov [data-ok="1"]'); await p.waitForTimeout(300);
 const cl=await p.evaluate(()=>{ const V=window.__vt.st(); return { n:V.clients.filter(c=>c.ci==='1234567').length, cat:V.tabs[0].cat, cli:V.tabs[0].cli }; }); ok(cl.n===1&&cl.cat==='cd'&&cl.cli==='Cliente QA','⚡ registra cliente nuevo rápido y queda en la venta como registrado '+JSON.stringify(cl));
 // cobrar en efectivo con 100.000 → vuelto por billetes
 const total=await p.evaluate(()=>{ const t=window.__vt.st().tabs[0]; return t; }); 
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 const tot=await p.evaluate(()=>+document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,''));
 await p.click('.vt-ov [data-vp="rec"]'); await p.waitForTimeout(200); await p.fill('.vt-ov:last-of-type [data-vn="GS:100000"]','1'); await p.dispatchEvent('.vt-ov:last-of-type [data-vn="GS:100000"]','change'); await p.click('.vt-ov:last-of-type [data-vc="ok"]'); await p.waitForTimeout(300);
 const vu=100000-tot; await p.click('.vt-ov [data-vp="vu"]'); await p.waitForTimeout(200); await p.click('.vt-ov:last-of-type [data-vc="sug"]'); await p.waitForTimeout(200); await p.click('.vt-ov:last-of-type [data-vc="ok"]'); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(300); await p.evaluate(()=>{ const v=document.querySelector('[data-vok]'); if(v) v.click(); }); await p.waitForTimeout(400);
 const af=await p.evaluate(()=>{ const V=window.__vt.st(); return { sales:V.sales.length, st:V.stock.GS, v:V.sales[0]&&V.sales[0].vuelto, tab0:V.tabs[0].lines.length, tab1:V.tabs[1].lines.length, sold:V.sold }; });
 const sumGs=Object.entries(af.st).reduce((a,[d,n])=>a+d*n,0);
 ok(af.sales===1 && af.v===vu && af.tab0===0 && af.tab1===1,'cobra, da el vuelto ₲ '+vu+' con billetes y la otra venta sigue intacta');
 ok(sumGs===300000+90000+10000+10000+2000+1000+500+tot,'el stock de billetes quedó justo: ₲ '+sumGs+' (inicio 413.500 + venta '+tot+')');
 ok(Object.values(af.sold).reduce((a,b)=>a+b,0)>=11,'descuenta del stock madre en unidades (caja + 1 unidad) '+JSON.stringify(af.sold));
 // presupuesto: estado y pasar a venta
 await p.click('#ventas [data-id="'+ids[5]+'"]'); await p.waitForTimeout(200); await p.fill('#vtQ','para'); await p.waitForTimeout(150); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
 await p.selectOption('#ventas [data-vf="st"]','aprobado'); await p.waitForTimeout(200); await p.click('#ventas [data-vt="avent"]'); await p.waitForTimeout(300);
 const pr=await p.evaluate(()=>{ const V=window.__vt.st(); const P=V.tabs.find(t=>t.k==='p'&&t.n===1); const cur=V.tabs.find(t=>t.id===V.cur); return { st:P.st, curK:cur.k, n:cur.lines.length }; });
 ok(pr.st==='confirmado'&&pr.curK==='v'&&pr.n===1,'presupuesto aprobado pasa a una venta libre y queda ✅ Confirmado '+JSON.stringify(pr));
 // pago mixto: primero la tarjeta (el resto menos 5.000) y después 5.000 en efectivo
 await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="addp"]'); await p.waitForTimeout(200);
 const tm=await p.evaluate(()=>+document.querySelector('.vt-ov .vt-big').textContent.replace(/\D/g,''));
 await p.fill('.vt-ov [data-pm="0"]',String(tm-5000)); await p.dispatchEvent('.vt-ov [data-pm="0"]','change'); await p.waitForTimeout(250);
 await p.click('.vt-ov [data-vp="rq"][data-d="5000"]'); await p.waitForTimeout(250); await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(300); await p.evaluate(()=>{ const v=document.querySelector('[data-vok]'); if(v) v.click(); }); await p.waitForTimeout(400);
 const mx=await p.evaluate(()=>{ const V=window.__vt.st(); const s=V.sales[V.sales.length-1]; return { n:V.sales.length, pays:s.pays.map(x=>x.fp+':'+x.m), tot:s.total }; });
 ok(mx.n===2 && mx.pays.length===2 && mx.pays[0]==='tc:'+(mx.tot-5000) && mx.pays[1]==='ef:5000','pago mixto: primero tarjeta, después efectivo '+JSON.stringify(mx));
 // remesa sin pasar el stock
 await p.evaluate(()=>{ window.__askOrig=window.askBox; }); 
 await p.click('#ventas [data-vt="all"]'); await p.waitForTimeout(200); const cards=await p.evaluate(()=>document.querySelectorAll('.vt-ov [data-go]').length); ok(cards>=10,'🖥️ Ver todas muestra todas las ventanas ('+cards+')'); await p.click('.vt-ov [data-x="1"]');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
