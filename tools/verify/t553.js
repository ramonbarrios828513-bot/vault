// v1308 · 💤 «No vuelven» mira todas las sucursales: separa al cliente que sigue en Nissifarma pero compra en otra sucursal del que no compra en ninguna
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); }); await p.click('#ventas [data-vt="tdemo"]').catch(()=>{}); await p.waitForTimeout(500);
 await p.evaluate(()=>{ const V=window.__vt.st(); V.obj={suc:'KM 7 Central',dia:0,vend:[],prod:{},nv:30,av:3}; const a=V.clients.find(x=>x.id==='cdemo0'), c=V.clients.find(x=>x.id==='cdemo1'); a.demo=0; a.n='Cliente Mudado'; c.demo=0; c.n='Cliente Perdido'; const D=864e5, now=Date.now(); V.sales=[]; V.hist=[{t:now-D,sales:[
   {t:now-40*D,cid:'cdemo0',suc:'KM 7 Central',total:100000,lines:[],pays:[]},{t:now-5*D,cid:'cdemo0',suc:'KM 8',total:60000,lines:[],pays:[]},{t:now-12*D,cid:'cdemo0',suc:'KM 8',total:30000,lines:[],pays:[]},
   {t:now-45*D,cid:'cdemo1',suc:'KM 7 Central',total:80000,lines:[],pays:[]}]}]; window.__vt.open(); });
 await p.waitForTimeout(1300); await p.click('#ventas [data-vt="pnl"]'); await p.waitForTimeout(300); await p.click('#pnlMod [data-pt="nv"]'); await p.waitForTimeout(300);
 const r=await p.evaluate(()=>({res:(document.querySelector('#pnlMod [data-nvres]')||{}).innerText||'', rows:[...document.querySelectorAll('#pnlMod tr')].map(t=>t.innerText.replace(/\s+/g,' '))}));
 console.log(r.res, '\n', r.rows.join('\n'));
 ok(/🏪 1 siguen en Nissifarma/.test(r.res)&&/❌ 1 no compran en ninguna/.test(r.res),'resumen: 1 se fue a otra sucursal, 1 no compra en ninguna');
 ok(r.rows.some(x=>/Cliente Mudado/.test(x)&&/40 días/.test(x)&&/KM 8/.test(x)&&/hace 5 días · 2 compra\(s\) · ₲ 90\.000/.test(x)),'el mudado: no viene hace 40 días acá, pero compra en KM 8 (hace 5 días, 2 compras, ₲ 90.000)');
 ok(r.rows.some(x=>/Cliente Perdido/.test(x)&&/en ninguna sucursal/.test(x)),'el perdido: no compra en ninguna sucursal');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
