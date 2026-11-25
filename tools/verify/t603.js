// v1340 · Sistema Nissi: «👑 Panel del dueño en vivo» y todo «⚡ Ver en vivo» bajan solos hasta el panel (antes quedaba el menú arriba y parecía que no pasaba nada) · las etiquetas de colores filtran · las 6 hojas «⏳ Falta su formulario» abren su pantalla
const setup=require('./rvlib.js'); const fs=require('fs');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 const buf=fs.readFileSync('/tmp/claude-0/chq/cg.xlsx');
 await p.evaluate(async (arr)=>{ window.__nis.open(); await window.__nis.impX(new Uint8Array(arr).buffer, 'CHEQUES_Y_GASTOS.xlsx'); },[...buf]); await p.waitForTimeout(2500);
 const home=()=>p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(x=>x.remove()); const t=document.getElementById('tesoreria'); if(t) t.hidden=true; window.__nis.ui.v=''; window.__nis.open(); });
 await home(); await p.waitForTimeout(400);
 await p.click('#nissi [data-nis="live"][data-v="pan"]'); await p.waitForTimeout(1300);
 const pan=await p.evaluate(()=>{ const m=document.querySelector('#tesoreria .mod-ban'); return {top:m?Math.round(m.getBoundingClientRect().top):999, txt:document.querySelector('#tesoreria').innerText}; });
 ok(pan.top<230 && /PLATA REAL HOY/.test(pan.txt),'👑 Panel del dueño en vivo: se ve el panel (PLATA REAL HOY) sin tener que bajar (arriba a '+pan.top+' px)');
 for(const v of ['DASHBOARD','COMPROMISOS POR SEMANA','COBERTURA DE CHEQUES']){ await p.evaluate(v=>{ const t=document.getElementById('tesoreria'); if(t) t.hidden=true; window.__nis.open(v); },v); await p.waitForTimeout(400); await p.evaluate(()=>[...document.querySelectorAll('#nissi [data-nis="live"]')].filter(x=>!/Panel del due/.test(x.innerText)).pop().click()); await p.waitForTimeout(1300);
   const t=await p.evaluate(()=>Math.round(document.querySelector('#tesoreria .mod-ban').getBoundingClientRect().top)); ok(t<230,'⚡ Ver en vivo de «'+v+'» baja solo hasta su panel ('+t+' px)'); }
 await home(); await p.waitForTimeout(400);
 await p.click('#nissi [data-nisk="i"]'); await p.waitForTimeout(300);
 const f1=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#nissi [data-nis="sheet"][data-mk]')].filter(e=>e.offsetParent); return [c.length,[...new Set(c.map(e=>e.dataset.mk))].join(',')]; });
 ok(f1[0]>0&&f1[1]==='i','tocar «👁️ Solo informativo» muestra solo esas hojas ('+f1[0]+')');
 await p.click('#nissi [data-nisk="i"]'); await p.waitForTimeout(300);
 const f2=await p.evaluate(()=>[...document.querySelectorAll('#nissi [data-nis="sheet"][data-mk]')].filter(e=>e.offsetParent).length); ok(f2>f1[0],'tocando de nuevo se ven todas ('+f2+')');
 const pend=await p.evaluate(()=>[...document.querySelectorAll('#nissi [data-nis="sheet"][data-mk="p"]')].map(e=>e.dataset.v)); ok(!pend.length,'ya no queda ninguna hoja «⏳ Falta su formulario» ('+pend.join(', ')+')');
 const W={'GPS DESCUENTO CHEQUES':'dsc','GPS CONTRATOS':'fij','GPS TESORERIA':'sim','PROGRAMACIÓN':'chqra','GPS CONFIG':'prev'};
 for(const v of Object.keys(W)){ await p.evaluate(v=>{ const t=document.getElementById('tesoreria'); if(t) t.hidden=true; window.__nis.open(v); },v); await p.waitForTimeout(400);
   await p.evaluate(()=>[...document.querySelectorAll('#nissi [data-nis="live"]')].filter(x=>!/Panel del due/.test(x.innerText)).pop().click()); await p.waitForTimeout(900);
   const r=await p.evaluate(()=>{ const t=document.getElementById('tesoreria'); return t&&!t.hidden? window.__tes.ui.tab : 'no abrió'; }); ok(r===W[v],'«'+v+'» abre su pantalla ('+r+')'); }
 await p.evaluate(()=>{ const t=document.getElementById('tesoreria'); if(t) t.hidden=true; window.__nis.open('DATOS DE LA EMPRESA'); }); await p.waitForTimeout(400);
 await p.evaluate(()=>[...document.querySelectorAll('#nissi [data-nis="live"]')].filter(x=>!/Panel del due/.test(x.innerText)).pop().click()); await p.waitForTimeout(800);
 ok(await p.evaluate(()=>[...document.querySelectorAll('.ico-ov')].some(o=>/Mis empresas/.test(o.innerText))),'«DATOS DE LA EMPRESA» abre 🏢 Mis empresas');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); console.log(fail?'✘ t603 con fallas':'✔ t603 OK'); process.exit(fail?1:0); })();
