// v1210 · Cierre X por bloques: detalle de tarjetas/QR/transferencias, control de suma, N.º repetido entre cierres, conciliación separada y junta, lectura de foto (simulada)
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ const S=window.__cz.st(); S.t.push({id:'old1',n:100,f:'2026-11-12',suc:'Central',caja:'Caja 1',tur:'Mañana',caj:'X',v:{deb:50000},tjd:[{tk:'000777',m:50000}]}); window.__cz.open(); });
 await p.waitForTimeout(800);
 const txt=()=>p.evaluate(()=>document.querySelector('#cierre').innerText);
 let t=await txt(); ok(/Bloques del cierre/.test(t),'índice de bloques arriba');
 ok(await p.evaluate(()=>['czb-ef','czb-tj','czb-qr','czb-tr','czb-fx','czb-cr','czb-eg','czb-so','czb-cc'].every(i=>document.getElementById(i))),'cada bloque tiene su lugar para ir directo');
 // cargar totales y detalle
 await p.evaluate(()=>{ const set=(k,v)=>{ const e=document.querySelector('#cierre [data-czk="'+k+'"]'); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); }; set('v.deb','100000'); set('v.tr','80000'); });
 await p.evaluate(()=>document.querySelector('#cierre [data-cz="add"][data-k="tjd"]').click()); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const set=(k,v)=>{ const e=document.querySelector('#cierre [data-czk="'+k+'"]'); e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); }; set('tjd.0.tk','777'); set('tjd.0.m','60000'); });
 await p.evaluate(()=>window.__cz.open()); await p.waitForTimeout(500); t=await txt();
 ok(/falta detallar ₲ 40\.000/.test(t),'control de suma: falta detallar 40.000');
 ok(/ya se usó en el turno N\.º 100/.test(t),'avisa N.º de voucher ya usado en otro cierre');
 ok(/⚠️ 💳 Tarjetas/.test(t),'chip de tarjetas en ⚠️');
 // foto simulada de transferencias
 await p.evaluate(()=>{ window.__aiVision=async()=>({text:JSON.stringify({items:[{banco:'Itaú',nombre:'JUAN PEREZ',op:'A123',hora:'10:15',monto:30000},{banco:'ueno',nombre:'ANA',op:'B456',monto:50000}]})}); const f=new File([new Uint8Array([1])],'x.png'); });
 await p.evaluate(async()=>{ const c=document.createElement('canvas'); c.width=200;c.height=300; const blob=await new Promise(r=>c.toBlob(r,'image/png')); const f=new File([blob],'cap.png',{type:'image/png'}); const inp=document.querySelector('#cierre input[data-czfoto="tr"]'); const dt=new DataTransfer(); dt.items.add(f); inp.files=dt.files; inp.dispatchEvent(new Event('change',{bubbles:true})); });
 await p.waitForTimeout(2500); t=await txt();
 const tr=await p.evaluate(()=>JSON.stringify(window.__cz.st().draft ? Object.values(window.__cz.st().draft)[0].d.trd : null));
 ok(/A123/.test(tr) && /B456/.test(tr),'foto de capturas → 2 transferencias cargadas'+' '+tr.slice(0,120));
 ok(/✔ 🏦 Transferencias/.test(t),'transferencias cuadran (30.000 + 50.000 = 80.000)');
 // conciliación
 ok(/Separado: por forma de pago/.test(t) && /Ticket Vital/.test(t),'conciliación separada visible');
 await p.evaluate(()=>document.querySelector('#cierre [data-cz="cvw"][data-v="cta"]').click()); await p.waitForTimeout(400); t=await txt();
 ok(/TOTAL a ver en el extracto/.test(t),'conciliación junta por cuenta que recibe');
 ok(errs.length===0,'sin errores de JavaScript '+errs.slice(0,3).join(' | '));
 await b.close(); console.log(fail?'RESULTADO: '+fail+' FALLA(S)':'RESULTADO: TODO OK'); process.exit(fail?1:0);
})().catch(e=>{ console.log('✘ FALLA excepción '+e.message); process.exit(1); });
