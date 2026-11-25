// v1340 · un solo lugar: las hojas del Sistema Nissi que ya son módulo llevan al módulo (➕ y ✏️ no cargan en la copia) · 🧭 Criterio por hoja (ya es módulo / en vivo / documento / informe / solo Excel) exportable
const setup=require('./rvlib.js'); const fs=require('fs');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:768}});
 const buf=fs.readFileSync('/tmp/claude-0/chq/cg.xlsx');
 await p.evaluate(async (arr)=>{ window.__nis.open(); await window.__nis.impX(new Uint8Array(arr).buffer, 'C.xlsx'); },[...buf]); await p.waitForTimeout(2500);
 const W={'GESTION DE CHEQUES  Y GASTOS':'tes:chq','SALDOS DIARIOS':'tes:sal','AGENDA DE PAGOS':'tes:ag','EXTRACTO PROVEEDORES':'tes:prov','CIERRE DE CAJAS':'cierre','EGRESOS DE CAJA':'cierre','SOLICITUDES ESPECIALES':'ventas','CLIENTES CLAVE':'ventas'};
 const where=()=>p.evaluate(()=>{ const v=id=>{const e=document.getElementById(id); return e&&!e.hidden;}; if(v('tesoreria')) return 'tes:'+window.__tes.ui.tab; if(v('cierre')) return 'cierre'; if(v('ventas')) return 'ventas'; return 'nissi'; });
 const reset=()=>p.evaluate(()=>{ document.querySelectorAll('.ico-ov,.vt-ov').forEach(x=>{ if(!/📴/.test(x.innerText.slice(0,6))) x.remove(); }); ['tesoreria','cierre','ventas'].forEach(id=>{const e=document.getElementById(id); if(e) e.hidden=true;}); });
 for(const v of Object.keys(W)){ await reset(); await p.evaluate(v=>window.__nis.open(v),v); await p.waitForTimeout(400);
  const ban=await p.evaluate(()=>{ const b=document.querySelector('#nissi .nis-modban'); return b?b.innerText.split('\n')[0]:''; });
  await p.evaluate(()=>document.querySelector('#nissi [data-nis="gomod"]').click()); await p.waitForTimeout(800); const w1=await where();
  await reset(); await p.evaluate(v=>window.__nis.open(v),v); await p.waitForTimeout(400);
  const how=await p.evaluate(()=>{ const n=document.querySelector('#nissi [data-nis="new"]'); if(n){ n.click(); return 'new'; } const r=document.querySelector('#nissi [data-nisrow]'); if(r){ r.click(); return 'row'; } return '-'; }); await p.waitForTimeout(800); const w2=await where();
  const form=await p.evaluate(()=>!!document.querySelector('.nis-fm:not(.nis-br)'));
  ok(/Esto se carga en/.test(ban)&&w1===W[v]&&(how==='-'||w2===W[v])&&!form,'«'+v+'»: aviso «'+ban.slice(0,50)+'» · Ir→'+w1+' · '+how+'→'+w2+(form?' (abrió la copia)':'')); }
 await reset(); await p.evaluate(()=>{ window.__nis.ui.v=''; window.__nis.open(); }); await p.waitForTimeout(400);
 const card=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#nissi [data-nis="sheet"]')].find(x=>x.dataset.v==='CIERRE DE CAJAS'); return c&&c.querySelector('.nis-crit')?c.querySelector('.nis-crit').innerText:''; }); ok(/Ya es módulo.*Cierre de caja/.test(card),'la tarjeta dice el criterio ('+card+')');
 await p.click('#nissi [data-nis="crit"]'); await p.waitForTimeout(500);
 const rows=await p.evaluate(()=>[...document.querySelectorAll('.ico-ov tr')].map(t=>t.innerText.replace(/\s+/g,' ')));
 const rw=re=>rows.find(x=>re.test(x))||'';
 ok(rows.length>50&&/Ya es módulo/.test(rw(/^CIERRE DE CAJAS/))&&/Calculado en vivo/.test(rw(/^PANEL DEL DUEÑO/))&&/Documento/.test(rw(/^METODOLOG/))&&/Informe del Excel/.test(rw(/^RENTABILIDAD/))&&/Solo en el Excel/.test(rw(/^PRODUCTOS FOCO/)),'🧭 Criterio por hoja: '+(rows.length-1)+' hojas clasificadas');
 const [dl]=await Promise.all([p.waitForEvent('download',{timeout:6000}).catch(()=>null), p.click('.ico-ov [data-cx="xls"]')]); ok(dl&&/Criterio_hojas/.test(dl.suggestedFilename()),'📤 el criterio se exporta a Excel');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); console.log(fail?'✘ t604 con fallas':'✔ t604 OK'); process.exit(fail?1:0); })();
