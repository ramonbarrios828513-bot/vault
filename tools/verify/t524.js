// v1285 · cada renglón de la venta muestra su CÓDIGO PADRE Nissi, la descripción del padre y el PVP de la caja (y avisa si la presentación tiene PVP propio distinto del proporcional)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.arts.vaP={id:'vaP',va:1,n:'Kitadol Padre T524',pc:'',u:20,bar:['7790000005240'],rx:'libre',neg:'pvp',pvp:20000,costo:7000,cod:'7',frac:true}; V.pres.vaP=[{id:'caja',dsc:'Kitadol T524 · Caja x20'},{id:'ptab',t:'tab',n:'Tira x10',q:10,bar:'7790000005241',cost:3500,pvp:50000,pman:true,dsc:'Kitadol T524 · Tira x10'},{id:'pfr',t:'fr',n:'Fracción',q:1,bar:'7790000005242',cost:350,pvp:1000,dsc:'Kitadol T524 · FR'}]; V.stk.vaP=100; const t=V.tabs[0]; V.cur=t.id; t.lines=[]; window.__vt.open(); });
 await p.waitForTimeout(300);
 for(const bar of ['7790000005241','7790000005242']){ await p.fill('#vtQ',bar); await p.keyboard.press('Enter'); await p.waitForTimeout(300); }
 const tx=await p.evaluate(()=>[...document.querySelectorAll('#ventas .vt-padre')].map(x=>x.textContent));
 ok(tx.length===2&&tx.every(x=>/Código padre Nissi 7/.test(x)&&/Kitadol Padre T524/.test(x)&&/PVP caja ₲ 20\.000/.test(x)),'cada renglón muestra el código padre Nissi 7 con su descripción y PVP de la caja: '+tx[0]);
 ok(/proporcional ₲ 10\.000/.test(tx[0])&&/PVP propio ₲ 50\.000/.test(tx[0]),'la tira avisa: proporcional ₲ 10.000 pero tiene PVP propio ₲ 50.000');
 ok(!/PVP propio/.test(tx[1]),'la fracción (₲ 1.000 = proporcional) no avisa nada');
 await p.fill('#vtQ','T524'); await p.waitForTimeout(300); const rs=await p.evaluate(()=>document.getElementById('vtRes').textContent); ok(/Nissi 7/.test(rs)&&/padre: Kitadol Padre T524/.test(rs),'el buscador muestra el código padre');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
