// v1308 · 🏪 stock en sucursales y pedido urgente desde el monitor de ventas: elige la sucursal con MÁS DÍAS de stock (no más cantidad), transfiere solo, el stock entra y se puede facturar; el ticket dice dónde retirar
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__vt.open(); const V=window.__vt.st(); V.open=true; V.obj=Object.assign(V.obj||{}, {suc:'KM 7 Central'}); Object.keys(V.arts).forEach(k=>delete V.arts[k]); V.arts.vk={id:'vk',va:1,n:'Kitadol Forte caja x20',u:20,bar:['7840199086491'],pvp:20000,costo:7000,cod:'1',frac:false,neg:'pvp'}; V.stk.vk=0; V.sold.vk=0;
   V.sucS={'KM 8':{vk:{s:400,v:40}},'Franco':{vk:{s:900,v:300}},'KM 11':{vk:{s:10,v:1}}}; V.sucs=null; V.transf=[]; const t=V.tabs[0]; V.cur=t.id; t.cat='sd'; t.fp='ef'; t.lines=[{val:true,aid:'vk',pid:'caja',pt:'caja',n:'Kitadol Forte caja x20',q:2,pvp:20000,cost:7000,uq:20}]; window.__vt.open(); });
 await p.waitForTimeout(1300);
 ok(/b91c1c/.test(await p.evaluate(()=>document.querySelector('#ventas [data-vt="lsuc"]').getAttribute('style')||'')),'sin stock acá: el botón 🏪 del renglón se pone rojo');
 await p.click('#ventas [data-vt="lsuc"]'); await p.waitForTimeout(400);
 const r=await p.evaluate(()=>({rows:[...document.querySelectorAll('#sucDlg tr')].map(t=>t.innerText.replace(/\s+/g,' ')+' '+[...t.querySelectorAll('input')].map(i=>i.value).join('/')), need:document.querySelector('#sucDlg [data-sn]').value}));
 console.log(r.rows.join('\n'));
 ok(r.need==='40','hace falta 40 UN (2 cajas x20)');
 ok(/^⭐ KM 8/.test(r.rows[1])&&/10/.test(r.rows[1]),'⭐ sugiere KM 8: 10 días de stock, aunque Franco tiene más cantidad (900 pero 3 días)');
 ok(r.rows.some(x=>/KM 11/.test(x)&&/no alcanza/.test(x)),'KM 11 no alcanza (10 UN)');
 await p.click('#sucDlg [data-str="KM 8"]'); await p.waitForTimeout(500);
 const s=await p.evaluate(()=>{ const V=window.__vt.st(); return {stk:V.stk.vk, km8:V.sucS['KM 8'].vk.s, tr:V.transf.map(q=>q.de+'>'+q.a+':'+q.q+':'+q.modo), line:V.tabs[0].lines[0].tr&&V.tabs[0].lines[0].tr.de, toast:document.getElementById('toast').textContent.slice(0,110), pill:(document.querySelector('#ventas .vt-pill')||{}).innerText||''}; });
 console.log(JSON.stringify(s));
 ok(s.stk===40&&s.km8===360,'transferencia automática: el stock entra acá (40) y baja en KM 8 (360)');
 ok(s.tr.length===1&&s.tr[0]==='KM 8>KM 7 Central:40:ret'&&s.line==='KM 8','queda la orden de transferencia y el renglón marcado 🚨 KM 8');
 // cobrar y ticket
 await p.evaluate(()=>{ window.__noAutoTk=true; window.__vt.st().stock={GS:{50000:5,20000:5,10000:5,5000:5,2000:5,1000:5},BRL:{},USD:{}}; }); await p.click('#ventas [data-vt="cobrar"]'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ const i=document.querySelector('.vt-ov [data-rqn="50000"]'); i.value='1'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(300);
 await p.click('.vt-ov [data-vp="ok"]'); await p.waitForTimeout(400); await p.evaluate(()=>{ const v=document.querySelector('[data-vok]'); if(v) v.click(); }); await p.waitForTimeout(500);
 const sv=await p.evaluate(()=>{ const V=window.__vt.st(); const x=V.sales[V.sales.length-1]; let html=''; const o=window.open; window.open=()=>({document:{open(){},write:h=>{html+=h},close(){}},focus(){},print(){}}); try{ document.querySelector('#ventas [data-vt="tklast"]').click(); }catch(e){} window.open=o; return x&&{tr:x.lines[0].tr&&x.lines[0].tr.de, tk:/RETIRAR EN SUCURSAL KM 8/.test(html)}; });
 ok(sv&&sv.tr==='KM 8'&&sv.tk,'la venta se factura y el ticket dice «RETIRAR EN SUCURSAL KM 8»: '+JSON.stringify(sv));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
