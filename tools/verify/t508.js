// v1277 · 💳 Cheques a pagar en el celular: cada cheque es una tarjeta con sus campos rotulados (Proveedor, Monto, Vence, Se cobra, Banco · N.º, Estado) y el color de su día
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844},ctx:{hasTouch:true,isMobile:true}});
 await p.evaluate(()=>{ const T=window.__tes.st(); const f=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); const h=new Date(); for(let i=-2;i<6;i++){ const d=new Date(h); d.setDate(h.getDate()+i); T.chq.push({id:'c'+i,prov:'PROV '+i,cta:'Basa-G',num:String(100+i),monto:1000000+i,co:f(d),st:'pend',tipo:'Diferido'}); } window.__tes.save(); window.__tes.ui.tab='apag'; window.__tes.open(); }); await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>{ const tr=document.querySelector('#tesoreria .ap-list table.tes-t tr:not(:first-child)'); if(!tr) return null; const cs=getComputedStyle(tr); const labs=[...tr.querySelectorAll('td[data-l]')].map(td=>getComputedStyle(td,'::before').content.replace(/"/g,'')); const pv=tr.querySelector('.apc-pv').getBoundingClientRect(), m=tr.querySelector('.apc-m').getBoundingClientRect(), st=tr.querySelector('.apc-st select').getBoundingClientRect(); return { disp:cs.display, bl:cs.borderLeftWidth, labs, order: pv.top<m.top, wide: st.width>250, fits: tr.getBoundingClientRect().right<=392 }; });
 ok(r&&r.disp==='grid'&&parseFloat(r.bl)>=6,'cada cheque es una tarjeta con la franja de color '+JSON.stringify(r&&{d:r.disp,b:r.bl}));
 ok(r&&['Vence','Se cobra (fecha real)','Proveedor','Banco · N.º','Monto','Estado'].every(x=>r.labs.includes(x)),'cada campo tiene su rótulo '+JSON.stringify(r&&r.labs));
 ok(r&&r.order&&r.wide&&r.fits,'proveedor arriba, monto grande, estado a lo ancho y todo entra en la pantalla');
 const tot=await p.evaluate(()=>[...document.querySelectorAll('#tesoreria .ap-tt')].length>0); ok(tot,'cada día muestra sus totales DÍA / SEMANA / MES');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
