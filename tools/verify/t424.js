// v1237 · pedido por proveedor: ⭐ solo central (independiente) o 🏪 general con sucursales; lo que pidió cada sucursal llega solo a la central y se marca de dónde vino
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 const open=async(mode)=>{ await p.evaluate(()=>{ const a=document.getElementById('articulos'); a.querySelector('[data-ar="tab"][data-v="neg"]') && 0; window.__ar.st().ui.ng=null; window.__ar.open(); }); await p.waitForTimeout(500); await p.click('#articulos .cp-b.o'); await p.waitForTimeout(300); await p.click('#plOv [data-pl="'+mode+'"]'); await p.fill('#plQ','distrimed'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200); };
 // monitor de la sucursal KM 8
 await p.evaluate(()=>{ window.__ar.st().ui.miSuc='Local 2 KM8'; });
 await open('msuc');
 ok(await p.evaluate(()=>!!document.querySelector('#articulos .ng-sx')),'🏪 general con sucursales: se ven los bloques de sucursales');
 const r='#articulos [data-ngrowid="demo23"]';
 await p.fill(r+' [data-k="qs:Local 2 KM8"]','7'); await p.waitForTimeout(300);
 ok(/pidió la sucursal/.test(await p.evaluate(r=>document.querySelector(r+' [data-k="qs:Local 2 KM8"]').closest('td').innerText,r)),'lo que carga la sucursal queda marcado «✋ pidió la sucursal»');
 // otro aparato (Franco) hizo su propia orden del mismo proveedor
 await p.evaluate(()=>{ const A=window.__ar.st(); const n=Object.values(A.negs).find(x=>!x.del&&x.plan&&/distrimed/i.test(x.prov)); const m=JSON.parse(JSON.stringify(n)); m.id='zzz'+n.id; m.lines.forEach(l=>{ l.qs={}; l.qst={}; l.qsrc={}; }); const L=m.lines.find(l=>l.id==='demo23'); L.qs={'Local 4 Franco':'4'}; L.qst={'Local 4 Franco':Date.now()}; L.qsrc={'Local 4 Franco':{s:'m',by:'Local 4 Franco',t:Date.now()}}; A.negs[m.id]=m; });
 // la central abre el proveedor
 await p.evaluate(()=>{ window.__ar.st().ui.miSuc=''; });
 await open('msuc');
 const L=await p.evaluate(()=>{ const A=window.__ar.st(); const ns=Object.values(A.negs).filter(x=>!x.del&&x.plan&&/distrimed/i.test(x.prov)); const l=ns[0].lines.find(x=>x.id==='demo23'); return {n:ns.length,qs:l.qs,q:l.q}; }); console.log('   '+JSON.stringify(L));
 ok(L.n===1 && +L.qs['Local 2 KM8']===7 && +L.qs['Local 4 Franco']===4 && +L.q===11,'la central trae SOLAS las solicitudes de KM 8 y Franco en una sola orden (total 11)');
 await p.fill(r+' [data-k="qs:Local 2 KM8"]','9'); await p.waitForTimeout(300);
 ok(/corregido en central/.test(await p.evaluate(r=>document.querySelector(r+' [data-k="qs:Local 2 KM8"]').closest('td').innerText,r)),'el gerente puede corregir: queda «✏️ corregido en central»');
 await p.fill(r+' [data-k="env:Local 2 KM8"]','5'); await p.waitForTimeout(300);
 const pv=await p.evaluate(r=>[document.querySelector(r+' [data-ngi$="|i:sucp:Local 2 KM8"]').innerText, document.querySelector(r+' [data-ngi$="|i:gq"]').innerText, document.querySelector(r+' [data-ngi$="|i:gr"]').innerText],r); console.log('   KM 8 queda proveedor · total proveedor · total pedido: '+pv.join(' · '));
 ok(pv[0]==='4' && pv[1]==='8' && pv[2]==='13','KM 8 pidió 9, la central le envía 5 → quedan 4 para el proveedor; total al proveedor 8 de 13 pedidos');
 await p.evaluate(()=>{ window.__ar.st().ui.ng=null; window.__ar.open(); }); await p.waitForTimeout(600);
 ok(await p.evaluate(()=>/Las sucursales ya pidieron/.test(document.querySelector('#articulos').innerText) && /Distrimed/.test(document.querySelector('#articulos .cp-req').innerText)),'📥 en Compras avisa: «Las sucursales ya pidieron · Distrimed»');
 await open('mcen');
 ok(await p.evaluate(()=>!document.querySelector('#articulos .ng-sx')),'⭐ solo la central: orden independiente, sin bloques de sucursales');
 const n2=await p.evaluate(()=>Object.values(window.__ar.st().negs).filter(x=>!x.del&&x.plan&&/distrimed/i.test(x.prov)).map(x=>x.solo?'solo':'gen').sort().join()); ok(n2==='gen,solo','la orden solo central es aparte de la general ('+n2+')');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
