// v1235 · 🚦 cheques a pagar: esta semana cada día con su color (hoy rojo → amarillo → celeste → azul → gris); semanas siguientes con un color cada una
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(); const f=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); const h=new Date(); for(let i=0;i<30;i++){ const d=new Date(h); d.setDate(h.getDate()+i); if(d.getDay()===0||d.getDay()===6) continue; T.chq.push({id:'c'+i,prov:'PROV '+i,cta:'Basa-G',num:String(i),monto:1000000+i,co:f(d),st:'pend',tipo:'Diferido'}); } window.__tes.save(); window.__tes.ui.tab='apag'; window.__tes.open(); }); await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>[...document.querySelectorAll('.ap-day:not(.ap-we)')].map(d=>(d.className.match(/ap[cw]-\w+/)||[''])[0]));
 console.log('   '+r.join(' '));
 ok(r[0]==='apc-r','el primer día (hoy o próximo cobro) es ROJO');
 const cur=r.filter(x=>x.indexOf('apc-')===0); ok(['apc-r','apc-y','apc-c','apc-b','apc-g'].slice(0,cur.length).join()===cur.join(),'dentro de esta semana sigue el orden rojo → amarillo → celeste → azul → gris');
 const wk=r.filter(x=>x.indexOf('apw-')===0); ok(wk[0]==='apw-0' && wk.includes('apw-1'),'las semanas que vienen tienen cada una su color');
 ok(await p.evaluate(()=>!!document.querySelector('.ap-leg') && !!document.querySelector('.ap-wh.apw-now, .ap-wh.apw-0')),'muestra la guía de colores y el encabezado de cada semana con su color');
 await p.evaluate(()=>document.querySelector('.ap-leg').scrollIntoView()); await p.screenshot({path:'/tmp/claude-0/s130/ap.png'});
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
