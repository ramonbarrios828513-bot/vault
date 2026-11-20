// v1277 · 📦 Ficha de artículo: código padre Nissi + una barra por presentación (caja 20, tableta 10, unidad 1); al vender, cada barra descuenta su cantidad del padre
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__vt.open()); await p.waitForTimeout(700);
 await p.click('#ventas [data-vt="arts"]'); await p.waitForTimeout(200); await p.click('.vt-ov [data-an]'); await p.waitForTimeout(200);
 const S='.ico-ov.vt-ov';
 ok(await p.evaluate(()=>/Código padre/.test([...document.querySelectorAll('.ico-ov.vt-ov')].pop().textContent)),'la ficha muestra el 🔑 código padre (código interno Nissi)');
 await p.fill(S+' [data-ar="n"]','Kitadol Forte QA'); await p.fill(S+' [data-ar="pvp"]','100000'); await p.fill(S+' [data-ar="dprov"]','65');
 await p.fill(S+' [data-ar="u"]','20'); await p.check(S+' [data-frac]'); await p.waitForTimeout(250);
 await p.fill(S+' [data-ar="tb"]','10'); await p.fill(S+' [data-ar="bar0"]','7790000000011'); await p.fill(S+' [data-ar="bt"]','7790000000028'); await p.fill(S+' [data-ar="bf"]','7790000000035'); await p.fill(S+' [data-ar="pFr"]','7000'); await p.fill(S+' [data-ar="dF"]','Kitadol Forte comprimido suelto'); await p.fill(S+' [data-ar="stk0"]','200'); await p.dispatchEvent(S+' [data-ar="stk0"]','input'); await p.waitForTimeout(200);
 const px=await p.evaluate(()=>document.querySelector('.ico-ov.vt-ov .vt-prx').textContent); ok(/caja<\/b> → descuenta 20|caja → descuenta 20/.test(px)&&/tableta → descuenta 10/.test(px)&&/fracción → descuenta 1 FR/.test(px)&&/10 caja/.test(px),'explica qué descuenta cada barra y el stock en cajas: '+px.slice(0,160));
 await p.click(S+' [data-ok]'); await p.waitForTimeout(400);
 const x=await p.evaluate(()=>{ const V=window.__vt.st(); const a=Object.values(V.arts).find(a=>a.n==='Kitadol Forte QA'); return a&&{cod:a.cod,bar:a.bar,pres:(V.pres[a.id]||[]).filter(q=>q.id!=='caja').map(q=>q.t+':'+q.q+':'+q.bar),stk:V.stk[a.id],id:a.id}; });
 ok(x&&/^\d+$/.test(x.cod),'el sistema le puso el código padre '+(x&&x.cod));
 ok(x&&x.bar[0]==='7790000000011'&&x.pres.join()==='tab:10:7790000000028,fr:1:7790000000035','cada presentación con su barra '+JSON.stringify(x&&x.pres));
 await p.evaluate(()=>{ const V=window.__vt.st(); V.open=true; const t=V.tabs[0]; V.cur=t.id; t.lines=[]; window.__vt.open(); });
 for (const [bar,exp] of [['7790000000028',10],['7790000000011',20],['7790000000035',1]]) { await p.fill('#vtQ',bar); await p.keyboard.press('Enter'); await p.waitForTimeout(250); }
 const L=await p.evaluate(()=>window.__vt.st().tabs[0].lines.map(l=>(l.uq||1)*l.q)); ok(JSON.stringify(L.sort((a,b)=>a-b))===JSON.stringify([1,10,20]),'el lector reconoce cada barra: unidad 1, tableta 10, caja 20 '+JSON.stringify(L));
 const pv=await p.evaluate(()=>{ const t=window.__vt.st().tabs[0]; const o={}; t.lines.forEach(l=>{ o[l.uq||1]=[l.pvp,l.cost]; }); return o; }); ok(pv[20][0]===100000&&pv[10][0]===50000&&pv[1][0]===7000&&pv[1][1]===1750,'cada presentación vende con su PVP y costo: caja 100.000, tableta 50.000, unidad 7.000 (más alto, permitido) '+JSON.stringify(pv));
 const tags=await p.evaluate(()=>[...document.querySelectorAll('#ventas .vt-pt')].map(x=>x.textContent.trim())); ok(['📦 CAJA · 20 FR','💊 TABLETA · 10 FR','🔹 FRACCIÓN · 1 FR'].every(x=>tags.includes(x)),'cada renglón de la venta dice qué presentación es '+JSON.stringify(tags));
 const ds=await p.evaluate(()=>window.__vt.st().tabs[0].lines.map(l=>l.n)); ok(ds.includes('Kitadol Forte QA · Caja x20FR')&&ds.includes('Kitadol Forte QA · Tableta x10FR')&&ds.includes('Kitadol Forte comprimido suelto'),'cada barra trae su propia descripción a la venta '+JSON.stringify(ds));
 await p.screenshot({path:'/tmp/claude-0/ventapres.png'});
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
