// v1259 · ✏️ cuenta: se edita TODO (nombre corto, banco, nombre real, tipo, moneda, últimos 4, titular, empresa); renombrar pasa a todos los cheques/pagos/saldos
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1280,height:900}});
 await p.evaluate(()=>{ const T=window.__tes.st(), c=T.cfg; c.emp={nom:'Nissifarma',ruc:'1234567',dv:'1'}; c.emp2={nom:'KM 11',ruc:'7654321',dv:'5'}; T.sal.push({cta:'Basa-G',f:'2026-11-17',m:33018622}); T.chq.push({id:'zz1',st:'pend',tipo:'cheque',cta:'Basa-G',num:'9',prov:'X',monto:1000,fdeb:'2026-11-20'}); c.ctaEmp={'Basa-G':'1234567-1'}; window.__tes.open(); });
 await p.waitForTimeout(1200); await p.evaluate(()=>document.querySelector('#tesoreria [data-tx2="sal"]').click()); await p.waitForTimeout(600);
 const i=await p.evaluate(()=>[...document.querySelectorAll('#txST tr[data-row]')].findIndex(r=>/Basa-G/.test(r.innerText)));
 await p.evaluate((i)=>document.querySelector('#txST [data-s="ed"][data-i="'+i+'"]').click(),i); await p.waitForTimeout(500);
 const flds=await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); return [...o.querySelectorAll('[data-k]')].map(x=>x.dataset.k).join(); });
 ok(['cod','banco','nom','tipo','mon','n4','tit','emp'].every(k=>flds.split(',').includes(k)),'tiene todos los campos ('+flds+')');
 await p.evaluate(()=>{ const o=[...document.querySelectorAll('.ico-ov')].pop(); const set=(k,v)=>{ o.querySelector('[data-k="'+k+'"]').value=v; }; set('cod','Basa-Gisele'); set('banco','Banco Basa'); set('nom','Cuenta corriente Gisele'); set('tipo','Cuenta corriente'); set('n4','4321'); set('tit','Gisele Simon'); set('emp','KM 11'); [...o.querySelectorAll('button')].find(x=>/Guardar/.test(x.textContent)).click(); }); await p.waitForTimeout(700);
 const r=await p.evaluate(()=>{ const T=window.__tes.st(), c=T.cfg; return { chq:T.chq.find(x=>x.id==='zz1').cta, sal:T.sal.filter(x=>x.cta==='Basa-G').length, sal2:T.sal.filter(x=>x.cta==='Basa-Gisele').length, info:c.ctaInfo['Basa-Gisele'], emp:c.ctaEmp['Basa-Gisele'], old:!!c.ctaEmp['Basa-G'], row:[...document.querySelectorAll('#txST tr[data-row]')].map(r=>r.innerText).join(' | ') }; });
 ok(r.chq==='Basa-Gisele'&&r.sal===0&&r.sal2>=1,'renombrar pasa a cheques y saldos ya cargados');
 ok(r.info&&r.info.tipo==='Cuenta corriente'&&r.info.n4==='4321'&&r.info.tit==='Gisele Simon','guarda tipo, últimos 4 y titular');
 ok(r.emp==='7654321-5'&&!r.old,'cambia la empresa a KM 11');
 ok(/Cuenta corriente Gisele/.test(r.row)&&/•••4321/.test(r.row),'la fila se actualiza');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(fail?1:0); })();
