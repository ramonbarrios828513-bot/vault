// v1287 · descuento por presentación: caja completo, tira ½ (menor), fracción sin descuento; PVP de cada presentación editable y más caro que el proporcional sin bloqueo ni aviso
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>{ window.__fichas.open(); }); await p.waitForTimeout(300); await p.click('#fichasMod [data-an]'); await p.waitForTimeout(300);
 const set=async(k,v)=>p.evaluate(([k,v])=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); const i=ov.querySelector('[data-ar="'+k+'"]'); i.value=v; i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); },[k,v]);
 await set('n','Kitadol T526 400 cj x20FR'); await set('pa','Ibuprofeno 400 mg'); await set('u','20');
 await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); const c=ov.querySelector('[data-frac]'); c.checked=true; c.dispatchEvent(new Event('change',{bubbles:true})); }); await p.waitForTimeout(200);
 const dq=await p.evaluate(()=>{ const ov=[...document.querySelectorAll('.vt-ov')].pop(); return ['qC','qT','qF'].map(k=>ov.querySelector('[data-ar="'+k+'"]').value); }); ok(dq.join()==='100,50,0','por defecto: caja completo, tira ½, fracción sin descuento '+dq);
 await set('tb','10'); await set('pCaja','20.000'); await set('cCaja','7.000'); await set('pFr','1.500'); await set('bt','7790000005261'); await set('bf','7790000005262'); await set('bar0','7790000005260'); await p.waitForTimeout(150);
 const chk=await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().querySelector('.vt-chk').textContent); ok(/Ficha coherente/.test(chk),'fracción más cara (₲ 1.500 > ₲ 1.000) no da aviso ni bloquea');
 await p.evaluate(()=>[...document.querySelectorAll('.vt-ov')].pop().querySelector('[data-ok]').click()); await p.waitForTimeout(300);
 const nOv=await p.evaluate(()=>document.querySelectorAll('.vt-ov').length); ok(nOv===1,'se guardó (sin bloqueo)');
 await p.evaluate(()=>{ document.querySelectorAll('.vt-ov').forEach(o=>o.remove()); window.__vt.open(); const V=window.__vt.st(); V.open=true; const id=Object.keys(V.arts).find(k=>V.arts[k].n==='Kitadol T526 400 cj x20FR'); V.stk[id]=200; const t=V.tabs[0]; V.cur=t.id; t.lines=[]; t.cat='cd'; t.fp='ef'; window.__vt.open(); });
 for(const bar of ['7790000005260','7790000005261','7790000005262']){ await p.fill('#vtQ',bar); await p.keyboard.press('Enter'); await p.waitForTimeout(300); }
 const L=await p.evaluate(()=>{ const V=window.__vt.st(), t=V.tabs.find(x=>x.id===V.cur); return [...document.querySelectorAll('#ventas tr')].filter(r=>r.querySelector('.vt-pt')).map(r=>r.textContent.replace(/\s+/g,' ')); });
 const pc=L.map(x=>{ const m=x.match(/(\d+(?:,\d+)?)%/g); return m?m[m.length-1]:''; });
 ok(L.length===3,'3 renglones: '+L.length);
 const cj=L.find(x=>/CAJA/.test(x)), tb=L.find(x=>/TIRA/.test(x)), fr=L.find(x=>/FRACCIÓN/.test(x));
 ok(fr&&/sin descuento/.test(fr)&&/1\.500/.test(fr),'fracción: PVP ₲ 1.500, sin descuento');
 ok(tb&&/50% del descuento/.test(tb),'tira: ½ del descuento');
 ok(cj&&!/del descuento/.test(cj),'caja: descuento completo');
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
