// v1230 · 🏪 varios monitores: cada local carga su columna y no se pisan (unión celda por celda) · modo «este monitor es de…»
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const r=await p.evaluate(()=>{ const base={id:'g1',prov:'X',v:{a:{d1:'30'}},lines:[{id:'a',add:1,q:'0',n:'A'},{id:'b',add:1,q:'3',n:'B'}],upd:100};
  const A=JSON.parse(JSON.stringify(base)), B=JSON.parse(JSON.stringify(base));
  A.lines[0].qs={'KM 7':'10'}; A.lines[0].qst={'KM 7':500}; A.lines[0].q='10'; A.upd=600;
  B.lines[0].qs={'KM 8':'5'}; B.lines[0].qst={'KM 8':550}; B.lines[0].q='5'; B.upd=700; B.v.a.d1='35';
  B.delL={b:650}; B.lines=B.lines.filter(l=>l.id!=='b'); B.lines.push({id:'c',add:690,q:'2',n:'C'});
  const M=window.__ng.merge(A,B), M2=window.__ng.merge(B,A);
  const L=M.lines.find(l=>l.id==='a'); return { qs:L.qs, q:L.q, ids:M.lines.map(l=>l.id).sort().join(), d1:M.v.a.d1, same: JSON.stringify(M.lines.find(l=>l.id==='a').qs)===JSON.stringify(M2.lines.find(l=>l.id==='a').qs) }; });
 console.log('   '+JSON.stringify(r));
 ok(r.qs['KM 7']==='10' && r.qs['KM 8']==='5' && r.q==='15','KM 7 y KM 8 cargaron al mismo tiempo: quedan los dos y el total es 15');
 ok(r.ids==='a,c','el producto borrado no vuelve y el agregado por el otro monitor aparece');
 ok(r.d1==='35' && r.same,'lo demás (descuentos) toma lo más nuevo, sin importar el orden');
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.evaluate(()=>{ const A=window.__ar.st(); A.ven=Object.assign({},A.ven,{dias:90,s:{demo23:{'KM 7':900,'Franco':300,'KM 8':1500}}}); A.stk=Object.assign({},A.stk,{s:{demo23:{'KM 7':600,'Franco':30,'KM 8':90}}}); });
 await p.click('#articulos [data-ar="tab"][data-v="neg"]'); await p.waitForTimeout(300); await p.click('#articulos [data-ng="new"]'); await p.waitForTimeout(300);
 for(const w of ['metf','omep','lora','aspi']){ await p.fill('#articulos [data-ngadd]',w); await p.press('#articulos [data-ngadd]','Enter'); await p.waitForTimeout(350); }
 await p.selectOption('#articulos [data-ngmisuc]','KM 8'); await p.waitForTimeout(500);
 const th=await p.evaluate(()=>[...document.querySelectorAll('#articulos .ng-tab thead th')].map(x=>x.innerText).join('|'));
 ok(/pedir km 8/i.test(th) && !/pedir km 7/i.test(th) && !/franco/i.test(th),'«Este monitor es de KM 8»: solo ve y carga la columna de KM 8');
 ok(await p.evaluate(()=>{ try { return localStorage.getItem('nis-misuc')==='KM 8'; } catch(e){ return true; } }),'el monitor se acuerda de qué sucursal es');
 await p.fill('#articulos .ng-tab tr[data-ngrowid="demo23"] [data-k="qs:KM 8"]','7'); await p.waitForTimeout(300);
 ok(await p.evaluate(()=>{ const A=window.__ar.st(); const n=Object.values(A.negs).find(x=>!x.del&&x.lines.some(l=>l.id==='demo23')); const L=n.lines.find(l=>l.id==='demo23'); return L.qs['KM 8']==='7' && L.qst && L.qst['KM 8']>0; }),'lo que carga el local queda marcado con su hora (para unir sin pisar)');
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
