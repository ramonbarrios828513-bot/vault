// v1248 · 🗄️ memoria del navegador LLENA: el Baúl pasa solo al almacén grande (IndexedDB), sigue guardando y al volver a entrar está todo
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(800);
 // llenar la memoria chica hasta que no entre más
 const fill=await p.evaluate(()=>{ const big='x'.repeat(256*1024); let i=0; try { for(;i<200;i++) localStorage.setItem('zz-relleno-'+i, big); } catch(e){} for (const sz of [16384,1024,64,8]) { const t='y'.repeat(sz); try { for(let j=0;j<5000;j++) localStorage.setItem('zz-r'+sz+'-'+j, t); } catch(e){} } return i; });
 console.log('   relleno: '+fill+' bloques');
 await p.evaluate(()=>{ const T=window.__tes.st(); T.cfg.emp={nom:'EMPRESA PRUEBA',ruc:'1234567',dv:'8'}; T.chq.push({id:'k-full',prov:'PARMA',cta:'Basa-G',num:'77',monto:9,em:'2026-11-17',co:'2026-11-18',st:'pend'}); });
 const st=await p.evaluate(async()=>{ window.__saveSt=null; window.__vaultSaveNow(); await new Promise(r=>setTimeout(r,1500)); return { S: window.__saveSt, idb: window.__kv.idb(), mark: !!localStorage.getItem('le-mats-idb'), ls: !!localStorage.getItem('le-mats') }; });
 console.log('   '+JSON.stringify(st));
 ok(st.S && st.S.ok===true,'con la memoria chica llena, el guardado igual sale ✅');
 ok(st.idb && st.mark && !st.ls,'pasó solo al almacén grande y liberó la memoria chica');
 // volver a entrar
 await p.reload(); await p.waitForTimeout(1500);
 await p.click('#heroPass'); await p.keyboard.type('1234'); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
 try{await p.click('text=Ahora no',{timeout:1000});}catch(e){}
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(800);
 const back=await p.evaluate(()=>{ const T=window.__tes.st(); return { emp:(T.cfg.emp||{}).nom, chq:T.chq.some(c=>c.id==='k-full') }; });
 console.log('   '+JSON.stringify(back));
 ok(back.emp==='EMPRESA PRUEBA' && back.chq,'al volver a entrar están las empresas y el cheque');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
