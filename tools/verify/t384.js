// v1212 · 🔎 CONTROL DE ESPEJO (copiado del inicio de t376): un aparato que se quedó con un dato viejo (no lo trajo o quedó trabado) se corrige solo desde la central — base: nube propia: el equipo A crea la nube y sube; el equipo B (con otra clave y otros datos) se une, respalda lo suyo y queda espejo de A
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

 // ===== 🔎 CONTROL DE ESPEJO =====
 // A pone el salario correcto de junio a Milciades
 await A.p.evaluate(()=>{ const P=window.__pla.st(); P.emps[0].salM={'2026-06':2899048}; P.emps[0].sal=3044000; P.emps[0].mt=Date.now(); window.__pla.save(); });
 await B.p.waitForTimeout(8000);
 ok(await B.p.evaluate(()=>window.__memcGet().pla.emps[0].salM['2026-06'])===2899048,'B recibió el salario de junio');
 // listas vacías: viajan, se llenan y se vacían sin perder registros
 await A.p.evaluate(()=>{ window.__tes.st().cfg.listaP=[]; window.__tes.save(); }); await B.p.waitForTimeout(7000);
 ok(await B.p.evaluate(()=>Array.isArray(window.__tes.st().cfg.listaP) && window.__tes.st().cfg.listaP.length===0),'una lista VACÍA también llega al otro aparato');
 await A.p.evaluate(()=>{ window.__tes.st().cfg.listaP.push({id:'a1',n:'uno'},{id:'a2',n:'dos'}); window.__tes.save(); }); await B.p.waitForTimeout(7000);
 ok(await B.p.evaluate(()=>(window.__tes.st().cfg.listaP||[]).map(x=>x.id).join())==='a1,a2','la lista se llenó: llegan los registros y no se pierden');
 await A.p.evaluate(()=>{ window.__tes.st().cfg.listaP=[]; window.__tes.save(); }); await B.p.waitForTimeout(7000);
 ok(await B.p.evaluate(()=>Array.isArray(window.__tes.st().cfg.listaP) && window.__tes.st().cfg.listaP.length===0),'la lista se vació: queda vacía también en el otro aparato');
 // B se "descompagina": le cambiamos el dato por dentro (como si no lo hubiera traído) y le trabamos un cambio viejo sin subir; además deja de leer lo nuevo
 await B.p.evaluate(()=>{ const S=window.__sv.st(), E=window.__memcGet().pla.emps[0]; const p=Object.keys(S.known).find(k=>/pla/.test(k) && /emps/.test(k)); E.salM={'2026-06':3044000}; S.known[p]={t:1,s:JSON.stringify(E),m:S.known[p].m}; S.q[p]={base:1,bs:null,m:S.known[p].m,s:'x',at:Date.now()-600000,enc:'roto'}; S.since=9e15; window.__pBad=p; });
 const bad=await B.p.evaluate(()=>window.__memcGet().pla.emps[0].salM['2026-06']); ok(bad===3044000,'B quedó con el dato equivocado (3.044.000 en junio)');
 const tagBefore=await B.p.evaluate(()=>(document.getElementById('verTag')||{}).textContent||''); console.log('tag', tagBefore);
 const C=await B.p.evaluate(()=>window.__sv.check(true)); console.log('chk', JSON.stringify(C));
 ok(await B.p.evaluate(()=>window.__memcGet().pla.emps[0].salM['2026-06'])===2899048,'🔎 el control de espejo trajo de la central el salario correcto de junio');
 ok(C && C.fix>=1 && C.stuck>=1,'corrigió lo trabado: ganó la central');
 ok(await B.p.evaluate(()=>!window.__sv.st().q[window.__pBad]),'el cambio trabado ya no queda colgado');
 await B.p.waitForTimeout(2500); const tag=await B.p.evaluate(()=>(document.getElementById('verTag')||{}).textContent||''); console.log('tag', tag);
 ok(/ESPEJO · al día \d\d\/\d\d\/\d{4},? \d\d:\d\d:\d\d/.test(tag),'el cartel de arriba dice «✅ ESPEJO');
 await B.p.evaluate(()=>document.getElementById('verTag').click()); await B.p.waitForTimeout(400);
 ok(await B.p.evaluate(()=>/Registros en la central/.test((document.getElementById('svChk')||{}).textContent||'')),'tocando el cartel se ve el detalle del espejo');
 // sin la central encendida → cartel rojo
 await B.p.evaluate(()=>{ document.getElementById('svChk').remove(); window.__sv.st().on=false; }); await B.p.waitForTimeout(2500);
 ok(/NO ES ESPEJO/.test(await B.p.evaluate(()=>(document.getElementById('verTag')||{}).textContent||'')),'si el aparato no lee la central, el cartel se pone rojo: «NO ES ESPEJO»');
 // aparato con un dato distinto SIN cambio pendiente (como el OPPO): al entrar queda como la central
 await B.p.evaluate(()=>{ window.__memcGet().pla.emps[0].salM={'2026-06':4000000}; });
 await B.p.evaluate(()=>{ window.__sv.st().on=true; }); await B.p.evaluate(()=>window.__sv.entry()); await B.p.waitForTimeout(4000);
 ok(await B.p.evaluate(()=>window.__memcGet().pla.emps[0].salM['2026-06'])===2899048,'al entrar: el salario distinto del aparato (4.000.000) queda como la central (2.899.048)');
 // al entrar: actualiza con la central y muestra hora, versión y último dato con su aparato
 await B.p.evaluate(()=>{ window.__sv.st().on=true; }); await B.p.evaluate(()=>window.__sv.entry()); await B.p.waitForTimeout(4000);
 const eb=await B.p.evaluate(()=>(document.getElementById('svEntry')||{}).textContent||''); console.log('entry', eb);
 ok(/Actualizado con la central a las \d\d:\d\d/.test(eb) && /v12\d\d/.test(eb) && /Último dato cargado/.test(eb),'al entrar: «Actualizado con la central a las HH:MM · versión · último dato cargado en …»');
 // aparato del dueño conectado a la central: al bloquearse muestra SU clave y el cartel no asusta
 await B.p.evaluate(()=>{ try{ localStorage.removeItem('wk-face'); sessionStorage.removeItem('wk-face'); }catch(e){} }); await B.p.reload(); await B.p.waitForTimeout(4000);
 const lk=await B.p.evaluate(()=>({code:!!document.getElementById('wkCode'), pass:!!document.getElementById('heroPass'), tag:(document.getElementById('verTag')||{}).textContent||''})); console.log('lock', JSON.stringify(lk));
 ok(!lk.code && lk.pass,'aparato del dueño (con la central) bloqueado: muestra SU clave, no la instalación de empleados');
 ok(!/NO ES ESPEJO/.test(lk.tag),'con el Baúl cerrado el cartel no dice «NO ES ESPEJO»');
 await b.close(); console.log('fallas',fail); process.exit(fail?1:0); })();
