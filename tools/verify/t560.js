// v1310 · al editar la fecha a cobrar de un cheque «A pagar», sale del día viejo (se borra la fecha de débito anterior) y queda marcado como el último cambio para que la sincronización no lo pise
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const r0=await p.evaluate(()=>{ const u=window.__tes.ui; window.__tes.open(); const T=window.__tes.st(); const d=new Date(), hoy=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); const cta=(T.chq.find(c=>c.cta)||{}).cta||'Basa-G'; T.chq.push({id:'cT560',src:'man',st:'pend',tipo:'CHEQUE',fp:'Cheque diferido',prov:'DISTRIBUIDORA T560',cat:'Mercaderías',monto:11069000,cta:cta,num:'99560001',em:hoy,co:hoy,fdeb:hoy,key:cta+'|99560001',entg:'si',u:1000}); u.tab='gasto'; u.solo='gasto'; window.__tes.draw(); const a=document.getElementById('tesoreria'), bt=document.createElement('button'); bt.dataset.gc='ed'; bt.dataset.id='cT560'; bt.hidden=true; a.appendChild(bt); bt.click(); bt.remove(); return {hoy, open:!![...document.querySelectorAll('.ico-ov')].pop()}; });
 await p.waitForTimeout(500);
 const has=await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.ico-ov')].pop(); return !!(ov&&ov.querySelector('[data-k="co"]')); }); ok(has,'se abre el formulario de editar el cheque');
 await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.ico-ov')].pop(); const i=ov.querySelector('[data-k="co"]'); i.value='2026-12-21'; i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); const bs=[...ov.querySelectorAll('button')].filter(x=>/Guardar/.test(x.textContent)); bs[bs.length-1].click(); }); await p.waitForTimeout(600);
 const r=await p.evaluate(()=>{ const c=window.__tes.st().chq.find(x=>x.id==='cT560'); return {co:c.co, fdeb:c.fdeb||'', fresh:(+c.u||0)>Date.now()-60000, st:c.st}; });
 console.log(JSON.stringify(r));
 ok(r.co==='2026-12-21'&&r.fdeb===''&&r.st==='pend','la fecha nueva queda y se borra la fecha de débito vieja (ya no aparece hoy)');
 ok(r.fresh,'queda marcado como el último cambio: la sincronización no lo pisa');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
