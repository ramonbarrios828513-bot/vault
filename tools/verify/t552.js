// v1308 · barras: producto sin barra → se le crea la interna; copiar la barra desde el sistema cuando el lector no lee; al cambiar la barra la vieja queda inactiva con fecha y rige la nueva; etiquetas para imprimir
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__noBarVal=false; window.open=()=>null; window.__vt.open(); const V=window.__vt.st(); V.open=true; Object.keys(V.arts).forEach(k=>delete V.arts[k]); V.arts.vs={id:'vs',va:1,n:'Gripasan C comp x10',u:10,bar:[],pvp:5000,costo:2000,cod:'1151',frac:false,neg:'pvp'}; V.stk.vs=50; const t=V.tabs[0]; V.cur=t.id; t.lines=[]; window.__vt.open(); });
 await p.waitForTimeout(1300);
 const nl=()=>p.evaluate(()=>window.__vt.st().tabs[0].lines.map(l=>l.n+' x'+l.q).join(' | '));
 const toast=()=>p.evaluate(()=>document.getElementById('toast').textContent);
 await p.fill('#vtQ','gripasan'); await p.waitForTimeout(400); await p.click('[data-vt="pick"]'); await p.waitForTimeout(300);
 await p.click('[data-ak="yes"]'); await p.waitForTimeout(400);
 const bar=await p.evaluate(()=>window.__vt.st().arts.vs.bar[0]);
 ok(/^2\d{12}$/.test(bar),'producto sin barra: el sistema le crea su barra interna → '+bar);
 const cp=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.vt-ov')].filter(x=>x.querySelector('[data-nb]')).pop(); const c=o&&o.querySelector('[data-nbcp]'); if(c) c.click(); return o?o.querySelector('[data-nb]').value:''; });
 ok(cp===bar&&(await nl())==='','📋 Copiar pone la barra en el casillero (todavía no entra): '+cp);
 await p.evaluate(()=>[...document.querySelectorAll('.vt-ov [data-nbok]')].pop().click()); await p.waitForTimeout(300);
 ok(/Gripasan.* x1/.test(await nl()),'✅ Validar y cargar: entra a la venta → '+await nl());
 // cambiar la barra desde la ficha: la vieja queda inactiva
 await p.evaluate(()=>window.__fichas.open()); await p.waitForTimeout(300); await p.click('#fichasMod [data-ae="vs"]'); await p.waitForTimeout(400);
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.vt-ov')].filter(x=>x.querySelector('[data-ar="bar0"]')).pop(); const i=o.querySelector('[data-ar="bar0"]'); i.value='7840000111116'; i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); o.querySelector('[data-ok]').click(); }); await p.waitForTimeout(500);
 const h=await p.evaluate(()=>{ const x=window.__vt.st().arts.vs; return {bar:x.bar[0], H:(x.barH||[]).map(q=>q.b+'>'+q.nueva+'>'+q.pr+'>'+(q.hasta>0))}; });
 ok(h.bar==='7840000111116'&&h.H.length===1&&h.H[0]===bar+'>7840000111116>caja>true','la barra vieja queda en el historial como inactiva, con fecha: '+JSON.stringify(h));
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); window.__vt.st().tabs[0].lines=[]; window.__vt.open(); }); await p.waitForTimeout(1300);
 await p.fill('#vtQ',bar); await p.press('#vtQ','Enter'); await p.waitForTimeout(300);
 ok((await nl())===''&&/Barra vieja \(inactiva desde/.test(await toast())&&/7840000111116/.test(await toast()),'la barra vieja ya no vende y avisa cuál rige: '+(await toast()).slice(0,120));
 await p.fill('#vtQ','7840000111116'); await p.press('#vtQ','Enter'); await p.waitForTimeout(300);
 ok(/Gripasan.* x1/.test(await nl()),'la barra nueva sí vende');
 // historial visible y etiquetas
 await p.click('#ventas [data-vt="lbar"]'); await p.waitForTimeout(300);
 const bh=await p.evaluate(()=>(document.querySelector('.vt-ov [data-barh]')||{}).innerText||''); ok(bh.includes(bar)&&/Inactiva desde/.test(bh),'▮▯ muestra «Barras anteriores (inactivas)»');
 await p.click('.vt-ov [data-bpr="caja"]'); await p.waitForTimeout(300); await p.fill('.ask-in','6'); await p.click('[data-ak="yes"]'); await p.waitForTimeout(400);
 const lb=await p.evaluate(()=>{ const L=window.__lastLabels||{}; return {bar:L.bar,n:L.n,svg:((L.html||'').match(/<svg/g)||[]).length,rects:((L.html||'').match(/<rect x=/g)||[]).length}; });
 ok(lb.bar==='7840000111116'&&lb.n===6&&lb.svg===6&&lb.rects>100,'🖨️ arma 6 etiquetas con la barra dibujada: '+JSON.stringify(lb));
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
