// v1300 · 📥 importar fichas desde Excel (plantilla): crea con caja/tableta/fracción, actualiza por código Nissi, rechaza filas con error (barra repetida, PVP < costo, falta tableta) y deja vista previa
const setup=require('./rvlib.js'); const path=require('path'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__fichas.open(); }); await p.waitForTimeout(300);
 const rows=[["Código Nissi (padre) *","Descripción padre + presentación principal *","Principio activo (componente) *","Laboratorio","Proveedor","Unidad de medida (FR / UN) *","Cantidad por caja *","Barra caja","Costo caja ₲","PVP caja ₲","Descuento caja (100/75/50/25/0)","FR por tableta","Barra tableta","Costo tableta ₲","PVP tableta ₲","Descuento tableta (100/75/50/25/0)","Barra fracción","Costo fracción ₲","PVP fracción ₲","Descuento fracción (100/75/50/25/0)","Se negocia desde (PUBLICO / COSTO)","Descuento del proveedor %","IVA (10 / 5 / Exenta)","Receta (Libre / Receta / Controlado)","Grupo / categoría","Stock inicial (en FR o UN)"],
  [901,'Kitadol Forte 400 cj x20FR','Ibuprofeno 400 mg','Lasca','Lasca','FR',20,'7790000901010',7000,20000,100,10,'7790000901027','','',50,'7790000901034','',1500,0,'PUBLICO','','10','Libre','Analgésicos',200],
  [902,'Crema 200 ml fco','Urea 10 %','Lab X','Dist X','UN',1,'7790000902010',30000,45000,100,'','','','','','','','','','COSTO','','10','Libre','Cosméticos',12],
  [903,'Error PVP menor','X','','','UN',1,'7790000903010',50000,40000,100,'','','','','','','','','','PUBLICO','','10','Libre','',1],
  [904,'Error barra repetida','X','','','UN',1,'7790000901010',1000,2000,100,'','','','','','','','','','PUBLICO','','10','Libre','',1],
  [905,'Error sin tableta','X','','','FR',10,'7790000905010',1000,2000,100,'','','','','','7790000905030','','','','PUBLICO','','10','Libre','',1]];
 await p.evaluate((rows)=>window.__fichas.imp(rows),rows); await p.waitForTimeout(300);
 const pv=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().innerText.replace(/\s+/g,' '));
 ok(/2 nuevas/.test(pv)&&/3 con error/.test(pv),'vista previa: 2 nuevas, 3 con error: '+pv.slice(0,140));
 ok(/PVP caja menor que el costo/.test(pv)&&/repetida/.test(pv)&&/falta «FR por tableta»/.test(pv),'explica cada error');
 await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().querySelector('[data-impgo]').click()); await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{ const V=window.__vt.st(); const f=c=>Object.values(V.arts).find(x=>String(x.cod)===c); const k=f('901'), c=f('902'); return { k:k&&{n:k.n,u:k.u,frac:k.frac,pvp:k.pvp,costo:k.costo,pres:(V.pres[k.id]||[]).map(q=>(q.t||'caja')+':'+(q.pvp||'')+':'+(q.dq)+':'+(q.dsc||'')), stk:V.stk[k.id]}, c:c&&{neg:c.neg,pvp:c.pvp,costo:c.costo}, n3:!!f('903'), toast:document.getElementById('toast').textContent }; });
 ok(r.k&&r.k.frac&&r.k.u===20&&r.k.pvp===20000&&r.k.costo===7000,'Kitadol 901 creado: FR, caja x20, PVP 20.000, costo 7.000');
 ok(r.k&&r.k.pres.some(x=>/^tab:10000:50:.*Ibuprofeno.*Tableta x10FR/.test(x))&&r.k.pres.some(x=>/^fr:1500:0:/.test(x)),'tableta ₲ 10.000 (½ descuento) y fracción ₲ 1.500 (sin descuento), con componente en la descripción: '+r.k.pres.join(' | '));
 ok(r.k&&r.k.stk===200,'stock inicial 200 FR');
 ok(r.c&&r.c.neg==='costo'&&r.c.costo===30000&&r.c.pvp===45000,'crema 902 desde el costo: '+JSON.stringify(r.c));
 ok(!r.n3&&/Importadas 2/.test(r.toast),'las filas con error no se importan: '+r.toast);
 // actualizar por código
 const rows2=[rows[0],[901,'Kitadol Forte 400 cj x20FR','Ibuprofeno 400 mg','Lasca','Lasca','FR',20,'7790000901010',7500,21000,100,10,'7790000901027','','',50,'7790000901034','',1500,0,'PUBLICO','','10','Libre','Analgésicos','']];
 await p.evaluate((rows)=>window.__fichas.imp(rows),rows2); await p.waitForTimeout(300);
 ok(/1 se actualizan/.test(await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().innerText)),'el mismo código se ACTUALIZA');
 await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().querySelector('[data-impgo]').click()); await p.waitForTimeout(600);
 const u=await p.evaluate(()=>{ const V=window.__vt.st(); const k=Object.values(V.arts).find(x=>String(x.cod)==='901'); return {pvp:k.pvp, n:Object.values(V.arts).filter(x=>String(x.cod)==='901').length, h:(V.artH[k.id]||[]).length}; });
 ok(u.pvp===21000&&u.n===1&&u.h>=2,'PVP actualizado a 21.000, sin duplicar, con historial '+JSON.stringify(u));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
