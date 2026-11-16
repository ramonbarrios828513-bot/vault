// v1221 · 📦 Artículos y stock: importar de Vital (presentaciones, stock y ventas en UNIDADES), pasar a cajas, giro = SUMA, cuánto comprar para N días; ficha; queda guardado al recargar
const setup=require('./rvlib.js');
let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
const cat='Codigo;Codigo de barras;Descripcion;Presentacion;Laboratorio;Marca;Proveedor;Principio activo;Concentracion\n100;7840001;QUITADOR FORTE;Caja x 20 comp.;Lab A;;Prov Uno;Paracetamol;500 mg\n200;7840002;IBUPROFENO 600;Caja x 10 comp.;Lasca;;Prov Dos;Ibuprofeno;600 mg\n300;7840003;TALCO BABY;Frasco 200 g;;Johnson;Prov Tres;;\n';
const stk='Codigo;Descripcion;Stock\n100;QUITADOR FORTE;500\n200;IBUPROFENO 600;1000\n300;TALCO BABY;12\n';
const ven='Codigo;Descripcion;Cantidad vendida\n100;QUITADOR FORTE;30000\n200;IBUPROFENO 600;15000\n300;TALCO BABY;30\n400;PRODUCTO NUEVO;90\n';
(async()=>{ const {b,p,errs}=await setup({vp:{width:1300,height:900}});
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(1200);
 const imp=async(t,txt,name)=>{ await p.click('#articulos [data-ar="tab"][data-v="imp"]'); await p.waitForTimeout(300); await p.setInputFiles(`#articulos input[data-arimp="${t}"]`,{name,mimeType:'text/csv',buffer:Buffer.from(txt)}); await p.waitForTimeout(1500); };
 await imp('cat',cat,'catalogo.csv');
 const m=await p.evaluate(()=>window.__ar.st().ui.imp && window.__ar.st().ui.imp.map); console.log('map',JSON.stringify(m));
 ok(m && m.cv===0 && m.bar===1 && m.n===2 && m.pc===3 && m.lab===4 && m.marca===5 && m.prov===6 && m.pa===7,'reconoce solo las columnas del catálogo');
 await p.click('#articulos [data-ar="imp1"]'); await p.waitForTimeout(200); await p.click('#articulos [data-ar="impok"]'); await p.waitForTimeout(1200);
 let A=await p.evaluate(()=>Object.values(window.__ar.st().items)); ok(A.length===3,'3 artículos creados');
 const q=A.find(x=>x.cv==='100'); ok(q && q.u===20 && q.uo==='pres','Quitador: 20 unidades por caja sacadas de «Caja x 20 comp.»');
 ok(A.find(x=>x.cv==='300' && !x.u),'Talco sin conversión queda marcado');
 await imp('stk',stk,'stock.csv'); await p.click('#articulos [data-ar="imp1"]'); await p.waitForTimeout(200); await p.click('#articulos [data-ar="impok"]'); await p.waitForTimeout(1000);
 await imp('ven',ven,'ventas.csv'); await p.fill('#articulos [data-ardias]','90'); await p.dispatchEvent('#articulos [data-ardias]','change'); await p.click('#articulos [data-ar="imp1"]'); await p.waitForTimeout(200); await p.click('#articulos [data-ar="impok"]'); await p.waitForTimeout(1200);
 const c=await p.evaluate(()=>{ const S=window.__ar.st(), q=Object.values(S.items).find(x=>x.cv==='100'); return window.__ar.calc(q,90); }); console.log(JSON.stringify(c));
 ok(c.sC===25 && c.vC===1500 && Math.round(c.mC)===500,'Quitador: stock 500 u = 25 cajas · vendió 30.000 u = 1.500 cajas en 90 días · giro 500 cajas/mes');
 ok(c.nC===1475 && c.nU===29500,'para 90 días: comprar 1.475 cajas (29.500 unidades)');
 const c60=await p.evaluate(()=>{ const S=window.__ar.st(), q=Object.values(S.items).find(x=>x.cv==='100'); return window.__ar.calc(q,60); }); ok(c60.nC===975,'para 60 días: 975 cajas');
 A=await p.evaluate(()=>Object.values(window.__ar.st().items)); ok(A.length===4 && A.some(x=>x.cv==='400'),'producto que aparece solo en ventas se crea (sin conversión)');
 const giro=await p.evaluate(()=>document.querySelector('#articulos').innerText); ok(/COMPRAR 90 d/i.test(giro) && /1[.,]475/.test(giro),'pantalla de giro muestra 1.475 cajas');
 if(process.env.SHOT){ await p.screenshot({path:'/tmp/claude-0/ar_giro.png'}); }
 // ficha: completar conversión del talco
 await p.click('#articulos [data-ar="tab"][data-v="lista"]'); await p.waitForTimeout(300);
 await p.fill('#arQ','talco'); await p.waitForTimeout(500); await p.click('#articulos [data-ar="ed"]'); await p.waitForTimeout(300);
 await p.fill('#articulos [data-arf="u"]','1'); await p.click('#articulos [data-ar="fsave"]'); await p.waitForTimeout(800);
 ok(await p.evaluate(()=>Object.values(window.__ar.st().items).find(x=>x.cv==='300').u===1),'ficha guarda la conversión del talco');
 // buscador por código de barras
 await p.fill('#arQ','7840002'); await p.waitForTimeout(500); const rows=await p.evaluate(()=>document.querySelectorAll('#articulos .ar-t tr').length-1); ok(rows===1,'buscador por código de barras encuentra 1');
 // reabrir (recargar): queda guardado en el aparato
 await p.reload(); await p.waitForTimeout(1500); await p.click('#heroPass'); await p.keyboard.type('1234'); try{ await p.click('text=Entrar',{timeout:2000}); }catch(e){ await p.keyboard.press('Enter'); } await p.waitForTimeout(2500);
 await p.evaluate(()=>window.__ar.open()); await p.waitForTimeout(1500);
 const n2=await p.evaluate(()=>Object.keys(window.__ar.st().items).length+'|'+(window.__ar.st().ven&&window.__ar.st().ven.dias)); ok(n2==='4|90','después de recargar siguen los 4 artículos y las ventas de 90 días');
 if(process.env.SHOT){ await p.click('#articulos [data-ar="tab"][data-v="imp"]'); await p.waitForTimeout(300); await p.screenshot({path:'/tmp/claude-0/ar_imp.png'}); }
 ok(!errs.length,'sin errores: '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
