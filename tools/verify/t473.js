// v1261 · 🛰️ TURNO: un aparato atrasado (sin internet) que toca OTRA cosa del funcionario NO devuelve el turno viejo · base copiada de t384 · (copiado del inicio de t376): un aparato que se quedó con un dato viejo (no lo trajo o quedó trabado) se corrige solo desde la central — base: nube propia: el equipo A crea la nube y sube; el equipo B (con otra clave y otros datos) se une, respalda lo suyo y queda espejo de A
const { chromium } = require('/opt/node-tools/node_modules/playwright');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
const URL='http://localhost:'+(process.env.NPORT||8105)+'/work.html', CODE='NISSI-ABCD-EFGH-JKLM-NPQR-STUV';
(async()=>{ const b=await chromium.launch();
 const mk=async(code)=>{ const ctx=await b.newContext({viewport:{width:1366,height:900}, acceptDownloads:true}); await ctx.route(/fonts\.googleapis|jsdelivr|gstatic|cdnjs/, r=>r.abort()); await ctx.addInitScript((c)=>{ window.__plModeOK=true; window.__dblOK=true; try{ localStorage.setItem('wk-face','fam'); if(c && !localStorage.getItem('nube-code')) localStorage.setItem('nube-code',c); }catch(e){} }, code); const p=await ctx.newPage(); p.on('dialog',d=>d.accept()); return {ctx,p}; };
 const create=async(p,pw)=>{ await p.goto(URL); await p.waitForSelector('#heroPass',{timeout:15000}); await p.waitForTimeout(800); await p.click('#heroPass'); await p.keyboard.type(pw); await p.click('#heroPass2'); await p.keyboard.type(pw); await p.click('text=Crear y entrar'); await p.waitForTimeout(2500); try{ await p.click('text=Ahora no',{timeout:800}); }catch(e){} };
 // A: crea su nube con datos
 const A=await mk(CODE); await A.ctx.addInitScript(()=>{ try{ localStorage.setItem('nube-role','first'); }catch(e){} }); await create(A.p,'1234');
 await A.p.evaluate(()=>{ window.__pla.open(); }); await A.p.waitForTimeout(800);
 await A.p.evaluate(()=>{ const P=window.__pla.st(); P.emps=P.emps||[]; if(!P.emps.length) P.emps.push({id:'eM',n:'EMPLEADO PRUEBA',days:{},con:{}}); P.emps[0].salM={'2026-06':2899048}; P.emps[0].sch=[0,1,2,3,4,5,6].map(i=>({e:'06:30',s:'23:00',off:i===0})); P.emps[0].turnoX='HÍBRIDO'; window.__pla.save(); });
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


 const stats=async()=>JSON.parse(await (await fetch('http://localhost:'+(process.env.NPORT||8105)+'/__stats')).text());
 await A.p.evaluate(()=>{ window.__tes.ui.tab='apag'; window.__tes.open(); }); await A.p.waitForTimeout(6000);
 try{ await A.p.click('[data-sv="seed"]',{timeout:3000}); await A.p.waitForTimeout(300); await A.p.click('.ask-ov [data-ak="yes"]'); await A.p.waitForTimeout(300); await A.p.click('.ask-ov [data-ak="yes"]'); }catch(e){ console.log('seed?',e.message.slice(0,80)); } await A.p.waitForTimeout(5000);
 await B.p.evaluate(()=>{ window.__tes.ui.tab='apag'; window.__tes.open(); }); await B.p.waitForTimeout(9000);
 const sch=(X)=>X.p.evaluate(()=>{ const E=window.__pla.st().emps.find(e=>e.id==='eM'); return E? E.sch[1].e+'-'+E.sch[1].s : 'sin-emp'; });
 console.log('inicio A',await sch(A),'B',await sch(B));
 ok(await sch(B)==='06:30-23:00','B ve al funcionario desde la central');
 // B se queda SIN internet
 await B.ctx.setOffline(true); await B.p.waitForTimeout(3000);
 // A aplica tarde-noche 15–23
 await A.p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps.find(e=>e.id==='eM'), C=P.cfg; const t=window.__pla.st().cfg && (window.__plaTurs? null:null); const T=(C.turnos||[]).find(t=>t.e==='15:00'&&t.s==='23:00'); window.__plTurApply(E,C,T?T.id:'tn','2026-06',true); E.mt=Date.now(); window.__pla.save(); });
 await A.p.waitForTimeout(1500); await A.p.evaluate(()=>window.__sv.push()); await A.p.waitForTimeout(5000);
 console.log('A después de aplicar',await sch(A));
 // B, sin internet, toca OTRA cosa del mismo funcionario (un día y una nota)
 await B.p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps.find(e=>e.id==='eM'); E.days=E.days||{}; E.days['2026-11']=E.days['2026-11']||{}; E.days['2026-11']['5']={e:'15:10',s:'23:00'}; E.nota='cargado en B sin internet'; E.mt=Date.now(); window.__pla.save(); });
 await B.p.waitForTimeout(1500); await B.p.evaluate(()=>window.__sv.push()); await B.p.waitForTimeout(2000);
 // segundo cambio sin internet (antes se perdía la base y el aparato pisaba la ficha entera)
 await B.p.evaluate(()=>{ const P=window.__pla.st(), E=P.emps.find(e=>e.id==='eM'); E.days['2026-11']['6']={e:'15:00',s:'23:00'}; E.mt=Date.now(); window.__pla.save(); }); await B.p.waitForTimeout(1500); await B.p.evaluate(()=>window.__sv.push()); await B.p.waitForTimeout(2000);
 // vuelve internet
 await B.ctx.setOffline(false); await B.p.waitForTimeout(4000); for(let k=0;k<3;k++){ await B.p.evaluate(()=>window.__sv.push().catch(()=>{})); await B.p.waitForTimeout(4000); await A.p.evaluate(()=>window.__sv.pull().catch(()=>{})); await B.p.evaluate(()=>window.__sv.pull().catch(()=>{})); await B.p.waitForTimeout(3000); }
 const a=await sch(A), bb=await sch(B); console.log('final A',a,'B',bb, await B.p.evaluate(()=>JSON.stringify(Object.keys(window.__sv.st().q))));
 const extra=await A.p.evaluate(()=>{ const E=window.__pla.st().emps.find(e=>e.id==='eM'); return [E.nota, ((E.days||{})['2026-11']||{})['5']?'dia':'sin-dia'].join('|'); });
 ok(a==='15:00-23:00','A sigue con 15:00–23:00 (B atrasado no lo devolvió) → '+a);
 ok(bb==='15:00-23:00','B quedó espejo: 15:00–23:00 → '+bb);
 ok(extra==='cargado en B sin internet|dia','lo que B cargó sin internet (nota y día) SÍ llegó a A → '+extra);

 // ===== 🛡️ SOLO SUBE LO EDITADO: B solo «mira»; un cambio automático NO llega a la central =====
 await B.p.evaluate(()=>{ window.__svStrict=true; window.__svI.at=0; const E=window.__pla.st().emps.find(e=>e.id==='eM'); E.sch[1]={e:'06:30',s:'23:00',off:false}; E.nota='cambio solo'; window.__pla.save(); });
 await B.p.waitForTimeout(800); await B.p.evaluate(()=>window.__sv.push()); await B.p.waitForTimeout(4000); await A.p.evaluate(()=>window.__sv.pull()); await A.p.waitForTimeout(2000);
 const a2=await sch(A), b2=await sch(B), al=await B.p.evaluate(()=>window.__svI.autoL.length), an=await A.p.evaluate(()=>window.__pla.st().emps.find(e=>e.id==='eM').nota);
 ok(a2==='15:00-23:00'&&an!=='cambio solo','un cambio que nadie editó NO llega a la central ('+a2+' / '+an+')');
 ok(b2==='15:00-23:00'&&al>0,'el aparato que solo miraba vuelve a ser espejo de la central ('+b2+')');
 // B edita DE VERDAD (toque con el dedo en un botón de guardar)
 await B.p.evaluate(()=>{ const x=document.createElement('button'); x.id='tGuardar'; x.textContent='Guardar nota'; x.style.cssText='position:fixed;top:300px;left:300px;z-index:2147483647'; x.onclick=()=>{ const E=window.__pla.st().emps.find(e=>e.id==='eM'); E.nota='editado a mano'; window.__pla.save(); }; document.body.appendChild(x); document.querySelectorAll('.ico-ov,.ask-ov,.dbl-ov').forEach(o=>o.remove()); });
 await B.p.click('#tGuardar',{force:true}); await B.p.waitForTimeout(1500); try{ await B.p.click('.dbl-ov [data-dbl="ok"], .dbl-ov button:has-text("Sí")',{timeout:1500}); }catch(e){} await B.p.waitForTimeout(1200);
 await B.p.evaluate(()=>window.__sv.push()); await B.p.waitForTimeout(4000); await A.p.evaluate(()=>window.__sv.pull()); await A.p.waitForTimeout(2000);
 const an2=await A.p.evaluate(()=>window.__pla.st().emps.find(e=>e.id==='eM').nota); console.log('nota B', await B.p.evaluate(()=>window.__pla.st().emps.find(e=>e.id==='eM').nota));
 ok(an2==='editado a mano','lo que se editó y guardó a mano SÍ llega a la central ('+an2+')');
 await b.close(); process.exit(fail?1:0); })();
