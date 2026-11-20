// v1290 · 📋 Faltan completar → «Montos de Fortaleza y Rodan» abre Gestión de cheques en DEUDAS Y PRÉSTAMOS (antes volvía al inicio) y la deuda se puede editar y guardar
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(); T.deu.push({id:'dF1',acr:'Fortaleza T528',tipo:'Cooperativa',tit:'Ramón',saldo:50000000,cuota:2500000,es:'Fija',faltan:20,dia:10,est:'Activo'}); });
 await p.evaluate(()=>document.querySelector('[data-fcopen]').click()); await p.waitForTimeout(800);
 await p.evaluate(()=>{ const bs=[...document.querySelectorAll('#faltan [data-fc="go"]')]; let bt=null; for(const x of bs){ let n=x; for(let k=0;k<4&&n;k++){ n=n.parentElement; if(n&&/Fortaleza y Rodan/.test(n.textContent)&&n.textContent.length<400){bt=x;break;} } if(bt) break; } bt.click(); }); await p.waitForTimeout(900);
 const st=await p.evaluate(()=>({vis:[...document.querySelectorAll('.big-ov')].filter(x=>!x.hidden).map(x=>x.id), on:(document.querySelector('#tesoreria [data-tes="tab"].on')||{}).textContent||''}));
 ok(st.vis.includes('tesoreria')&&/DEUDAS Y PRÉSTAMOS/.test(st.on),'abre Gestión de cheques en DEUDAS Y PRÉSTAMOS: '+JSON.stringify(st));
 await p.click('#tesoreria [data-tx2="deuE"]'); await p.waitForTimeout(500);
 await p.evaluate(()=>{ const i=[...document.querySelectorAll('[data-k="cuota"]')].filter(x=>x.offsetParent!==null).pop(); i.value='2.600.000'; i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); const bs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&/Guardar/.test(x.textContent)); bs[bs.length-1].click(); }); await p.waitForTimeout(700);
 const c=await p.evaluate(()=>window.__tes.st().deu.find(x=>x.acr==='Fortaleza T528').cuota); ok(c===2600000,'la cuota se editó y guardó: '+c);
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
