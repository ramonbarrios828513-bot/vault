// v1337 · Compras lee las FICHAS DE ARTÍCULOS (una sola lista, código Nissi = padre): productos cargados, negociación rápida, orden por proveedor y stock salen de las fichas importadas, sin copiarlas ni subirlas a la central
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); }); await p.waitForTimeout(300);
 await p.evaluate(async()=>{ const wb=await (await fetch('/mig.json')).json(); window.__fichas.mig(wb); }); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const g=document.querySelector('[data-impgo]'); g&&g.click(); }); await p.waitForTimeout(20000);
 const nF=await p.evaluate(()=>Object.keys(window.__vt.st().arts).length);
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov').forEach(o=>o.remove()); const v=document.getElementById('ventas'); if(v) v.hidden=true; window.__ar.open(); }); await p.waitForTimeout(2500);
 const tab=await p.evaluate(()=>{ const t=[...document.querySelectorAll('#articulos button')].find(x=>/Productos cargados/.test(x.textContent)); return t?t.textContent.trim():''; });
 const m=/\((\d+)\)/.exec(tab); ok(m&&+m[1]>=18000&&+m[1]<=nF,'«Productos cargados» muestra las fichas importadas: '+tab+' (fichas: '+nF+')');
 const A=await p.evaluate(()=>{ const AR=window.__ar.st(); const k=Object.values(AR.items).find(a=>a.cod==='1'); let enBalde=0; for(let n=0;n<32;n++){ /* nada de espejo en lo que se guarda/sube */ }
   const vx=Object.values(AR.items).filter(a=>a.vx).length; return {k:k&&{n:k.n,prov:k.prov,u:k.u,vx:k.vx,id:k.id}, vx, stk:k?window.__ar.calc(k,90).sU:null}; });
 ok(A.k&&A.k.vx&&A.k.prov,'el Código Nissi 1 aparece en Compras con su proveedor ('+JSON.stringify(A.k)+')');
 const sF=await p.evaluate(id=>window.__vt.stk(id),A.k.id); ok(A.stk!=null&&A.stk===sF,'el stock que ve Compras es el mismo de la ficha ('+A.stk+' = '+sF+')');
 // negociación rápida
 await p.evaluate(()=>{ const b=document.querySelector('#articulos [data-rn], #articulos .cp-b.o, #articulos [data-rnopen]'); });
 const rn=await p.evaluate(async()=>{ const b=[...document.querySelectorAll('#articulos .cp-b')].find(x=>/NEGOCIACI/.test(x.textContent)); b.click(); await new Promise(r=>setTimeout(r,600)); const q=document.getElementById('rnQ'); q.value='kita'; q.dispatchEvent(new Event('input')); await new Promise(r=>setTimeout(r,500)); const L=[...document.querySelectorAll('#rnL [data-rnp]')].map(x=>x.textContent); document.getElementById('rnOv').remove(); return L; });
 ok(rn.length>0&&rn.some(t=>/KITADOL/i.test(t)),'⚡ Negociación rápida encuentra «kita»: '+rn.length+' resultado(s), ej. '+(rn[0]||'').slice(0,80));
 // orden por proveedor
 const pl=await p.evaluate(async()=>{ const b=[...document.querySelectorAll('#articulos .cp-b')].find(x=>/PREPARAR ORDEN/.test(x.textContent)); b.click(); await new Promise(r=>setTimeout(r,900)); const all=[...document.querySelectorAll('#plL [data-plp]')].length; const q=document.getElementById('plQ'); q.value='policlinica'; q.dispatchEvent(new Event('input')); await new Promise(r=>setTimeout(r,300)); return {all, L:[...document.querySelectorAll('#plL [data-plp]')].map(x=>x.textContent.trim())}; });
 ok(pl.all>=200,'🛒 Preparar orden de compra lista los proveedores de las fichas: '+pl.all);
 ok(pl.L.some(t=>/POLICLINICA SA SR\.RAMON.*\(591 productos\)/.test(t)),'la Policlínica aparece con sus 591 productos ('+pl.L.join(' | ').slice(0,200)+')');
 const t0=Date.now(); const ord=await p.evaluate(async()=>{ const b=[...document.querySelectorAll('#plL [data-plp]')].find(x=>/SR\.RAMON/.test(x.textContent)); b.click(); await new Promise(r=>setTimeout(r,4000)); const N=(window.__ar.st().ui||{}); const AR=window.__ar.st(); const negs=Object.values(AR.negs||{}); const last=negs.sort((a,b)=>(b.t||0)-(a.t||0))[0]; return {n:last?last.lines.length:0, prov:last&&last.prov, txt:(document.getElementById('articulos')||{}).innerText.slice(0,300)}; });
 ok(ord.n===591&&/POLICLINICA/.test(ord.prov||''),'al tocarla se arma la orden con sus '+ord.n+' productos ('+(ord.prov||'')+') en '+Math.round((Date.now()-t0)/1000)+' s');
 // nada del espejo se guarda en la lista de compras ni sube a la central
 const sv=await p.evaluate(async()=>{ const AR=window.__ar.st(); await window.__ar.save([Object.values(AR.items).find(a=>a.vx)]); return Object.keys(AR.dirty||{}).length; });
 ok(sv===0,'guardar un artículo de la ficha desde Compras no lo copia a la lista de compras ni lo sube (baldes marcados: '+sv+')');
 // ✏️ Ficha abre la ficha de artículos de verdad
 const fe=await p.evaluate(async()=>{ const U=window.__ar.st().ui; U.tab='lista'; U.q='kitadol forte'; document.querySelectorAll('.ico-ov').forEach(o=>o.remove()); window.__ar.open(); await new Promise(r=>setTimeout(r,900)); const b=document.querySelector('#articulos [data-ar="ed"]'); if(!b) return 'sin botón'; b.click(); await new Promise(r=>setTimeout(r,700)); const o=[...document.querySelectorAll('.ico-ov.vt-ov')].pop(); return o?o.innerText.slice(0,120):'no abrió'; });
 ok(/KITADOL/i.test(fe),'«✏️ Ficha» en Compras abre la ficha de artículos real ('+fe.replace(/\s+/g,' ').slice(0,80)+')');
 ok(!errs.length,'sin errores de consola '+errs.slice(0,2).join(' | '));
 await b.close(); console.log(fail?'✘ t599 con fallas':'✔ t599 OK'); process.exit(fail?1:0); })();
