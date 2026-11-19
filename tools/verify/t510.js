// v1277 · PREVENCIÓN: en el celular, con otro equipo usando el módulo («solo ver»), TODAS las pestañas de Gestión de cheques se pueden abrir para mirar, sin errores y sin salirse de la pantalla
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844},ctx:{hasTouch:true,isMobile:true}});
 await p.evaluate(()=>{ const T=window.__tes.st(); const f=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); const h=new Date(); for(let i=-3;i<20;i++){ const d=new Date(h); d.setDate(h.getDate()+i); T.chq.push({id:'c'+i,prov:'PROV '+(i%5),cta:i%2?'Basa-G':'Cont-vista-G',num:String(200+i),monto:1000000+i*1000,co:f(d),st:'pend',tipo:'Diferido'}); } window.__tes.save(); window.__tes.open(); }); await p.waitForTimeout(900);
 const first=await p.evaluate(()=>window.__tes.ui.tab); ok(first==='apag','en el celular abre directo en 💳 CHEQUES A PAGAR ('+first+')');
 await p.evaluate(()=>{ const A=window.__acc; A.st.locks.tes={who:'Otro equipo',dev:'otro-dev',dn:'💻 computadora',t:Date.now(),t0:Date.now()}; setInterval(()=>{ A.st.locks.tes.t=Date.now(); },5000); });
 const tabs=await p.evaluate(()=>[...document.querySelectorAll('#tesoreria [data-tes="tab"][data-v]')].map(x=>x.dataset.v).filter((x,i,a)=>a.indexOf(x)===i));
 const bad=[], wide=[];
 for (const v of tabs){ if(v==='imp') continue;
  await p.evaluate(v=>{ const x=document.querySelector('#tesoreria [data-tes="tab"][data-v="'+v+'"]'); x&&x.scrollIntoView({block:'center'}); },v); await p.waitForTimeout(150);
  const bb=await p.evaluate(v=>{ const x=document.querySelector('#tesoreria [data-tes="tab"][data-v="'+v+'"]'); if(!x) return null; const r=x.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; },v); if(!bb){ bad.push(v+':sin botón'); continue; }
  await p.touchscreen.tap(bb[0],bb[1]); await p.waitForTimeout(450);
  const r=await p.evaluate(()=>({tab:window.__tes.ui.tab, sw:document.getElementById('tesoreria').scrollWidth, cw:document.getElementById('tesoreria').clientWidth}));
  if(r.tab!==v) bad.push(v+'→'+r.tab); if(r.sw>r.cw+8) wide.push(v+':'+r.sw); }
 ok(!bad.length,'con «solo ver», las '+tabs.length+' pestañas se abren para mirar '+bad.join(' '));
 ok(!wide.length,'ninguna pestaña se sale a lo ancho de la pantalla del celular '+wide.join(' '));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
