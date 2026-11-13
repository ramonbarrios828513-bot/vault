// v1213 · 🛰️ aparatos de TRABAJO conectados a la central con llave de trabajo (solo cierres) — base copiada de t376 — base: nube propia: el equipo A crea la nube y sube; el equipo B (con otra clave y otros datos) se une, respalda lo suyo y queda espejo de A
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

 // ===== 🛰️ APARATO DE TRABAJO EN LA CENTRAL =====
 await A.p.evaluate(()=>{ const S=window.__cz.st(); S.cfg=S.cfg||{}; S.cfg.wkOwn={oh:'OH-PRUEBA-123'}; window.__tes.save(); });
 await A.p.evaluate(()=>window.__czCenT.setup()); await A.p.waitForTimeout(1500);
 const C=await A.p.evaluate(()=>window.__cz.st().cfg.wkCen); console.log('wkCen', C && C.sp && C.sp.slice(0,8), C && C.reg);
 ok(C && C.sp && C.k && C.reg===1,'el dueño creó y habilitó en la central la llave de trabajo');
 // aparato de trabajo nuevo (sin nube del dueño): recibe la llave (como por el puente)
 const W=await mk(null); await create(W.p,'5555');
 await W.p.evaluate((C)=>{ localStorage.setItem('iv-work', JSON.stringify({on:1,solo:1,oh:'OH-PRUEBA-123'})); const S=window.__cz.st(); S.cfg=S.cfg||{}; S.cfg.wkCen=C; window.__tes.save(); }, C);
 const H2=await W.p.evaluate(()=>{const h=new Date(); return h.getFullYear()+'-'+String(h.getMonth()+1).padStart(2,'0')+'-'+String(h.getDate()).padStart(2,'0');});
 await W.p.evaluate((H)=>{ const S=window.__cz.st(); S.t=S.t||[]; S.t.push({id:'zW1',n:9001,f:H,suc:'Local 1 KM7',caja:'Caja 1',caj:'VIRGILIO',v:{ef:150000},sobre:150000,deja:0,reg:new Date().toISOString()}); window.__tes.save(); }, H2);
 await W.p.evaluate(()=>window.__czCenT.run()); await W.p.waitForTimeout(500);
 const stW=await stats(); console.log('wk keys', stW.keys.filter(k=>/wk\//.test(k)).slice(0,6)); ok(stW.keys.some(k=>/wk\/y[0-9a-f]+\/cz-zW1/.test(k)),'el cierre del aparato de trabajo llegó DIRECTO a la central (carpeta de cierres)');
 await A.p.evaluate(()=>window.__czCenT.run()); await A.p.waitForTimeout(500);
 ok(await A.p.evaluate(()=>!!window.__cz.st().t.find(x=>x.id==='zW1')),'el dueño lee ese cierre de la central (sin puente)');
 await A.p.evaluate((H)=>{ const S=window.__cz.st(); S.t.push({id:'zA1',n:9002,f:H,suc:'Local 1 KM7',caja:'Caja 1',caj:'RAMON',v:{ef:99000},sobre:99000,deja:0,reg:new Date().toISOString()}); window.__tes.save(); }, H2);
 await A.p.evaluate(()=>window.__czCenT.run()); await W.p.evaluate(()=>window.__czCenT.run()); await W.p.waitForTimeout(500);
 ok(await W.p.evaluate(()=>!!window.__cz.st().t.find(x=>x.id==='zA1')),'el aparato de trabajo recibe de la central lo que cargó el dueño');
 await W.p.waitForTimeout(2500); const tag=await W.p.evaluate(()=>(document.getElementById('verTag')||{}).textContent||''); console.log('tag W', tag);
 ok(/CENTRAL · cierres al día \d\d\/\d\d\/\d{4}/.test(tag),'cartel del aparato de trabajo: «🛰️ CENTRAL · cierres al día …»');
 const deny=await W.p.evaluate(async()=>{ try{ await window.__czCenT.op([{op:'list',p:'data/users'}]); return 'paso'; }catch(e){ return e.message; } }); console.log('deny', deny);
 ok(/baja|forbidden/.test(deny),'la llave de trabajo NO puede leer nada fuera de los cierres');
 await A.p.evaluate(async(C)=>{ await window.__nubeOp({op:'wkdel',p:'meta/wk',h:C.k}); }, C);
 const deny2=await W.p.evaluate(async()=>{ try{ await window.__czCenT.op([{op:'get',p:'wk/x/czh'}]); return 'paso'; }catch(e){ return e.message; } }); console.log('deny2', deny2);
 ok(/dada de baja/.test(deny2),'el dueño da de baja la llave: ese aparato ya no entra a la central');
 await b.close(); console.log('fallas',fail); process.exit(fail?1:0); })();
