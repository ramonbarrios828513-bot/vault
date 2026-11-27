// v1347 · 📊 tablero de cheques: barra del mes con lo PAGADO (verde) y lo que FALTA (rojo), y lo mismo semana por semana, día por día y mes a mes
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 await p.evaluate(()=>{ window.__tes.open(); const T=window.__tes.st(), d=new Date(), m=d.toISOString().slice(0,7); const mk=(dd,mo,st)=>({id:'t'+Math.random().toString(36).slice(2),prov:'PROV '+dd,monto:mo,co:m+'-'+dd,f:m+'-'+dd,st:st,tipo:'diferido',fp:'cheque',num:String(Math.floor(Math.random()*1e6)),cta:'Basa-G'}); T.chq.push(mk('05',400000000,'pag'),mk('20',100000000,'pend')); window.__tes.ui.tab='tb'; window.__tes.draw(); }); await p.waitForTimeout(900);
 const r=await p.evaluate(()=>{ const a=document.querySelector('#tesoreria'); const t=a.innerText; const bar=a.querySelector('.tb-mp'); return {pag:/Pagado: ₲ 400\.000\.000 \(80%\)/.test(t), falta:/Falta pagar: ₲ 100\.000\.000/.test(t), w:bar&&bar.style.width, sem:/Semana por semana/.test(t), dia:/Día por día/.test(t), mes:/Mes a mes/.test(t), g:a.querySelectorAll('svg [data-tbg], svg g[data-tbg]').length}; });
 console.log('   '+JSON.stringify(r));
 ok(r.pag&&r.falta&&r.w==='80%','el mes: 500 M en total, 400 M pagados (80 % en verde) y 100 M que faltan (rojo)');
 ok(r.sem&&r.dia&&r.mes,'gráficos semana por semana, día por día y mes a mes, con pagado y falta');
 await p.evaluate(()=>document.querySelector('#tesoreria .tb-mes').scrollIntoView()); await p.screenshot({path:'/tmp/claude-0/t619.png'});
 ok(!errs.length,'sin errores '+errs.join(' | ').slice(0,300));
 await b.close(); console.log(fail?'fallas '+fail:'✔ t619 ok'); process.exit(fail?1:0); })();
