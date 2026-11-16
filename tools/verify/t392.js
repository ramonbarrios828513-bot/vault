// v1222 · cheques a pagar: FECHA REAL de cobro. Lo vencido no debitado y lo que vence sábado/domingo se suma al próximo día hábil (y pasadas las 17 h, al día hábil siguiente); los fines de semana no esconden montos.
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1300,height:900}});
 const info=await p.evaluate(()=>{ const T=window.__tes.st(); const hoy=(()=>{const h=new Date(); return h.getFullYear()+'-'+String(h.getMonth()+1).padStart(2,'0')+'-'+String(h.getDate()).padStart(2,'0');})();
   const add=(d,n)=>{ const x=new Date(d+'T12:00:00'); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); }; let sat=hoy; for(let i=1;i<9;i++){ const d=add(hoy,i); if(new Date(d+'T12:00:00').getDay()===6){ sat=d; break; } }
   T.chq.push({id:'v1',prov:'PROV VENCIDO',cta:'Basa-G',num:'1',monto:4684659,co:add(hoy,-3),st:'pend',tipo:'Diferido'},{id:'v2',prov:'PROV SABADO',cta:'Basa-G',num:'2',monto:1000000,co:sat,st:'pend',tipo:'Diferido'}); window.__tes.save(); window.__tes.ui.tab='apag'; window.__tes.open(); return {hoy,sat}; });
 await p.waitForTimeout(1200);
 const r=await p.evaluate(()=>{ const days=[...document.querySelectorAll('.ap-day')].map(d=>({t:d.innerText.replace(/\s+/g,' ').slice(0,400), we:d.classList.contains('ap-we'), hoy:d.classList.contains('ap-hoy')})); return days; });
 const cor=r.find(d=>d.hoy); console.log('corte:',cor&&cor.t.slice(0,250));
 ok(cor && /PROV VENCIDO/.test(cor.t) && /4\.684\.659/.test(cor.t),'el cheque vencido no debitado aparece en el próximo día de cobro');
 ok(r.filter(d=>d.we).every(d=>!/PROV/.test(d.t)),'los fines de semana no tienen cheques escondidos');
 const lun=r.find(d=>!d.we && /PROV SABADO/.test(d.t)); ok(lun && /lun/i.test(lun.t),'lo que vence el sábado se cobra el lunes');
 ok(await p.evaluate(()=>/Se cobra \(fecha real\)/i.test(document.querySelector('#tesoreria').innerText)),'columna «Se cobra (fecha real)»');
 ok(!errs.length,'sin errores: '+errs.slice(0,2).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
