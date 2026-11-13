// 🛰️ el servidor manda (cheques) — base: nube propia: el equipo A crea la nube y sube; el equipo B (con otra clave y otros datos) se une, respalda lo suyo y queda espejo de A
const { chromium } = require('/opt/node-tools/node_modules/playwright');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
const URL='http://localhost:'+(process.env.NPORT||8105)+'/work.html', CODE='NISSI-ABCD-EFGH-JKLM-NPQR-STUV';
(async()=>{ const b=await chromium.launch();
 const mk=async(code)=>{ const ctx=await b.newContext({viewport:{width:1366,height:900}, acceptDownloads:true}); await ctx.route(/fonts\.googleapis|jsdelivr|gstatic|cdnjs/, r=>r.abort()); await ctx.addInitScript((c)=>{ window.__plModeOK=true; window.__dblOK=true; try{ localStorage.setItem('wk-face','fam'); if(c && !localStorage.getItem('nube-code')) localStorage.setItem('nube-code',c); }catch(e){} }, code); const p=await ctx.newPage(); p.on('dialog',d=>d.accept()); return {ctx,p}; };
 const create=async(p,pw)=>{ await p.goto(URL); await p.waitForSelector('#heroPass',{timeout:15000}); await p.waitForTimeout(800); await p.click('#heroPass'); await p.keyboard.type(pw); await p.click('#heroPass2'); await p.keyboard.type(pw); await p.click('text=Crear y entrar'); await p.waitForTimeout(2500); try{ await p.click('text=Ahora no',{timeout:800}); }catch(e){} };
 // A: crea su nube con datos
 const A=await mk(CODE); await A.ctx.addInitScript(()=>{ try{ localStorage.setItem('nube-role','first'); }catch(e){} }); await A.ctx.addInitScript(()=>{ try{ localStorage.setItem('nube-role','first'); }catch(e){} }); await create(A.p,'1234');
 await A.p.evaluate(()=>{ window.__pla.open(); }); await A.p.waitForTimeout(800);
 await A.p.evaluate(()=>{ const P=window.__pla.st(); P.emps=P.emps||[]; if(!P.emps.length) P.emps.push({id:'eM',n:'MILCIADES PRUEBA',days:{},con:{}}); P.emps[0].salM={'2026-06':2899048}; window.__pla.save(); });
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
 // ===== dato muy grande: no se pierde al recargar y se sube cuando entra =====
 const H=await A.p.evaluate(()=>{const h=new Date(); return h.getFullYear()+'-'+String(h.getMonth()+1).padStart(2,'0')+'-'+String(h.getDate()).padStart(2,'0');});
 await A.p.evaluate((H)=>{ const T=window.__tes.st(); T.chq.push({id:'g1',prov:'GRANDE',cta:'Basa-G',num:'1',monto:1,co:H,st:'pend',obs:'x'.repeat(90000)},{id:'n1',prov:'NORMAL',cta:'Basa-G',num:'2',monto:2,co:H,st:'pend'}); window.__tes.save(); window.__tes.ui.tab='apag'; window.__tes.open(); }, H);
 await A.p.waitForTimeout(6000); await A.p.click('[data-sv="seed"]'); await A.p.waitForTimeout(300); await A.p.click('.ask-ov [data-ak="yes"]'); await A.p.waitForTimeout(300); await A.p.click('.ask-ov [data-ak="yes"]'); await A.p.waitForTimeout(6000);
 const st0=await stats(); ok(st0.keys.some(k=>/chq~n1/.test(k)) && !st0.keys.some(k=>/chq~g1/.test(k)),'el dato grande no entró (límite) y el normal sí');
 // recargar A: el grande NO se pierde
 await A.p.reload(); await A.p.waitForSelector('#heroPass',{timeout:15000}); await A.p.waitForTimeout(800); await A.p.click('#heroPass'); await A.p.keyboard.type('1234'); await A.p.keyboard.press('Enter'); await A.p.waitForTimeout(4000);
 await A.p.evaluate(()=>{ window.__tes.ui.tab='apag'; window.__tes.open(); }); await A.p.waitForTimeout(9000);
 ok(await A.p.evaluate(()=>!!window.__tes.st().chq.find(x=>x.id==='g1')),'al recargar, el dato que nunca llegó a la central NO se pierde');
 await b.close(); console.log('fallas',fail); process.exit(fail?1:0); })();
