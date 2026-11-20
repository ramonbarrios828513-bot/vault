// v1292 · Faltan completar: al guardar NO salta solo (la barra dice ✅ Guardado) y «⬅ Volver» te devuelve paso a paso a la guía, no al inicio
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(); T.deu.push({id:'dF1',acr:'Fortaleza T531',tipo:'Cooperativa',tit:'Ramón',saldo:50000000,cuota:2500000,es:'Fija',faltan:20,dia:10,est:'Activo'}); });
 const vis=()=>p.evaluate(()=>[...document.querySelectorAll('.big-ov')].filter(x=>!x.hidden&&x.id!=='ciudad').map(x=>x.id));
 const goFort=async()=>{ await p.evaluate(()=>{ const bs=[...document.querySelectorAll('#faltan [data-fc="go"]')]; let bt=null; for(const x of bs){ let n=x; for(let k=0;k<4&&n;k++){ n=n.parentElement; if(n&&/Fortaleza y Rodan/.test(n.textContent)&&n.textContent.length<400){bt=x;break;} } if(bt) break; } bt.click(); }); await p.waitForTimeout(900); };
 await p.evaluate(()=>document.querySelector('[data-fcopen]').click()); await p.waitForTimeout(700); await goFort();
 await p.click('#tesoreria [data-tx2="deuE"]'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ const i=[...document.querySelectorAll('[data-k="cuota"]')].filter(x=>x.offsetParent!==null).pop(); i.value='2.700.000'; i.dispatchEvent(new Event('input',{bubbles:true})); const bs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&/Guardar/.test(x.textContent)); bs[bs.length-1].click(); }); await p.waitForTimeout(1500);
 let v=await vis(); ok(v.includes('tesoreria')&&!v.includes('faltan'),'después de guardar NO salta solo: sigue en Gestión de cheques '+v);
 const bar=await p.evaluate(()=>{ const b=document.getElementById('fcBack'); return b?b.className+' '+b.textContent:''; }); ok(/ok/.test(bar)&&/Guardado/.test(bar),'la barra avisa ✅ Guardado: '+bar);
 await p.click('#tesoreria [data-tes="x"]'); await p.waitForTimeout(800);
 v=await vis(); ok(v.includes('faltan'),'⬅ Volver de Gestión de cheques vuelve a la guía (no al inicio): '+v);
 await goFort(); await p.click('#vxBack'); await p.waitForTimeout(800); v=await vis(); ok(v.includes('faltan')&&!v.includes('tesoreria'),'el botón amarillo ⬅ Volver también vuelve a la guía: '+v);
 await p.click('#vxBack'); await p.waitForTimeout(600); v=await vis(); ok(!v.includes('faltan'),'desde la guía, ⬅ Volver sale normal: '+v);
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
