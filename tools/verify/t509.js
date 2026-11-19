// v1277 · si la notebook está usando Gestión de cheques, en el celular igual se puede ABRIR «💳 CHEQUES A PAGAR» para mirar (cargar sigue bloqueado)
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844},ctx:{hasTouch:true,isMobile:true}});
 await p.evaluate(()=>{ const T=window.__tes.st(); const f=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); const h=new Date(); for(let i=0;i<4;i++){ const d=new Date(h); d.setDate(h.getDate()+i); T.chq.push({id:'c'+i,prov:'PROV '+i,cta:'Basa-G',num:String(i),monto:1000000+i,co:f(d),st:'pend',tipo:'Diferido'}); } window.__tes.save(); window.__tes.ui.tab='sal'; window.__tes.open(); }); await p.waitForTimeout(800);
 const locked=await p.evaluate(()=>{ const A=window.__acc; A.st.locks.tes={who:'Otro equipo',dev:'otro-dev',dn:'💻 computadora',t:Date.now(),t0:Date.now()}; try{ A.paint&&A.paint(); }catch(e){} return !A.can('tes'); }); ok(locked,'la notebook tiene el módulo: en el celular queda «solo ver»');
 await p.evaluate(()=>{ document.querySelector('#tesoreria [data-tes="tab"][data-v="apag"]').scrollIntoView({block:'center'}); }); await p.waitForTimeout(300);
 const bb=await p.evaluate(()=>{ const r=document.querySelector('#tesoreria [data-tes="tab"][data-v="apag"]').getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; });
 await p.touchscreen.tap(bb[0],bb[1]); await p.waitForTimeout(900);
 const r=await p.evaluate(()=>({tab:window.__tes.ui.tab, cards:document.querySelectorAll('#tesoreria .ap-list table.tes-t tr:not(:first-child)').length}));
 ok(r.tab==='apag'&&r.cards>0,'igual se abre 💳 CHEQUES A PAGAR y se ven los cheques '+JSON.stringify(r));
 const sel=await p.evaluate(()=>{ const s=document.querySelector('#tesoreria select[data-ap]'); const v=s.value; s.value='pag'; s.dispatchEvent(new Event('change',{bubbles:true})); return window.__tes.st().chq.find(c=>c.id===s.dataset.tesst).st; }); ok(sel==='pend','pero cambiar el estado sigue bloqueado mientras la notebook lo usa ('+sel+')');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
