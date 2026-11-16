// v1233 · producto en 3 filas: la cadena de descuentos muestra el costo parcial de cada paso, cuánto aporta y el acumulado hasta el descuento real
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(800); await p.click('#articulos [data-ar="demo1"]'); await p.waitForTimeout(1500);
 await p.click('#articulos .cp-b.g'); await p.waitForTimeout(300); await p.fill('#plQ','distrimed'); await p.press('#plQ','Enter'); await p.waitForTimeout(1200);
 const id=await p.evaluate(()=>document.querySelector('#articulos .ng-p2').dataset.ngrowid), r=`#articulos [data-ngrowid="${id}"]`;
 ok(await p.evaluate(r=>document.querySelectorAll(r+' .ng-p2a, '+r+' .ng-p2c').length,r)===3,'cada producto usa 3 filas: datos · cadena de descuentos · pago/retorno/totales');
 await p.fill(r+' [data-k="pvp"]','10000'); await p.fill(r+' [data-k="q"]','10');
 for(const [k,v] of [['d1','30'],['d2','10'],['d3','5'],['br','10'],['nc','300']]){ await p.fill(r+` [data-k="${k}"]`,v); await p.waitForTimeout(120); }
 await p.waitForTimeout(300);
 const st=await p.evaluate(r=>['d1','d2','d3','br','nc'].map(k=>document.querySelector(r+` [data-ngcv$="|st:${k}"]`).innerText),r); console.log('   '+st.join('\n   '));
 ok(/PVF 7\.000 · −30% · acum 30%/.test(st[0]),'Desc. 1 → PVF 7.000 · −30 % · acum 30 %');
 ok(/6\.300 · −10% · acum 37%/.test(st[1]),'Desc. 2 → 6.300 · −10 % · acum 37 %');
 ok(/5\.985 · −5% · acum 40/.test(st[2]),'Desc. 3 → 5.985 · −5 % · acum 40,1 %');
 ok(/2\.993 · −50% · acum 70/.test(st[3]),'Bonificación 10 + 10 → 2.993 · −50 % · acum 70 %');
 ok(/2\.693 · −10% · acum 73/.test(st[4]),'NC Gs 300 → 2.693 · −10 % · acum 73 %');
 const dr=await p.evaluate(r=>document.querySelector(r+' [data-ngcv$="|dr"]').innerText,r); ok(/73/.test(dr),'termina en el DESCUENTO REAL conciliado ('+dr+')');
 await p.evaluate(r=>document.querySelector(r).scrollIntoView(),r); await p.screenshot({path:'/tmp/claude-0/p1228/tresfilas.png'});
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
