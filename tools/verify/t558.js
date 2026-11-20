// v1309 · 📨 solicitudes entre sucursales: saca de la sucursal a la que le QUEDAN más días después de dar; la última unidad va al encargado; no urgente se aprueba o se rechaza con motivo (se avisa y se puede pedir a otra o al encargado); si nadie tiene, a la central
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const init=(S)=>p.evaluate((S)=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.obj=Object.assign(V.obj||{}, {suc:'KM 7 Central'}); Object.keys(V.arts).forEach(k=>delete V.arts[k]); V.arts.vz={id:'vz',va:1,n:'Zetamol 500 unidad',u:1,bar:['7840000000017'],pvp:10000,costo:4000,cod:'2',frac:false,neg:'pvp'}; V.stk.vz=0; V.sold.vz=0; V.sucs=null; V.sucS=S; V.transf=[]; V.sol=[]; V.tabs.forEach(t=>t.lines=[]); const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{val:true,aid:'vz',pid:'caja',pt:'caja',n:'Zetamol 500 unidad',q:1,pvp:10000,cost:4000,uq:1}]; window.__vt.open(); },S);
 const dlg=async()=>{ await p.waitForTimeout(1300); await p.click('#ventas [data-vt="lsuc"]'); await p.waitForTimeout(400); return p.evaluate(()=>[...document.querySelectorAll('#sucDlg tr')].slice(1).map(t=>t.innerText.replace(/\s+/g,' '))); };
 const sw=async(v)=>{ await p.evaluate((v)=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); const V=window.__vt.st(); V.tabs.forEach(t=>t.lines=[]); window.__vt.open(); },v); await p.waitForTimeout(1300); await p.evaluate((v)=>{ const s=document.querySelector('#ventas [data-sucsw]'); s.value=v; s.dispatchEvent(new Event('change',{bubbles:true})); },v); await p.waitForTimeout(600); };
 const toast=()=>p.evaluate(()=>document.getElementById('toast').textContent);
 // caso 1: A 30 días con 10 · B 15 días con 40 → A
 await init({'KM 11':{vz:{s:10,v:1/3}},'Franco':{vz:{s:40,v:40/15}},'KM 8':{vz:{s:1,v:0}}}); let R=await dlg(); console.log(R.join('\n'));
 ok(/^⭐ KM 11/.test(R[0]),'caso 1 (30 días con 10 u. contra 15 días con 40 u.): saca de la de más días → KM 11');
 ok(R.some(x=>/^KM 8/.test(x)&&/Pedir al encargado/.test(x)&&!/Transferir urgente/.test(x)),'KM 8 tiene 1 sola unidad y nunca vendió: no sale sola, va al encargado');
 // caso 2: A 30 días con 1 · B 15 días con 5 → B
 await p.evaluate(()=>document.querySelectorAll('.vt-ov').forEach(o=>o.remove())); await init({'KM 11':{vz:{s:1,v:1/30}},'Franco':{vz:{s:5,v:1/3}}}); R=await dlg();
 ok(/^⭐ Franco/.test(R[0])&&R.some(x=>/^KM 11/.test(x)&&/Pedir al encargado/.test(x)),'caso 2 (30 días con 1 u. contra 15 días con 5 u.): saca de Franco; la última unidad de KM 11 no sale sola');
 // no urgente → Franco la rechaza con motivo
 await p.click('#sucDlg [data-sno="Franco"]'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>{ const o=window.__vt.st().sol[0]; return o&&o.tipo==='nou'&&o.de==='Franco'&&o.st==='pend'&&window.__vt.st().stk.vz===0; }),'📦 solicitud no urgente a Franco: queda pendiente, todavía no mueve stock');
 await sw('Franco'); ok(/Solicitudes \(1\)/.test(await p.evaluate(()=>(document.querySelector('#ventas [data-vt="solpend"]')||{}).innerText||'')),'Franco ve «📨 Solicitudes (1)»');
 await p.click('#ventas [data-vt="solpend"]'); await p.waitForTimeout(300); await p.click('#solDlg [data-solin] [data-sno2]'); await p.waitForTimeout(300); await p.click('[data-ak="yes"]'); await p.waitForTimeout(300);
 ok(/motivo/i.test(await toast())&&(await p.evaluate(()=>window.__vt.st().sol[0].st))==='pend','no deja rechazar sin escribir el motivo');
 await p.click('#solDlg [data-solin] [data-sno2]'); await p.waitForTimeout(300); await p.fill('.ask-in','Lo tengo reservado para un cliente'); await p.click('[data-ak="yes"]'); await p.waitForTimeout(400);
 await sw('KM 7 Central'); ok(/Solicitudes \(1\)/.test(await p.evaluate(()=>(document.querySelector('#ventas [data-vt="solpend"]')||{}).innerText||'')),'KM 7 recibe el aviso del rechazo (📨 1)');
 await p.click('#ventas [data-vt="solpend"]'); await p.waitForTimeout(300);
 const mine=await p.evaluate(()=>document.querySelector('#solDlg [data-solmine]').innerText.replace(/\s+/g,' ')); ok(/Rechazada/.test(mine)&&/Motivo: Lo tengo reservado para un cliente/.test(mine),'ve por qué se rechazó: '+mine.slice(-150));
 // pasar al encargado → autoriza
 await p.click('#solDlg [data-senc2]'); await p.waitForTimeout(300); await p.click('#solDlg [data-solenc] [data-sok]'); await p.waitForTimeout(400);
 const s1=await p.evaluate(()=>{ const V=window.__vt.st(); return {st:V.sol[0].st, tipo:V.sol[0].tipo, mia:V.stk.vz-(V.sold.vz||0), fr:V.sucS.Franco.vz.s, tr:V.transf.length}; });
 ok(s1.st==='ok'&&s1.tipo==='enc'&&s1.mia===1&&s1.fr===4&&s1.tr===1,'🔐 pasa al encargado, que autoriza: el stock se mueve (KM 7 = 1, Franco = 4): '+JSON.stringify(s1));
 // nadie tiene → central
 await p.evaluate(()=>document.querySelectorAll('.vt-ov').forEach(o=>o.remove())); await init({'Franco':{vz:{s:0,v:1}}}); R=await dlg();
 ok(await p.evaluate(()=>!!document.querySelector('#sucDlg [data-nadie]')),'ninguna sucursal tiene: ofrece «🏢 Solicitar a la central»');
 await p.click('#sucDlg [data-scen]'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>{ const o=window.__vt.st().sol[0]; return o&&o.tipo==='central'&&o.st==='pend'; }),'la solicitud sube a la central para pedir al proveedor');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
