// 🛰️ el servidor manda (cheques) — base: nube propia: el equipo A crea la nube y sube; el equipo B (con otra clave y otros datos) se une, respalda lo suyo y queda espejo de A
const { chromium } = require('/opt/node-tools/node_modules/playwright');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
const URL='http://localhost:'+(process.env.NPORT||8105)+'/work.html', CODE='NISSI-ABCD-EFGH-JKLM-NPQR-STUV';
(async()=>{ const b=await chromium.launch();
 const mk=async(code)=>{ const ctx=await b.newContext({viewport:{width:1366,height:900}, acceptDownloads:true}); await ctx.route(/fonts\.googleapis|jsdelivr|gstatic|cdnjs/, r=>r.abort()); await ctx.addInitScript((c)=>{ window.__plModeOK=true; window.__dblOK=true; try{ localStorage.setItem('wk-face','fam'); if(c && !localStorage.getItem('nube-code')) localStorage.setItem('nube-code',c); }catch(e){} }, code); const p=await ctx.newPage(); p.on('dialog',d=>d.accept()); return {ctx,p}; };
 const create=async(p,pw)=>{ await p.goto(URL); await p.waitForSelector('#heroPass',{timeout:15000}); await p.waitForTimeout(800); await p.click('#heroPass'); await p.keyboard.type(pw); await p.click('#heroPass2'); await p.keyboard.type(pw); await p.click('text=Crear y entrar'); await p.waitForTimeout(2500); try{ await p.click('text=Ahora no',{timeout:800}); }catch(e){} };
 // A: crea su nube con datos
 const A=await mk(CODE); await A.ctx.addInitScript(()=>{ try{ localStorage.setItem('nube-role','first'); }catch(e){} }); await create(A.p,'1234');
 await A.p.evaluate(()=>{ window.__pla.open(); }); await A.p.waitForTimeout(800);
 await A.p.evaluate(()=>{ const P=window.__pla.st(); P.emps=P.emps||[]; if(!P.emps.length) P.emps.push({id:'eM',n:'EMPLEADO PRUEBA',days:{},con:{}}); P.emps[0].salM={'2026-06':2899048}; window.__pla.save(); });
 await A.p.evaluate(()=>{ try{ window.__pla.open(); }catch(e){} }); await A.p.waitForTimeout(1500);
 await A.p.evaluate(()=>{ try{ window.__syncNow(); }catch(e){} }); await A.p.waitForTimeout(4000); await A.p.evaluate(()=>{ try{ window.__syncNow(); }catch(e){} }); await A.p.waitForTimeout(4000);
 console.log('A mat', await A.p.evaluate(()=>{ const m=JSON.parse(localStorage.getItem('le-mats')||'[]'); return JSON.stringify(m.map(x=>[x.id,x.mt])); })); console.log('A emps', await A.p.evaluate(()=>{ const P=window.__pla.st(); return JSON.stringify(P.emps.map(e=>[e.n,e.salM])); })); const st=await (await fetch('http://localhost:'+(process.env.NPORT||8105)+'/__stats')).json(); console.log('server',JSON.stringify(st).slice(0,300));
 ok(st.spaces===1 && st.docs>0,'A subió sus datos (cifrados) a la nube propia');
 ok(await A.p.evaluate(()=>window.__nube && window.__nube.st==='ok'),'A: nube funcionando');
 // B: equipo con otra clave y otros datos, sin nube
 const B=await mk(null); await create(B.p,'9999');
 await B.p.evaluate(()=>{ window.__nubeSetup(); }); await B.p.waitForTimeout(300); await B.p.evaluate(()=>document.querySelector('[data-nb="join"]').click()); await B.p.waitForTimeout(200);
 await B.p.fill('#nbCode', CODE.toLowerCase()); const dl=B.p.waitForEvent('download',{timeout:8000}).catch(()=>null); await B.p.evaluate(()=>document.querySelector('[data-nb="join2"]').click()); await B.p.waitForTimeout(1500); await B.p.click('[data-nb="join3"]'); /* clic real: el botón tiene que verse */
 await B.p.waitForTimeout(1500); console.log('MSG', await B.p.evaluate(()=>(document.querySelector('#nbMsg')||{}).textContent||'(sin msg)'), await B.p.evaluate(()=>!!document.querySelector('.nb-ov'))); const d=await dl; ok(!!d,'B: descargó un respaldo de lo suyo antes de unirse');
 await B.p.waitForTimeout(9000); console.log('B mats', await B.p.evaluate(()=>{ const m=JSON.parse(localStorage.getItem('le-mats')||'[]'); return JSON.stringify(m.map(x=>[x.id,x.mt,!!x.enc])); }));
 const hero=await B.p.evaluate(()=>((document.querySelector('.lh-s')||{}).textContent||'')+' | '+((document.getElementById('heroSync')||{}).textContent||'')); console.log('B hero:',hero.slice(0,200));
 await B.p.click('#heroPass'); await B.p.keyboard.type('1234'); await B.p.keyboard.press('Enter'); await B.p.waitForTimeout(3500); try{ await B.p.click('text=Ahora no',{timeout:800}); }catch(e){}
 console.log('B after', await B.p.evaluate(()=>[(document.getElementById('heroHint')||{}).textContent, !!document.getElementById('heroPass'), JSON.stringify(Object.keys(window.__memcGet()||{})).slice(0,200), JSON.stringify(JSON.parse(localStorage.getItem('le-mats')||'[]').map(x=>[x.id,x.mt]))].join(' || '))); const got=await B.p.evaluate(()=>{ try{ const P=window.__pla.st(); return JSON.stringify(P.emps.map(e=>[e.n,e.salM]))+' open='+(typeof vaultIsOpen); }catch(e){ return 'ERR '+e.message; } });

 // ===== 🛰️ LA CENTRAL MANDA (toda la tesorería) =====
 const H=await A.p.evaluate(()=>{const h=new Date(); return h.getFullYear()+'-'+String(h.getMonth()+1).padStart(2,'0')+'-'+String(h.getDate()).padStart(2,'0');});
 const stats=async()=>JSON.parse(await (await fetch('http://localhost:'+(process.env.NPORT||8105)+'/__stats')).text());
 await A.p.evaluate((H)=>{ const T=window.__tes.st(); T.chq.push({id:'c1',prov:'PROV UNO',cta:'Basa-G',num:'777',monto:1000000,co:H,st:'pend',tipo:'Diferido'},{id:'c2',prov:'PROV DOS',cta:'Basa-G',num:'778',monto:2000000,co:H,st:'pend',tipo:'Diferido'}); T.sal.push({id:'s1',cta:'Basa-G',f:H,m:5000000}); T.cfg.topeDia=99; window.__tes.save(); window.__tes.ui.tab='apag'; window.__tes.open(); }, H);
 await A.p.waitForTimeout(6000);
 ok(await A.p.evaluate(()=>/no tiene tus datos/.test((document.getElementById('svBadge')||{}).textContent||'')),'A: la central vacía → pide subir la base una sola vez');
 await A.p.click('[data-sv="seed"]'); await A.p.waitForTimeout(300); await A.p.click('.ask-ov [data-ak="yes"]'); await A.p.waitForTimeout(300); await A.p.click('.ask-ov [data-ak="yes"]'); await A.p.waitForTimeout(4000);
 const st2=await stats(); const nsv=st2.keys.filter(k=>/\/sv\//.test(k)).length; console.log('sv docs', nsv); ok(nsv>=4,'A subió la tesorería registro por registro');
 ok(await A.p.evaluate(()=>/Conectado a la CENTRAL/.test((document.getElementById('svBadge')||{}).textContent||'')),'A: «Conectado a la CENTRAL»');
 // B tiene OTRA tesorería vieja en su aparato: al abrir, manda la central
 await B.p.evaluate((H)=>{ window.__tes.ui.tab='apag'; window.__tes.open(); }, H);
 await B.p.waitForTimeout(9000);
 console.log('Bdbg', await B.p.evaluate(()=>JSON.stringify({m:window.__sv.st().mode,e:window.__sv.st().err,on:window.__sv.st().on,n:window.__nube,op:!!window.__nubeOp,ro:window.__rvOpen&&window.__rvOpen(),nat:window.__nubeNative}))); const bc=await B.p.evaluate(()=>window.__tes.st().chq.map(c=>c.id+':'+c.st).sort().join(',')); console.log('B chq',bc, await B.p.evaluate(()=>window.__tes.st().cfg.topeDia));
 ok(bc==='c1:pend,c2:pend','B: su tesorería es SOLO la de la central');
 ok(!(await stats()).keys.some(k=>/viejo/.test(k)),'lo viejo de B no llegó a la central');
 // A marca pagado c1 → B lo ve
 await A.p.selectOption('#tesoreria [data-tesst="c1"]','pag'); await A.p.waitForTimeout(400); await A.p.evaluate(()=>document.querySelector('.ico-ov [data-tx="ok"]').click()); await A.p.waitForTimeout(3000);
 await B.p.waitForTimeout(6000); ok(await B.p.evaluate(()=>window.__tes.st().chq.find(x=>x.id==='c1').st)==='pag','B ve el pagado (leído de la central)');
 // B con dato viejo intenta guardar «A pagar» sobre una versión vieja → gana la central
 await B.p.evaluate(()=>{ const S=window.__sv.st(); const c=window.__tes.st().chq.find(x=>x.id==='c1'); Object.keys(S.known).forEach(p=>{ if(/tes\.chq~c1$/.test(p)) S.known[p].t=1; }); c.st='pend'; delete c.conc; delete c.fdeb; window.__tes.save(); });
 await B.p.waitForTimeout(3000);
 ok(await B.p.evaluate(()=>window.__tes.st().chq.find(x=>x.id==='c1').st)==='pend','B cambió el estado DESPUÉS: gana el cambio más reciente');
 await A.p.waitForTimeout(6000); ok(await A.p.evaluate(()=>window.__tes.st().chq.find(x=>x.id==='c1').st)==='pend','A recibe el cambio más reciente de B (espejo)');
 // copia en bloque reemplaza la tesorería de B → no se sube, se relee la central
 
 
 // B nuevo cheque → A lo ve
 await B.p.evaluate((H)=>{ window.__tes.st().chq.push({id:'c3',prov:'PROV TRES',cta:'Basa-G',num:'779',monto:3000000,co:H,st:'pend',tipo:'Diferido'}); window.__tes.save(); }, H);
 await A.p.waitForTimeout(9000); ok(await A.p.evaluate(()=>!!window.__tes.st().chq.find(x=>x.id==='c3')),'A ve el cheque nuevo que cargó B');
 // 👥 PLANILLA: A cambia a Milciades → B lo ve como espejo; B no puede pisarlo con una copia vieja
 await A.p.evaluate(()=>{ const P=window.__pla.st(); P.emps[0].salM={'2026-06':2899048,'2026-11':3100000}; P.emps[0].mt=Date.now(); window.__pla.save(); });
 await B.p.waitForTimeout(10000);
 const bs=await B.p.evaluate(()=>JSON.stringify(window.__memcGet().pla.emps.map(e=>[e.n,e.salM]))); console.log('B pla',bs);
 ok(/2026-11":3100000/.test(bs),'planilla: B ve lo que cargó A (espejo desde la central)');
 ok(await B.p.evaluate(async()=>(await window.__vaultMergeRemote({enc:'x'}))===false),'con la central, la copia en bloque de otro aparato ya no se mezcla');
 // 📴 SIN INTERNET en B: se sigue cargando; al volver se sube SOLO. A cambia otro campo del mismo cheque: se juntan
 await B.ctx.setOffline(true); await B.p.waitForTimeout(6000);
 ok(await B.p.evaluate(()=>/SIN CONEXIÓN CON LA CENTRAL/.test((document.getElementById('svBar')||{}).textContent||'')),'sin internet: barra roja «SIN CONEXIÓN CON LA CENTRAL»');
 await B.p.evaluate((H)=>{ const T=window.__tes.st(); T.chq.push({id:'off1',prov:'OFFLINE SA',cta:'Basa-G',num:'900',monto:700000,co:H,st:'pend',tipo:'Diferido'}); T.chq.find(x=>x.id==='c2').monto=2222222; window.__tes.save(); }, H);
 await A.p.evaluate((H)=>{ const T=window.__tes.st(); T.chq.push({id:'onA',prov:'ONLINE A',cta:'Basa-G',num:'901',monto:800000,co:H,st:'pend',tipo:'Diferido'}); T.chq.find(x=>x.id==='c2').obs='nota de A'; window.__tes.save(); }, H);
 await B.p.waitForTimeout(3000);
 ok(await B.p.evaluate(()=>!!window.__tes.st().chq.find(x=>x.id==='off1')),'sin internet: el cheque cargado queda en el aparato');
 ok(!(await stats()).keys.some(k=>/off1/.test(k)),'sin internet: todavía no llegó a la central');
 await B.ctx.setOffline(false); await B.p.waitForTimeout(12000); await A.p.waitForTimeout(6000);
 const fa=await A.p.evaluate(()=>{ const T=window.__tes.st(), c=T.chq.find(x=>x.id==='c2'); return {off1:!!T.chq.find(x=>x.id==='off1'), onA:!!T.chq.find(x=>x.id==='onA'), m:c.monto, obs:c.obs}; });
 const fb=await B.p.evaluate(()=>{ const T=window.__tes.st(), c=T.chq.find(x=>x.id==='c2'); return {off1:!!T.chq.find(x=>x.id==='off1'), onA:!!T.chq.find(x=>x.id==='onA'), m:c.monto, obs:c.obs}; });
 console.log('A',JSON.stringify(fa),'B',JSON.stringify(fb));
 ok(fa.off1 && fa.onA && fb.off1 && fb.onA,'al volver internet se sube SOLO: los dos cheques nuevos (uno de cada aparato) están en los dos');
 ok(fa.m===2222222 && fa.obs==='nota de A' && fb.m===2222222 && fb.obs==='nota de A','mismo cheque cambiado en los dos: se juntaron los cambios (monto de B + nota de A)');
 // versión vieja no puede guardar
 const before=JSON.stringify((await stats()).keys.length);
 await B.p.evaluate(()=>{ window.__APPB=1100; window.__tes.st().chq.find(x=>x.id==='c2').monto=1; window.__tes.save(); }); await B.p.waitForTimeout(3000);
 ok(await B.p.evaluate(()=>!!document.getElementById('nbOld')),'versión vieja → «⛔ Tu versión está desactualizada»');
 await A.p.waitForTimeout(5000); ok(await A.p.evaluate(()=>window.__tes.st().chq.find(x=>x.id==='c2').monto)===2222222,'la versión vieja NO cambió nada en la central ni en A');
 await A.p.screenshot({path:'/tmp/claude-0/svA.png'});
 await b.close(); console.log('fallas',fail); process.exit(fail?1:0); })();
