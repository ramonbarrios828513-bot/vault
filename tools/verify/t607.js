// v1341 · Tesorería: el encabezado muestra «📍 Estás en: <botón>» y queda fijo arriba al bajar; el panel no queda tapado
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ for(const vp of [{width:1366,height:768},{width:390,height:800}]){ const {b,p}=await setup({vp});
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(700);
 for(const [v,lbl] of [['apag','CHEQUES A PAGAR'],['carga','CARGAR CHEQUES NUEVOS'],['bus','BUSCAR CHEQUES']]){
  await p.evaluate(v=>document.querySelector('#tesoreria .tes-tabs [data-v="'+v+'"]').click(),v); await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{ const a=document.getElementById('tesoreria'), h=a.querySelector('.tes-hdtab'), top=a.querySelector('.tes-w>.bo-top'), m=a.querySelector('.mod-ban'); return {t:h?h.textContent:'', hb:Math.round(top.getBoundingClientRect().bottom), mt:m?Math.round(m.getBoundingClientRect().top):9999}; });
  ok(r.t.includes(lbl)&&/Estás en/.test(r.t),vp.width+'px · encabezado dice «'+r.t+'»');
  ok(r.mt>=r.hb-2,vp.width+'px · el cartel del módulo no queda tapado por el encabezado ('+r.mt+' ≥ '+r.hb+')');
  await p.evaluate(()=>{ const a=document.getElementById('tesoreria'); a.scrollTop=a.scrollHeight; }); await p.waitForTimeout(300);
  const s=await p.evaluate(()=>{ const h=document.querySelector('#tesoreria .tes-hdtab').getBoundingClientRect(); return [Math.round(h.top),Math.round(h.bottom)]; });
  ok(s[0]>=0&&s[1]<200,vp.width+'px · al bajar hasta el fondo el nombre sigue visible arriba ('+s.join('–')+' px)'); }
 await b.close(); }
 console.log(fail?'✘ t607 con fallas':'✔ t607 ok'); process.exit(fail?1:0); })();
