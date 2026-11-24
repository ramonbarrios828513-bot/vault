// v1331 · 📠 antes de escanear el ticket hay que elegir la SUCURSAL y el CAJERO; el ticket no los cambia y avisa en rojo si dice otra persona u otra sucursal
process.env.SCANGATE='1';
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844},launch:{args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']},ctx:{permissions:['camera']}});
 await p.evaluate(()=>{ const S=window.__cz.st(); S.wkPers=[{n:'ANA GOMEZ',suc:'Local 1 KM7'},{n:'LUIS PEREZ',suc:'Local 1 KM7'},{n:'MARTA RUIZ',suc:'Local 2 KM8'}]; window.__cz.open(); }); await p.waitForTimeout(800);
 const gate=()=>p.evaluate(()=>!!document.querySelector('.cz-gate'));
 await p.evaluate(()=>document.querySelector('#cierre [data-cz="cam"]').click()); await p.waitForTimeout(500);
 let s=await p.evaluate(()=>({g:!!document.querySelector('.cz-gate'),cam:!!document.querySelector('.cz-cam'),dis:document.querySelector('.cz-gate [data-g31="ok"]').disabled,cajDis:document.querySelector('.cz-gate [data-g31="caj"]').disabled}));
 ok(s.g&&!s.cam&&s.dis&&s.cajDis,'sin sucursal ni cajero, «📠 Escanear» no abre la cámara: pide primero sucursal y cajero');
 await p.selectOption('.cz-gate [data-g31="suc"]','Local 1 KM7'); await p.waitForTimeout(200);
 s=await p.evaluate(()=>({dis:document.querySelector('.cz-gate [data-g31="ok"]').disabled,grp:[...document.querySelectorAll('.cz-gate [data-g31="caj"] optgroup')].map(g=>g.label+':'+[...g.children].map(o=>o.textContent).join(',')).join(' | ')}));
 ok(s.dis&&/De esta sucursal:ANA GOMEZ,LUIS PEREZ/.test(s.grp)&&/OTRA sucursal:MARTA RUIZ/.test(s.grp),'con la sucursal elegida ofrece primero a su gente ('+s.grp+') y todavía no deja seguir');
 await p.click('.cz-gate [data-g31="x"]'); await p.waitForTimeout(200); ok(!(await gate()),'«Cancelar» cierra sin escanear');
 // elegir foto guardada también pide
 await p.evaluate(()=>{ window.__fc592=0; HTMLInputElement.prototype.click=function(){ if(this.dataset.czfoto==='1') window.__fc592++; }; document.querySelector('#cierre input[data-czfoto="1"]').closest('label').click(); }); await p.waitForTimeout(400);
 s=await p.evaluate(()=>({g:!!document.querySelector('.cz-gate'),n:window.__fc592})); ok(s.g&&s.n===0,'«🖼️ Elegir foto(s) guardada(s)» también pide primero sucursal y cajero');
 await p.selectOption('.cz-gate [data-g31="suc"]','Local 1 KM7'); await p.waitForTimeout(150); await p.selectOption('.cz-gate [data-g31="caj"]','ANA GOMEZ'); await p.waitForTimeout(150);
 await p.click('.cz-gate [data-g31="ok"]'); await p.waitForTimeout(600);
 s=await p.evaluate(()=>{ const d=Object.values(window.__cz.st().draft||{})[0]; return {n:window.__fc592,suc:document.querySelector('#cierre [data-czk="suc"]').value,caj:document.querySelector('#cierre [data-czk="caj"]').value,g:!!document.querySelector('.cz-gate')}; });
 ok(!s.g&&s.n===1&&s.suc==='Local 1 KM7'&&s.caj==='ANA GOMEZ','al seguir, la sucursal y el cajero quedan cargados en el cierre y recién ahí se abre el selector de fotos');
 // ahora el escáner abre directo
 await p.evaluate(()=>{ window.__n592=0; window.__aiVision=async()=>{ window.__n592++; return {text:JSON.stringify({n:61,cajero:'MARTA RUIZ',local:'NISSIFARMA KM 8',ini:100000,ef:500000,remesas:500000,reserva:100000})}; }; });
 await p.evaluate(()=>document.querySelector('#cierre [data-cz="cam"]').click()); await p.waitForSelector('.cz-cam',{timeout:8000}); await p.waitForTimeout(1800);
 ok(!(await gate()),'con sucursal y cajero elegidos, «📠 Escanear» abre la cámara directo');
 await p.evaluate(()=>{ const o=document.querySelector('.cz-cam'); const bt=o.querySelector('[data-cam="shot"]')||[...o.querySelectorAll('[data-cam]')].find(x=>/Sacar|📸/.test(x.textContent)); bt.click(); }); await p.waitForSelector('.ds-rv',{timeout:15000}); await p.waitForTimeout(500);
 await p.click('.ds-rv [data-ds="ok"]'); await p.waitForTimeout(3000);
 s=await p.evaluate(()=>({n:window.__n592,suc:document.querySelector('#cierre [data-czk="suc"]').value,caj:document.querySelector('#cierre [data-czk="caj"]').value,av:[...document.querySelectorAll('#cierre .cz-avis31')].map(x=>x.textContent).join(' || ')}));
 console.log(s.av);
 ok(s.n===1&&s.suc==='Local 1 KM7'&&s.caj==='ANA GOMEZ','el ticket de otra persona y otra sucursal NO cambia lo que se eligió ('+s.suc+' · '+s.caj+')');
 ok(/cajero\/a «MARTA RUIZ» y vos elegiste «ANA GOMEZ»/.test(s.av),'avisa en rojo que el ticket dice otro cajero');
 ok(/parece Local 2 KM8\) y vos elegiste Local 1 KM7/.test(s.av),'avisa en rojo que el encabezado es de otra sucursal');
 // mismo cajero y misma sucursal: sin avisos
 const r=await p.evaluate(()=>{ const f=window.__cz.fotoApply&&window.__cz.fotoApply({n:62,cajero:'Ana Gomes',local:'Nissifarma Km7',ef:1000}); return f?JSON.stringify(f.avis):'nohook'; });
 ok(r==='[]','si el ticket dice la misma persona y la misma sucursal no hay avisos ('+r+')');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
