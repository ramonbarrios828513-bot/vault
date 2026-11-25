// v1339 · promos por forma de pago SOLO para ciertos productos (palabra, grupo, laboratorio/marca, lista) + pago por separado sin límite de formas + «puede pasar el tope»
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); window.__vt.open(); const V=window.__vt.st(); V.open=true; V.stock={GS:{50000:9,20000:9,10000:9,5000:9,2000:9,1000:9,500:9},BRL:{},USD:{}};
  V.pr.bancos=['Itaú','Basa','Continental']; const D=[0,1,2,3,4,5,6];
  V.pr.promos=[{on:true,fp:'tc',bk:'Itaú',pct:30,dias:D,todos:true,ap:'pal',apv:'PERFUME, COLONIA'},{on:true,fp:'tc',bk:'Basa',pct:28,dias:D,todos:true,ap:'pal',apv:'perfume',tope:true},{on:true,fp:'ef',bk:'',pct:25,dias:D,todos:true,ap:'grp',apv:'Medicamentos'},{on:true,fp:'qr',bk:'Continental',pct:35,dias:D,todos:true,ap:'lab',apv:'MARCA 73'},{on:true,fp:'qr',bk:'Continental',pct:33,dias:D,todos:true,ap:'lis',apv:'9001'}];
  V.arts.pf1={id:'pf1',n:'PERFUME ROSA 100ML',grp:'General',pvp:100000,costo:35000,cod:'8001'}; V.arts.pf2={id:'pf2',n:'Perfume barato 50ml',grp:'General',pvp:100000,costo:90000,cod:'8002'}; V.arts.md1={id:'md1',n:'KITADOL FORTE',grp:'Medicamentos',pvp:100000,costo:35000,cod:'8003'}; V.arts.vt1={id:'vt1',n:'VITAMINA C 1G',grp:'General',lab:'MARCA 73',pvp:100000,costo:35000,cod:'8004'}; V.arts.ot1={id:'ot1',n:'ALGODON 100G',grp:'General',pvp:100000,costo:35000,cod:'9001'}; V.arts.ot2={id:'ot2',n:'CURITAS X10',grp:'General',pvp:100000,costo:35000,cod:'9002'};
  const t=V.tabs[0]; V.cur=t.id; t.cat='cd'; t.fp='ef'; t.bk=''; t.lines=['pf1','pf2','md1','vt1','ot1','ot2'].map(k=>({aid:k,n:V.arts[k].n,q:1,pvp:100000,uq:1,cost:V.arts[k].costo})); window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="sepp"]'); await p.waitForTimeout(300);
 for(let i=0;i<3;i++){ await p.click('.vt-ov [data-vp="sepadd"]'); await p.waitForTimeout(250); }
 const n=await p.evaluate(()=>document.querySelectorAll('.vt-ov [data-pf]').length);
 ok(n===5,'se pueden agregar más de 3 formas de pago: '+n);
 const want=[['ef',''],['tc','Itaú'],['tc','Basa'],['qr','Continental'],['td','']];
 for(let k=0;k<12;k++){ const rows=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-pf]')].map(s=>{ const b=s.closest('.vt-pl').querySelector('[data-pb]'); return [s.value,(b&&b.value)||'']; })); const key=r=>r[0]+'|'+r[1]; const W=want.map(key), used={}; const spare=[]; rows.forEach((r,i)=>{ const kk=key(r); if(W.includes(kk)&&!used[kk]) used[kk]=1; else spare.push(i); }); const miss=want.filter(w=>!used[key(w)]); if(!miss.length) break; const i=spare[0], w=miss[0]; if(i==null) break;
   await p.evaluate(([i,fp])=>{ const s=document.querySelectorAll('.vt-ov [data-pf]')[i]; if(s.value!==fp){ s.value=fp; s.dispatchEvent(new Event('change',{bubbles:true})); } },[i,w[0]]); await p.waitForTimeout(300);
   if(w[1]) { await p.evaluate(([fp,bk])=>{ const S=[...document.querySelectorAll('.vt-ov [data-pf]')].filter(s=>s.value===fp).map(s=>s.closest('.vt-pl').querySelector('[data-pb]')).filter(b=>b&&!b.value); if(S[0]){ S[0].value=bk; S[0].dispatchEvent(new Event('change',{bubbles:true})); } },w); await p.waitForTimeout(300); } }
 const tb=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-septb] tr')].map(t=>t.innerText.replace(/\s+/g,' ')));
 console.log(tb.join('\n'));
 const row=re=>tb.find(x=>re.test(x))||'';
 ok(/Itaú ₲ 70\.000$/.test(row(/PERFUME ROSA/)),'perfume con margen → tarjeta Itaú 30 %: '+row(/PERFUME ROSA/).slice(-40));
 ok(/Basa ₲ 72\.000$/.test(row(/Perfume barato/)),'perfume sin margen → Basa 28 % porque esa promo puede pasar el tope (Itaú se corta en el tope): '+row(/Perfume barato/).slice(-40));
 ok(/Efectivo ₲ 75\.000$/.test(row(/KITADOL/)),'medicamento (grupo Medicamentos) → efectivo 25 %: '+row(/KITADOL/).slice(-40));
 ok(/Continental ₲ 65\.000$/.test(row(/VITAMINA/)),'vitamina (MARCA 73) → QR Continental 35 %: '+row(/VITAMINA/).slice(-40));
 ok(/Continental ₲ 67\.000$/.test(row(/ALGODON/)),'producto de la lista (código 9001) → QR Continental 33 %: '+row(/ALGODON/).slice(-40));
 ok(!/₲ (65|67|70|72|75)\.000$/.test(row(/CURITAS/)),'producto sin promo no toma ninguna promo: '+row(/CURITAS/).slice(-40));
 // el editor de promos muestra «🏷️ Productos» y el tilde «puede pasar el tope»
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); }); await p.click('#ventas [data-vt="tabla"]'); await p.waitForTimeout(500);
 const ed=await p.evaluate(()=>{ const a=document.querySelector('[data-pq="0:ap"]'), v=document.querySelector('[data-pq="0:apv"]'), tp=document.querySelector('[data-pqt="1"]'); return {ap:a&&a.value, apv:v&&v.value, tope:tp&&tp.checked, opts:a?[...a.options].map(o=>o.textContent).join('/'):''}; });
 ok(ed.ap==='pal'&&/PERFUME/.test(ed.apv)&&ed.tope===true&&/Laboratorio/.test(ed.opts),'el editor de promos muestra a qué productos se aplica y el tilde del tope: '+JSON.stringify(ed));
 await p.evaluate(()=>{ const a=document.querySelector('[data-pq="2:ap"]'); a.value='lis'; a.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(300);
 const pr2=await p.evaluate(()=>{ return document.querySelector('[data-pq="2:ap"]').value+'|'+!document.querySelector('[data-pq="2:apv"]').hidden; });
 ok(pr2==='lis|true','al cambiar a «Lista de códigos» queda elegido y aparece el casillero ('+pr2+')');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); console.log(fail?'✘ t601 con fallas':'✔ t601 OK'); process.exit(fail?1:0); })();
