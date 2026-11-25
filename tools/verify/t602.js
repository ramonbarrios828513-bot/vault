// v1340 · 🗂️ Rubros de Vital (G2 = Medicamentos): nombre sugerido y editable, se completa desde el archivo de Vital sin tocar nada más, filtro en Fichas, promo por rubro · 📤 Exportar a Excel (rubros y cheques pendientes para Alberto)
const setup=require('./rvlib.js'); const fs=require('fs'); const XLSX=require('/tmp/xlsx.full.min.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['codigo_interno','nombre_comercial','codigo_categoria_migracion'],[7001,'KITADOL PRUEBA','G2-S41'],[7002,'SHAMPOO PRUEBA','G12-S137'],[7999,'NO EXISTE','G5-S1']]), 'MIG 04 productos'); const F='/tmp/claude-0/t602mig.xlsx'; fs.writeFileSync(F, XLSX.write(wb,{type:'buffer',bookType:'xlsx'}));
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); window.__vt.open(); const V=window.__vt.st(); V.open=true; V.stock={GS:{50000:9,20000:9,10000:9,5000:9,2000:9,1000:9,500:9},BRL:{},USD:{}};
  V.arts.r1={id:'r1',n:'KITADOL PRUEBA',grp:'General',pvp:100000,costo:35000,cod:'7001',lab:'LAB X',bar:['7790000000011']}; V.arts.r2={id:'r2',n:'SHAMPOO PRUEBA',grp:'General',pvp:100000,costo:35000,cod:'7002',lab:'LAB Y',bar:['7790000000028']};
  V.pr.promos=[{on:true,fp:'ef',bk:'',pct:25,dias:[0,1,2,3,4,5,6],todos:true,ap:'rub',apv:'Medicamentos'}]; window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="arts"]'); await p.waitForTimeout(600);
 ok(await p.evaluate(()=>!!document.querySelector('#fichasMod [data-frub]') && !!document.querySelector('#fichasMod [data-rubs]')),'Fichas tiene el filtro 🗂️ Rubro y el botón 🗂️ Rubros');
 await p.click('#fichasMod [data-rubs]'); await p.waitForTimeout(400);
 const g2=await p.evaluate(()=>{ const i=document.querySelector('#rubMod [data-rbn="2"]'); return i&&i.value; }); ok(g2==='Medicamentos','G2 aparece sugerido como Medicamentos ('+g2+')');
 const [fc]=await Promise.all([p.waitForEvent('filechooser'), p.click('#rubMod [data-rbf]')]); await fc.setFiles(F); await p.waitForTimeout(1500);
 const rr=await p.evaluate(()=>{ const V=window.__vt.st(); return [V.arts.r1.rub,V.arts.r1.srub,V.arts.r2.rub,V.arts.r2.srub,V.arts.r1.n,V.arts.r1.pvp,V.arts.r2.lab].join('|'); });
 ok(rr==='2|41|12|137|KITADOL PRUEBA|100000|LAB Y','leer el archivo de Vital completa solo el rubro de cada ficha por código, sin tocar lo demás ('+rr+')');
 await p.evaluate(()=>{ const i=document.querySelector('#rubMod [data-rbn="12"]'); i.value='Cabello'; i.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(200);
 await p.evaluate(()=>{ const c=document.querySelector('#rubMod [data-rbok="12"]'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(300);
 const st=await p.evaluate(()=>{ const V=window.__vt.st(); return JSON.stringify(V.rub&&V.rub['12']); }); ok(/Cabello/.test(st)&&/"ok":1/.test(st),'el nombre se corrige y queda ✅ Aprobado ('+st+')');
 const [dl]=await Promise.all([p.waitForEvent('download',{timeout:8000}).catch(()=>null), p.click('#rubMod [data-rbx]')]);
 let rx=null; if(dl){ const P=await dl.path(); const w=XLSX.read(fs.readFileSync(P),{type:'buffer'}); rx=XLSX.utils.sheet_to_json(w.Sheets['Rubros']); }
 const r12=rx&&rx.find(r=>r['Código Vital']==='G12'); ok(!!r12&&r12['Nombre del rubro']==='Cabello'&&r12.Estado==='Aprobado'&&r12.Fichas===1,'📤 Exportar rubros a Excel: '+JSON.stringify(r12));
 await p.click('#rubMod [data-x]'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const s=document.querySelector('#fichasMod [data-frub]'); s.value='2'; s.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(300);
 const lt=await p.evaluate(()=>document.querySelector('#fichaRows').innerText); ok(/KITADOL PRUEBA/.test(lt)&&!/SHAMPOO PRUEBA/.test(lt),'filtrar Fichas por rubro Medicamentos muestra solo ese rubro');
 const opt=await p.evaluate(()=>[...document.querySelector('#fichasMod [data-frub]').options].map(o=>o.textContent).join(' / ')); ok(/Cabello \(G12\)/.test(opt),'el filtro usa los nombres corregidos ('+opt.slice(0,120)+')');
 await p.evaluate(()=>{ const q=document.getElementById('fichaQ'); q.value='cabello'; q.dispatchEvent(new Event('input')); const s=document.querySelector('#fichasMod [data-frub]'); }); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const s=document.querySelector('#fichasMod [data-frub]'); s.value=''; s.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(300);
 const lq=await p.evaluate(()=>document.querySelector('#fichaRows').innerText); ok(/SHAMPOO PRUEBA/.test(lq)&&!/KITADOL PRUEBA/.test(lq),'el buscador también encuentra por nombre de rubro («cabello»)');
 await p.evaluate(()=>{ const q=document.getElementById('fichaQ'); q.value=''; q.dispatchEvent(new Event('input')); }); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const b=document.querySelector('#fichasMod [data-ae="r1"]'); b&&b.click(); }); await p.waitForTimeout(500);
 const fr=await p.evaluate(()=>{ const s=document.querySelector('[data-ar="rub"]'); return s? s.value+'|'+s.options[s.selectedIndex].textContent : null; }); ok(fr&&/^2\|Medicamentos \(G2\)/.test(fr),'la ficha muestra y deja cambiar el 🗂️ Rubro ('+fr+')');
 // promo por rubro en la caja
 await p.evaluate(()=>{ document.querySelectorAll('.ico-ov, .vt-ov').forEach(o=>o.remove()); const V=window.__vt.st(), t=V.tabs[0]; V.cur=t.id; t.cat='cd'; t.fp='ef'; t.bk=''; t.lines=['r1','r2'].map(k=>({aid:k,n:V.arts[k].n,q:1,pvp:100000,uq:1,cost:35000})); window.__vt.open(); });
 await p.waitForTimeout(300); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(300); await p.click('.vt-ov [data-vp="sepp"]'); await p.waitForTimeout(400);
 const tb=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-septb] tr')].map(t=>t.innerText.replace(/\s+/g,' '))); console.log('   '+tb.join('\n   '));
 const row=re=>tb.find(x=>re.test(x))||'';
 ok(/₲ 75\.000$/.test(row(/KITADOL/)),'promo efectivo 25 % «Rubro: Medicamentos» se aplica al medicamento: '+row(/KITADOL/).slice(-30));
 ok(!/₲ 75\.000$/.test(row(/SHAMPOO/)),'y no al shampoo (otro rubro): '+row(/SHAMPOO/).slice(-30));
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); }); await p.click('#ventas [data-vt="tabla"]'); await p.waitForTimeout(500);
 const ed=await p.evaluate(()=>{ const a=document.querySelector('[data-pq="0:ap"]'); return a? a.value+'|'+[...a.options].map(o=>o.textContent).join('/') : ''; }); ok(/^rub\|.*Rubro/.test(ed),'el editor de promos tiene «Rubro» ('+ed.slice(0,80)+')');
 // 📤 cheques pendientes para Alberto
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); const v=document.getElementById('ventas'); if(v) v.hidden=true; const T=window.__tes.st();
   T.chq.push({id:'c1',prov:'PROV UNO',cta:'Basa-G',num:'101',monto:1500000,em:'2026-11-01',co:'2026-12-05',st:'pend'},{id:'c2',prov:'PROV DOS',cta:'Itau-G',num:'55',monto:2500000,em:'2026-11-02',co:'2026-12-01',st:'pend'},{id:'c3',prov:'PROV PAGADO',cta:'Basa-G',num:'100',monto:900000,em:'2026-10-01',co:'2026-10-20',st:'pag',fdeb:'2026-10-20'},{id:'c4',prov:'PROV ANULADO',cta:'Basa-G',num:'99',monto:700000,co:'2026-12-10',st:'anu'});
   window.__tes.ui.tab='apag'; window.__tes.open(); }); await p.waitForTimeout(800);
 ok(await p.evaluate(()=>!!document.querySelector('#tesoreria [data-tes="xlsal"]')),'💳 Cheques a pagar tiene «📤 Cheques pendientes a Excel (para Alberto)»');
 const [d2]=await Promise.all([p.waitForEvent('download',{timeout:8000}).catch(()=>null), p.click('#tesoreria [data-tes="xlsal"]')]);
 let cx=null, nm=''; if(d2){ nm=d2.suggestedFilename(); const w=XLSX.read(fs.readFileSync(await d2.path()),{type:'buffer'}); cx={rows:XLSX.utils.sheet_to_json(w.Sheets['Cheques pendientes']), sh:w.SheetNames}; }
 const rows=cx?cx.rows:[]; console.log('   '+nm+' · '+JSON.stringify(rows.slice(0,3)));
 ok(cx&&rows.length===3&&rows[0]['Proveedor']==='PROV DOS'&&rows[1]['Proveedor']==='PROV UNO'&&rows[2]['Monto ₲']===4000000&&rows[2]['Cuenta / chequera']==='TOTAL','salen solo los 2 pendientes, ordenados por fecha de débito, con el total ₲ 4.000.000');
 ok(cx&&!rows.some(r=>/PAGADO|ANULADO/.test(r.Proveedor||''))&&cx.sh.includes('Léeme')&&/^Cheques_pendientes_/.test(nm),'no salen pagados ni anulados; trae hoja «Léeme» ('+(cx&&cx.sh.join(','))+')');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); console.log(fail?'✘ t602 con fallas':'✔ t602 OK'); process.exit(fail?1:0); })();
