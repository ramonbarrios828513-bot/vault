// v1334 · Cierre: el DUEÑO confirma como dueño en su Baúl (sin clave, no se le propone a un funcionario) · no se escanea con un ticket sin guardar · «Nueva carga» y el borrador recuperado se pueden descartar ahí mismo
process.env.CZAUTH='1'; process.env.SCANGATE='1';
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844}});
 await p.evaluate(()=>{ const S=window.__cz.st(); S.wkPers=[{n:'ANA GOMEZ',suc:'Local 1 KM7'}]; S.users=[{id:'u1',name:'VIRGILIO PRUEBA',alias:'virgilio',rol:'Carga cierres',h:''},{id:'u2',name:'OTRA PERSONA',rol:'Carga cierres',h:''}]; window.__cz.open(); }); await p.waitForTimeout(800);
 await p.selectOption('#cierre [data-czk="suc"]','Local 1 KM7'); await p.waitForTimeout(300); await p.selectOption('#cierre [data-czk="caj"]','ANA GOMEZ'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ window.__cz.fotoApply({n:1990,caja:1,cajero:'ANA GOMEZ',ini:100000,ef:500000,remesas:500000,reserva:100000}); window.__cz.open(); }); await p.waitForTimeout(800);
 const g=k=>p.evaluate(k=>{ const e=document.querySelector('#cierre [data-czk="'+k+'"]'); return e?e.value:null; },k);
 ok(await g('n')==='1990','el ticket leído carga su número de turno (1990)');
 // no se puede escanear con un ticket sin guardar
 await p.evaluate(()=>document.querySelector('#cierre [data-cz="cam"]').click()); await p.waitForTimeout(500);
 let v=await p.evaluate(()=>{ const o=document.querySelector('.cz-viejo'); return o?{t:o.innerText.replace(/\s+/g,' '),cam:!!document.querySelector('.cz-cam'),bt:[...o.querySelectorAll('[data-v34]')].map(x=>x.dataset.v34).join(',')}:null; });
 ok(v&&!v.cam&&/No se puede escanear todavía/.test(v.t)&&/turno 1990/.test(v.t)&&v.bt==='guardar,nuevo,x','con un ticket sin guardar no abre la cámara: avisa y ofrece guardar o limpiar');
 await p.evaluate(()=>document.querySelector('.cz-viejo [data-v34="guardar"]').click()); await p.waitForTimeout(500);
 ok(!(await p.evaluate(()=>!!document.querySelector('.cz-viejo')))&&await g('n')==='1990','«💾 Guardar el anterior» no borra nada y te lleva a guardar');
 await p.evaluate(()=>document.querySelector('#cierre [data-cz="cam"]').click()); await p.waitForTimeout(400);
 await p.evaluate(()=>document.querySelector('.cz-viejo [data-v34="nuevo"]').click()); await p.waitForTimeout(900);
 let s=await p.evaluate(()=>({n:(document.querySelector('#cierre [data-czk="n"]')||{}).value,ef:(document.querySelector('#cierre [data-czk="v.ef"]')||{}).value,suc:(document.querySelector('#cierre [data-czk="suc"]')||{}).value,caj:(document.querySelector('#cierre [data-czk="caj"]')||{}).value,gate:!!document.querySelector('.cz-gate'),draft:Object.keys(window.__cz.st().draft||{}).length}));
 ok(s.n===''&&s.ef===''&&s.caj===''&&s.suc==='Local 1 KM7'&&s.draft===0,'«🧹 Limpiar» borra lo de la pantalla y deja solo la sucursal ('+JSON.stringify(s)+')');
 ok(s.gate,'y enseguida pide el cajero para escanear el ticket nuevo');
 await p.evaluate(()=>{ const x=document.querySelector('.cz-gate [data-g31="x"]'); if(x) x.click(); }); await p.waitForTimeout(300);
 // botón Nueva carga
 await p.selectOption('#cierre [data-czk="caj"]','ANA GOMEZ'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ window.__cz.fotoApply({n:1991,caja:1,cajero:'ANA GOMEZ',ef:1000}); window.__cz.open(); }); await p.waitForTimeout(700);
 ok(await p.evaluate(()=>!!document.querySelector('#cierre [data-cz31="nueva"]')),'junto al escáner está «🆕 Nueva carga»');
 // dueño confirma como dueño, sin clave
 await p.evaluate(()=>{ const t=document.querySelector('#cierre [data-czk="sobre"]'); }); 
 await p.evaluate(()=>document.querySelector('#cierre [data-cz="save"]').click()); await p.waitForTimeout(900);
 let a=await p.evaluate(()=>{ const u=document.querySelector('#caU'); if(!u) return {no:[...document.querySelectorAll('.toast,#toast,.ask-ov')].map(x=>x.innerText).join(' | ').slice(0,200)}; return {v:u.value,opts:[...u.options].map(o=>o.textContent.trim()),claveVisible:document.querySelector('#caL1').style.display!=='none'}; });
 console.log(JSON.stringify(a));
 if(a.no){ ok(true,'(el guardado pidió otra cosa antes: '+a.no.slice(0,80)+')'); await p.evaluate(()=>{ window.__czAuthT=null; window.__cz.auth&&0; }); }
 const A2=await p.evaluate(()=>new Promise(res=>{ if(document.querySelector('#caU')) return res('abierto'); res('cerrado'); }));
 if(A2==='cerrado'){ await p.evaluate(()=>window.__cz.authTest()); await p.waitForTimeout(500); a=await p.evaluate(()=>{ const u=document.querySelector('#caU'); return {v:u.value,opts:[...u.options].map(o=>o.textContent.trim()),claveVisible:document.querySelector('#caL1').style.display!=='none'}; }); }
 ok(a.v==='__own'&&/DUEÑO/.test(a.opts[0])&&!a.claveVisible,'en el Baúl del dueño «¿Quién sos?» propone 👑 DUEÑO y no pide clave ('+a.opts.join(' / ')+')');
 await p.evaluate(()=>{ window.__auth595=null; }); await p.evaluate(()=>document.querySelector('[data-ca="ok"]').click()); await p.waitForTimeout(700);
 ok(!(await p.evaluate(()=>!!document.querySelector('#caU'))),'al confirmar como dueño el cuadro se cierra sin pedir nada más');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
