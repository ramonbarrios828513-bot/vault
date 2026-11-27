// v1348 · 🔐 a favor / deuda chica se confirma con el PIN del VENDEDOR (planilla), con o sin cliente; sin cliente queda «a favor sin identificar»
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:740}});
 await p.evaluate(()=>{ const P=window.__pla.st(); P.emps=P.emps||[]; P.emps.push({id:'eA1',n:'Ana Vendedora',suc:'KM 7',pin:'4321'}); });
 const prep=async(cli,pvp)=>{ await p.evaluate(([cli,pvp])=>{ document.querySelectorAll('.vt-ov,.vt-aut').forEach(x=>x.remove()); window.__vt.open(); const V=window.__vt.st(); V.open=true; V.iniAt=Date.now(); V.vendAct='Ana Vendedora'; V.stock={GS:{100000:5,50000:10,20000:15,10000:27,5000:17,2000:16,1000:48}}; V.pr.favTope=2000; V.pr.deuOn=true; V.pr.deuTope=2000; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{aid:'m1',n:'Prueba',q:1,pvp:pvp,uq:1,nodesc:true}]; if(cli){V.clients=V.clients||[]; if(!V.clients.find(x=>x.id==='cT1'))V.clients.push({id:'cT1',tel:'0981123456',n:'Cliente Prueba',ci:'1'}); t.cid='cT1'; t.cli='Cliente Prueba';} else {t.cid='';t.cli='';} window.__vt.open(); },[cli,pvp]); await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(600); };
 const n=()=>p.evaluate(()=>window.__vt.st().sales.length);
 // 1) sin cliente, 850 a favor
 await prep(false,18150); await p.click('.vt-ov [data-rqn="100000"]'); await p.keyboard.type('1'); await p.waitForTimeout(400);
 const n0=await n(); await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(500);
 const m=await p.evaluate(()=>{ const o=document.querySelector('.vt-aut'); return o?{t:o.innerText.replace(/\s+/g,' '),sel:o.querySelector('[data-au="who"]').selectedOptions[0].textContent}:null; });
 console.log('   '+JSON.stringify(m&&m.t.slice(0,160)));
 ok(m&&/850/.test(m.t)&&/sin identificar/.test(m.t)&&/Ana Vendedora/.test(m.sel),'sin cliente: pide el PIN del vendedor (ya elegido) para dejar ₲ 850 a favor');
 await p.fill('.vt-aut [data-au="pin"]','1111'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>/incorrecto/.test(document.querySelector('.vt-aut [data-au="m"]').textContent))&&(await n())===n0,'PIN incorrecto: no procesa');
 await p.fill('.vt-aut [data-au="pin"]','4321'); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{ const V=window.__vt.st(), s=V.sales[V.sales.length-1]; return {n:V.sales.length, fav:s.fav, sin:s.sinCli, by:s.autBy, lst:(V.sinId||[]).slice(-1)[0], open:!!document.querySelector('.vt-ov [data-vub]')}; });
 console.log('   '+JSON.stringify(r));
 ok(r.n===n0+1&&r.fav===850&&r.sin===1&&/Ana Vendedora/.test(r.by)&&r.lst&&r.lst.fav===850&&!r.open,'con el PIN correcto: venta procesada y ₲ 850 «a favor sin identificar», con quién autorizó');
 // 2) con cliente
 await p.evaluate(()=>{ window.__noAutoTk=false; window.__tkH=''; window.__nubeSP=()=>Promise.resolve('a'.repeat(64)); window.__nubeOp=async()=>true; window.__bil.warm(); const cT=window.__vt.st().clients.find(x=>x.id==='cT1'); if(cT) cT.tel='0981123456'; window.open=function(){ return { document:{ open(){}, write(h){ window.__tkH+=h; }, close(){} }, focus(){}, print(){} }; }; });
 await prep(true,18150); await p.click('.vt-ov [data-rqn="100000"]'); await p.keyboard.type('1'); await p.waitForTimeout(400);
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400); await p.fill('.vt-aut [data-au="pin"]','4321'); await p.click('.vt-aut [data-au="ok"]'); await p.waitForTimeout(800);
 const r2=await p.evaluate(()=>{ const V=window.__vt.st(), c=V.clients.find(x=>x.id==='cT1'); return {fav:c.favor, aut:(c.cta||[]).slice(-1)[0].aut}; });
 ok(r2.fav>=850&&/Ana/.test(r2.aut),'con cliente: los ₲ 850 van a su cuenta, anotado quién autorizó');
 const tk=await p.evaluate(()=>window.__tkH.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')); console.log(tk.slice(tk.indexOf('TOTAL'),tk.indexOf('Gracias')));
 ok(/Efectivo recibido 100\.000/.test(tk)&&/Vuelto entregado 81\.000/.test(tk)&&/BILLETERA VIRTUAL NISSIFARMA/.test(tk)&&/A favor \(vuelto que no llevó\) \+ 850/.test(tk)&&/Saldo de su billetera ₲ [\d.]+ a favor/.test(tk),'ticket: recibido, vuelto entregado y billetera Nissifarma con saldo');
 const th=await p.evaluate(()=>window.__tkH); ok(/id="bilQR"/.test(th)&&/qrcode\.min\.js/.test(th)&&/billetera\/index\.html#s=a{64}&k=/.test(th),'ticket con QR de la billetera del cliente'); ok(/wa\.me\/595981123456\?text=/.test(th),'botón para mandar el saldo por WhatsApp');
 // 3) deuda chica sin cliente
 await prep(false,51000); await p.click('.vt-ov [data-rqn="50000"]'); await p.keyboard.type('1'); await p.waitForTimeout(400);
 await p.click('.vt-ov [data-vp="deu"]'); await p.waitForTimeout(400); const n3=await n();
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400); await p.fill('.vt-aut [data-au="pin"]','4321'); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
 const r3=await p.evaluate(()=>{ const V=window.__vt.st(), s=V.sales[V.sales.length-1]; return {n:V.sales.length, deu:s.deu, sin:s.sinCli}; });
 console.log('   '+JSON.stringify(r3));
 ok(r3.n===n3+1&&r3.deu===1000&&r3.sin===1,'falta ₲ 1.000 y no hay cliente: con el PIN se procesa como deuda sin identificar');
 ok(!errs.length,'sin errores '+errs.join(' | '));
 console.log('fallas '+fail); await b.close(); process.exit(fail?1:0); })();
