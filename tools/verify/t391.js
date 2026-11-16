// v1222 · 🤝 PORTAL DEL VENDEDOR: el dueño arma el pedido (producto, cantidad, PVP), habilita solo las herramientas que usa ese proveedor, manda el enlace; el vendedor carga su propuesta; ronda 2 con contrapropuesta; orden de compra; el vendedor confirma. El enlace solo abre ESA negociación.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
const PORT=process.env.NPORT||8105, URL='http://localhost:'+PORT+'/work.html', CODE='NISSI-ABCD-EFGH-JKLM-NPQR-STUV';
(async()=>{ const b=await chromium.launch(); const errs=[];
 const ctx=await b.newContext({viewport:{width:1366,height:900}}); await ctx.route(/fonts\.googleapis|jsdelivr|gstatic|cdnjs/, r=>r.abort()); await ctx.addInitScript((c)=>{ window.__plModeOK=true; window.__dblOK=true; try{ localStorage.setItem('wk-face','fam'); localStorage.setItem('nube-code',c); localStorage.setItem('nube-role','first'); }catch(e){} }, CODE);
 const A=await ctx.newPage(); A.on('pageerror',e=>errs.push('A: '+e.message)); A.on('dialog',d=>d.accept());
 await A.goto(URL); await A.waitForSelector('#heroPass',{timeout:15000}); await A.waitForTimeout(800); await A.click('#heroPass'); await A.keyboard.type('1234'); await A.click('#heroPass2'); await A.keyboard.type('1234'); await A.click('text=Crear y entrar'); await A.waitForTimeout(3000); try{ await A.click('text=Ahora no',{timeout:800}); }catch(e){}
 await A.evaluate(()=>{ try{ window.__syncNow(); }catch(e){} }); await A.waitForTimeout(4000);
 for(let i=0;i<30 && !(await A.evaluate(()=>!!(window.__sv && window.__sv.st().on)));i++) await A.waitForTimeout(1000);
 await A.evaluate(async()=>{ await window.__ar.load(); await window.__ar.save([{id:'aQ',cv:'100',n:'QUITADOR FORTE',pc:'Caja x 20',u:20,prov:'PROV UNO',pvp:10000,act:true},{id:'aI',cv:'200',n:'IBUPROFENO 600',pc:'Caja x 10',u:10,prov:'PROV UNO',pvp:12000,act:true},{id:'aX',cv:'300',n:'OTRO PRODUCTO',u:1,prov:'PROV DOS',act:true}]); await window.__ar.snap('stk',{m:{aQ:500,aI:100},f:'2026-11-15'}); await window.__ar.snap('ven',{m:{aQ:30000,aI:9000},f:'2026-11-15',dias:90}); });
 await A.evaluate(()=>window.__ar.open()); await A.waitForTimeout(1500);
 await A.click('#articulos [data-ar="tab"][data-v="neg"]'); await A.waitForTimeout(300); await A.click('#articulos [data-ng="new"]'); await A.waitForTimeout(300);
 await A.fill('#articulos [data-ngh="prov"]','PROV UNO'); await A.waitForTimeout(200); await A.dispatchEvent('#articulos [data-ngh="prov"]','change'); await A.waitForTimeout(300);
 await A.fill('#articulos [data-ngh="emp"]','Empresa Ramón'); await A.click('#articulos [data-ng="fill"]'); await A.waitForTimeout(500);
 const lines=await A.evaluate(()=>{ const S=window.__ar.st(); const N=S.negs[S.ui.ng]; return N.lines.map(l=>l.n+':'+l.q+':'+l.pvp).join(','); }); console.log('lines',lines);
 ok(/QUITADOR FORTE:1475:10000/.test(lines) && /IBUPROFENO 600:/.test(lines) && !/OTRO/.test(lines),'trae los productos de ese proveedor con la cantidad a comprar y el PVP');
 await A.check('#articulos [data-ngt="cas"]'); await A.waitForTimeout(400); await A.check('#articulos [data-ngt="esc"]'); await A.waitForTimeout(400);
 ok(await A.evaluate(()=>!document.querySelector('#articulos [data-k="br"]') && !!document.querySelector('#articulos [data-k="d1"]')),'en el sistema solo aparecen las herramientas habilitadas (sin bonificación)');
 await A.click('#articulos [data-ng="send"]'); await A.waitForTimeout(2500); const link=await A.evaluate(()=>{ const i=document.getElementById('ngLinkI'); return i?i.value:''; }); console.log('link',link.slice(0,80)+'…');
 ok(/\/proveedor\/index\.html#s=[a-f0-9]{64}&k=[a-f0-9]{64}&e=[A-Za-z0-9_-]+&n=g/.test(link),'se crea el enlace para el vendedor');
 // ---- vendedor
 const vctx=await b.newContext({viewport:{width:412,height:900}}); const V=await vctx.newPage(); V.on('pageerror',e=>errs.push('V: '+e.message));
 await V.goto(link); await V.waitForTimeout(2500); const vt=await V.evaluate(()=>document.body.innerText);
 ok(/QUITADOR FORTE/.test(vt) && /Pedido: 1\.475 cajas/.test(vt) && /PVP Nissifarma: 10\.000/.test(vt),'el vendedor ve producto, cantidad y PVP');
 ok(await V.evaluate(()=>!!document.querySelector('[data-k="d1"]') && !!document.querySelector('[data-k="esc.0.d"]') && !document.querySelector('[data-k="br"]') && !document.querySelector('[data-k="nc"]')),'el vendedor solo tiene las herramientas habilitadas');
 ok(!/costo final: 4/i.test(vt) && !/stock|giro|500 u/i.test(vt),'el vendedor no ve stock, giro ni costos de Nissifarma');
 await V.fill('[data-l="aQ"][data-k="npvp"]','10500'); await V.fill('[data-l="aQ"][data-k="d1"]','30'); await V.fill('[data-l="aQ"][data-k="d2"]','30'); await V.fill('[data-l="aI"][data-k="cf"]','3500');
 const r1=await V.evaluate(()=>document.querySelector('[data-res="aQ"]').innerText); console.log('V res',r1.replace(/\n/g,' | ')); ok(/5\.145/.test(r1) && /51%/.test(r1),'el vendedor ve el cálculo en vivo (costo 5.145 · 51%)');
 await V.check('[data-pide="bon"]'); await V.fill('#wn','Juan Vendedor'); await V.fill('#wc','vendedor'); await V.fill('#wm','Precio nuevo desde diciembre'); await V.click('button[data-a="send"]'); await V.waitForTimeout(1500);
 ok(/Propuesta enviada/.test(await V.evaluate(()=>document.body.innerText)),'el vendedor envía su propuesta');
 // el enlace no abre nada más
 const q=Object.fromEntries(link.split('#')[1].split('&').map(x=>x.split('=')));
 const tryOp=async(op)=>V.evaluate(async([q,op])=>{ const r=await fetch('/api/db',{method:'POST',headers:{'Content-Type':'application/json','X-Space':q.s,'X-Key':q.k,'X-Vend':'1'},body:JSON.stringify({ops:[op]})}); return r.status; },[q,op]);
 ok(await tryOp({op:'rlist',p:'data',since:0})===403 && await tryOp({op:'get',p:'data/users/x/art/b00'})===403 && await tryOp({op:'set',p:'neg/'+q.n+'/prop',d:{}})===403,'con el enlace no se puede leer ni escribir nada fuera de su negociación');
 // ---- dueño trae la respuesta
 await A.click('#articulos [data-ng="fetch"]'); await A.waitForTimeout(2000);
 const N1=await A.evaluate(()=>{ const S=window.__ar.st(), N=S.negs[S.ui.ng], c=window.__ar.ngCalc(N.lines.find(l=>l.id==='aQ'),N.v.aQ,{}); return {st:N.st, who:N.vend&&N.vend.who.n, pide:N.vend&&N.vend.pide, fac:Math.round(c.fac), dr:Math.round(c.dr*1000)/10, sub:c.sub}; }); console.log(JSON.stringify(N1));
 ok(N1.st==='respondido' && N1.who==='Juan Vendedor' && N1.fac===5145 && N1.dr===51 && N1.sub===500,'el dueño recibe la propuesta: costo 5.145, desc. real 51%, PVP sube 500');
 ok(JSON.stringify(N1.pide)==='["bon"]' && /El vendedor pide: Bonificación/.test(await A.evaluate(()=>document.querySelector('#articulos').innerText)),'aparece el pedido de herramienta del vendedor (bonificación)');
 // ronda 2: contrapropuesta
 await A.fill('#articulos [data-ngv="aI"][data-k="cf"]','3300'); await A.waitForTimeout(300); await A.click('#articulos [data-ng="send"]'); await A.waitForTimeout(2500);
 await V.reload(); await V.waitForTimeout(2500); const vt2=await V.evaluate(()=>document.body.innerText); ok(/ronda 2/.test(vt2) && /Nissifarma propone/.test(vt2) && /3\.300/.test(vt2),'ronda 2: el vendedor ve la contrapropuesta de Nissifarma');
 await V.click('button[data-acc="aI"]'); await V.waitForTimeout(300); await V.fill('#wn','Juan Vendedor'); await V.click('button[data-a="send"]'); await V.waitForTimeout(1500);
 await A.click('#articulos [data-ng="fetch"]'); await A.waitForTimeout(2000);
 ok(await A.evaluate(()=>{ const S=window.__ar.st(), N=S.negs[S.ui.ng]; return +N.v.aI.cf===3300 && N.vend.ronda===2; }),'el vendedor aceptó la contrapropuesta (ronda 2)');
 // orden de compra
 await A.click('#articulos [data-ng="oc"]'); await A.waitForTimeout(200); await A.click('#articulos [data-ng="ocok"]'); await A.waitForTimeout(3000);
 const oc=await A.evaluate(()=>{ const S=window.__ar.st(), N=S.negs[S.ui.ng]; return N.st+'|'+N.oc+'|'+S.items.aQ.pvp+'|'+S.items.aQ.pvpPrev; }); console.log('oc',oc);
 ok(/^oc\|OC-0+1\|10500\|10000$/.test(oc),'se convierte en ORDEN DE COMPRA OC-000001 y el PVP del artículo se actualiza (guarda el anterior)');
 await V.reload(); await V.waitForTimeout(2500); ok(/ORDEN DE COMPRA N\.º OC-0+1/.test(await V.evaluate(()=>document.body.innerText)),'el vendedor ve la orden de compra');
 await V.fill('#wn','Pedro Gerente'); await V.fill('#wc','gerente'); await V.click('button[data-a="okoc"]'); await V.waitForTimeout(1500);
 await A.click('#articulos [data-ng="fetch"]'); await A.waitForTimeout(2000);
 ok(await A.evaluate(()=>{ const S=window.__ar.st(), N=S.negs[S.ui.ng]; return N.okv && N.okv.who.n==='Pedro Gerente'; }),'el dueño ve que el proveedor confirmó la orden (Pedro Gerente)');
 if(process.env.SHOT){ await V.screenshot({path:'/tmp/claude-0/ng_v.png',fullPage:false}); await A.screenshot({path:'/tmp/claude-0/ng_a.png'}); }
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); console.log('fallas',fail); process.exit(fail?1:0); })();
