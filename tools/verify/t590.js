// v1329 · 📠 escanear el ticket con la cámara: «✅ Usar y LEER el ticket» pasa directo a leer (antes volvía a la cámara); «➕ Usar y sacar OTRA PARTE» sigue en la cámara para un ticket largo
process.env.SCANRV='1';
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:390,height:844},launch:{args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']},ctx:{permissions:['camera']}});
 await p.evaluate(()=>{ const S=window.__cz.st(); S.wkPers=[{n:'ANA',suc:'Local 1 KM7'}]; window.__cz.open(); }); await p.waitForTimeout(700);
 await p.selectOption('#cierre [data-czk="suc"]','Local 1 KM7').catch(()=>{}); await p.waitForTimeout(500);
 await p.evaluate(()=>{ window.__n590=0; window.__aiVision=async()=>{ window.__n590++; return {text:JSON.stringify({n:61,ini:100000,ef:500000,remesas:500000,reserva:100000,saldo_rendir:0})}; }; });
 const abrir=async()=>{ await p.evaluate(()=>document.querySelector('#cierre [data-cz="cam"]').click()); await p.waitForSelector('.cz-cam',{timeout:8000}); await p.waitForTimeout(1800); };
 const foto=async()=>{ await p.evaluate(()=>{ const o=document.querySelector('.cz-cam'); const b=o.querySelector('[data-cam="shot"]')||[...o.querySelectorAll('[data-cam]')].find(x=>/Sacar|📸/.test(x.textContent)); b.click(); }); await p.waitForSelector('.ds-rv',{timeout:15000}); await p.waitForTimeout(500); };
 await abrir(); const cams=await p.evaluate(()=>[...document.querySelectorAll('.cz-cam [data-cam]')].map(x=>x.dataset.cam+':'+x.textContent.trim().slice(0,18)).join(' | ')); console.log(cams);
 await foto();
 let bt=await p.evaluate(()=>[...document.querySelectorAll('.ds-rv .ds-b [data-ds]')].map(x=>x.dataset.ds+':'+x.textContent).join(' | ')); console.log(bt);
 ok(/more:➕ Usar y sacar OTRA PARTE/.test(bt)&&/ok:✅ Usar y LEER el ticket/.test(bt),'la revisión de la cámara ofrece «Usar y LEER» y «Usar y sacar OTRA PARTE»');
 await p.click('.ds-rv [data-ds="ok"]'); await p.waitForTimeout(3000);
 let s=await p.evaluate(()=>({cam:!!document.querySelector('.cz-cam'),rv:!!document.querySelector('.ds-rv'),n:window.__n590,ef:(Object.values(window.__cz.st().draft)[0].d.v||{}).ef}));
 ok(!s.cam&&!s.rv&&s.n===1&&s.ef===500000,'«✅ Usar y LEER» cierra la cámara y lee el ticket directo (1 lectura, efectivo cargado)');
 // ticket largo: otra parte y después leer
 await abrir(); await foto(); await p.click('.ds-rv [data-ds="more"]'); await p.waitForTimeout(900);
 s=await p.evaluate(()=>({cam:!!document.querySelector('.cz-cam'),n:window.__n590,th:document.querySelectorAll('.cz-cam #czCamTh img').length}));
 ok(s.cam&&s.n===1&&s.th===1,'«➕ OTRA PARTE» vuelve a la cámara con la primera foto guardada y todavía no lee');
 await foto(); await p.click('.ds-rv [data-ds="ok"]'); await p.waitForTimeout(3000);
 s=await p.evaluate(()=>({cam:!!document.querySelector('.cz-cam'),n:window.__n590}));
 ok(!s.cam&&s.n===2,'con la segunda parte, «Usar y LEER» lee las dos fotos juntas');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
