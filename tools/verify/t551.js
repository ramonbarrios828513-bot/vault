// v1307 · a la venta se carga SOLO por código de barra: por descripción se busca y se mira, pero al elegir pide la barra completa (lector o tipeada); barra de otro producto no entra
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__noBarVal=false; window.__vt.open(); const V=window.__vt.st(); V.open=true; Object.keys(V.arts).forEach(k=>delete V.arts[k]); V.arts.vk={id:'vk',va:1,n:'Kitadol Forte caja x20',u:20,bar:['7840199086491'],pvp:20000,costo:7000,cod:'1',frac:false,neg:'pvp'}; V.arts.vz={id:'vz',va:1,n:'Zetamol 500 caja x10',u:10,bar:['7840000000017'],pvp:10000,costo:4000,cod:'2',frac:false,neg:'pvp'}; V.stk.vk=100; V.stk.vz=100; const t=V.tabs[0]; V.cur=t.id; t.lines=[]; window.__vt.open(); });
 await p.waitForTimeout(1300);
 const nl=()=>p.evaluate(()=>window.__vt.st().tabs[0].lines.map(l=>l.n+' x'+l.q).join(' | '));
 await p.fill('#vtQ','kitadol'); await p.waitForTimeout(400);
 const res=await p.evaluate(()=>document.querySelectorAll('[data-vt="pick"]').length); ok(res>=1,'por descripción encuentra y muestra el producto ('+res+')');
 await p.click('[data-vt="pick"]'); await p.waitForTimeout(300);
 const dl=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.vt-ov')].filter(x=>x.querySelector('[data-nb]')).pop(); return o?o.innerText.replace(/\s+/g,' '):''; });
 ok(/Validar por código de barra/.test(dl)&&/Kitadol/.test(dl)&&(await nl())==='','al elegirlo por descripción NO entra a la venta: pide la barra');
 const typ=async(v)=>{ await p.evaluate((v)=>{ const i=[...document.querySelectorAll('.vt-ov [data-nb]')].pop(); i.value=v; i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); },v); await p.waitForTimeout(300); };
 await typ('78401990'); ok((await nl())==='','barra incompleta: no entra');
 await typ('7840000000017'); ok((await nl())===''&&/otro producto/.test(await p.evaluate(()=>document.getElementById('toast').textContent)),'barra de OTRO producto: no entra y avisa');
 await typ('7840199086491'); ok(/Kitadol.* x1/.test(await nl()),'barra completa correcta: entra a la venta → '+await nl());
 // lector directo en el buscador
 await p.fill('#vtQ','7840000000017'); await p.press('#vtQ','Enter'); await p.waitForTimeout(300);
 ok(/Zetamol.* x1/.test(await nl()),'con el lector (barra + Enter) entra directo → '+await nl());
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
