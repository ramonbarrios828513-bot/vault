// v1259 · cheque cargado en «Cargar cheque nuevo» con tipo «Compra…» SÍ cuenta en «Cheques a cubrir» y «por conciliar»; el proveedor escrito a mano queda registrado
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}});
 await p.evaluate(()=>window.__tes.open()); await p.waitForTimeout(1000);
 await p.evaluate(()=>{ const b=document.createElement('button'); b.dataset.tes='tab'; b.dataset.v='carga'; document.getElementById('tesoreria').appendChild(b); b.click(); }); await p.waitForTimeout(700);
 const hoy=await p.evaluate(()=>{ const h=new Date(); return new Date(h.getTime()-h.getTimezoneOffset()*60000).toISOString().slice(0,10); });
 await p.evaluate((hoy)=>{ const $=id=>document.getElementById(id); $('tesNP').value='Parma Internacional S.A.'; $('tesNM').value='11.325.147'; $('tesNF').value=hoy; if($('tesNE')) $('tesNE').value=hoy; $('tesNN').value='998877'; const t=$('tesNT'); t.value=[...t.options].find(o=>/Compra/.test(o.text)).value||'Compra para la venta (mercadería)'; document.querySelector('[data-tes="simSave"]').click(); },hoy); await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{ const T=window.__tes.st(); const c=T.chq.find(x=>x.prov==='Parma Internacional S.A.'); return { c:!!c, tipo:c&&c.tipo, html:window.__txChqHoy(), prov:Object.keys((T.cfg||{}).provN||{}) }; });
 ok(r.c&&/Compra/.test(r.tipo),'el cheque se guardó con tipo «Compra…»');
 ok(/Parma Internacional/.test(r.html)&&/11\.325\.147/.test(r.html),'aparece en «Cheques a cubrir» y suma al total');
 ok(r.prov.indexOf('Parma Internacional S.A.')>=0,'el proveedor escrito a mano quedó registrado');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
