// v1311 · editor de cheque: solo se escribe la FECHA A COBRAR (la del cheque); la fecha real de débito la calcula el sistema (sábado, domingo o feriado → próximo día hábil) y está bloqueada
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const hoy=await p.evaluate(()=>{ const u=window.__tes.ui; window.__tes.open(); const T=window.__tes.st(); const d=new Date(), hoy=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); T.chq.push({id:'cT563',src:'man',st:'pend',tipo:'CHEQUE',fp:'Cheque diferido',prov:'DISTRIBUIDORA T563',cat:'Mercaderías',monto:11069000,cta:'Basa-G',num:'99563001',em:hoy,co:hoy,key:'Basa-G|99563001',entg:'si',u:1000}); window.__tes.draw(); const a=document.getElementById('tesoreria'), bt=document.createElement('button'); bt.dataset.tes='edit'; bt.dataset.id='cT563'; bt.hidden=true; a.appendChild(bt); bt.click(); bt.remove(); return hoy; });
 await p.waitForTimeout(500);
 const lab=await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.ico-ov')].pop(); const f=ov&&ov.querySelector('[data-fdl]'); const e=ov&&ov.querySelector('[data-k="em"]'); return {em:e?e.value:'', dis:!!(f&&f.disabled), editable:!!(ov&&ov.querySelector('[data-k="fdeb"]')), tx:ov?ov.innerText.replace(/\s+/g,' '):''}; });
 ok(lab.em===hoy&&/Fecha de emisión/.test(lab.tx),'la ventana del cheque muestra la fecha de emisión ('+lab.em+')');
 ok(lab.dis&&!lab.editable&&/la calcula el sistema/.test(lab.tx),'la fecha real de débito está bloqueada: no se puede escribir, la calcula el sistema');
 const fl=await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.ico-ov')].pop(); const i=ov.querySelector('[data-k="co"]'); i.value='2026-12-19'; i.dispatchEvent(new Event('input',{bubbles:true})); return ov.querySelector('[data-fdl]').value; });
 ok(/lun 21\/12/.test(fl),'pongo sábado 19/12 como fecha a cobrar: el sistema muestra que se debita el lunes 21/12 → '+fl);
 await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.ico-ov')].pop(); ov.querySelector('[data-e="ok"]').click(); }); await p.waitForTimeout(600);
 const r=await p.evaluate(()=>{ const c=window.__tes.st().chq.find(x=>x.id==='cT563'); return {co:c.co, fdeb:c.fdeb||'', st:c.st, fresh:(+c.u||0)>Date.now()-60000}; });
 console.log(JSON.stringify(r));
 ok(r.co==='2026-12-19'&&r.fdeb===''&&r.st==='pend','queda guardada la fecha a cobrar original (sáb 19/12), sin fecha de débito escrita a mano, y sigue A pagar');
 ok(r.fresh,'queda como el último cambio para la sincronización');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
