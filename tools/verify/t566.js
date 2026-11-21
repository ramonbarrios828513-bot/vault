// v1312 · (1) la Sala de estudio abierta desde la 🏙️ Ciudad no queda tapada por los paneles del inicio · (2) «Cheques a pagar» avisa cuando hay un filtro puesto y lo quita con un botón
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:800}});
 await p.evaluate(()=>window.__city.open()); await p.waitForTimeout(800);
 await p.evaluate(()=>window.__city.run('m:write')); await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>{ const vis=e=>e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0; const sw=document.getElementById('sheetWrite'); const at=(x,y)=>{ const e=document.elementFromPoint(x,y); return !!(e&&sw.contains(e)); }; return {open:sw.classList.contains('open'),L:vis(document.getElementById('homeSideL')),R:vis(document.getElementById('homeSideR')),izq:at(60,300),der:at(innerWidth-60,300)}; });
 ok(r.open,'la Sala de estudio se abre desde la Ciudad');
 ok(!r.L&&!r.R,'los paneles del inicio no quedan encima: '+JSON.stringify(r));
 ok(r.izq&&r.der,'lo que se toca a la izquierda y a la derecha es de la sala');
 // salir de la sala: los paneles vuelven
 await p.evaluate(()=>{ const x=[...document.querySelectorAll('#sheetWrite button')].filter(b=>/Salir de la sala/.test(b.textContent))[0]; x&&x.click(); }); await p.waitForTimeout(1500);
 const back=await p.evaluate(()=>({room:document.body.classList.contains('room-open')})); ok(!back.room,'al salir de la sala se quita el modo sala');
 // (2) filtro en A pagar
 await p.evaluate(()=>{ const T=window.__tes.st(); const d=new Date(); d.setDate(d.getDate()+3); const f=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); const cta=(T.chq.find(c=>c.cta)||{}).cta||'Banco T566'; T.chq.push({id:'t566a',prov:'Prov T566 A',num:'5660001',monto:1000000,co:f,cta:cta,st:'pend'}); T.chq.push({id:'t566b',prov:'Prov T566 B',num:'5660002',monto:2000000,co:f,cta:cta,st:'pend'}); const u=window.__tes.ui; window.__tes.open(); u.tab='apag'; u.aq='5660001'; u.acta=''; window.__tes.draw(); }); await p.waitForTimeout(700);
 const f1=await p.evaluate(()=>{ const t=document.getElementById('tesoreria').innerText; return {av:!!document.getElementById('apFil'),a:/Prov T566 A/.test(t),b:/Prov T566 B/.test(t)}; });
 ok(f1.av&&f1.a&&!f1.b,'con filtro puesto aparece el aviso amarillo: '+JSON.stringify(f1));
 await p.click('#apClr'); await p.waitForTimeout(600);
 const f2=await p.evaluate(()=>{ const t=document.getElementById('tesoreria').innerText; return {av:!!document.getElementById('apFil'),a:/Prov T566 A/.test(t),b:/Prov T566 B/.test(t),q:document.getElementById('apQ').value}; });
 ok(!f2.av&&f2.a&&f2.b&&f2.q==='','«Ver TODOS» quita el filtro y muestra todos: '+JSON.stringify(f2));
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
