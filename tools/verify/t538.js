// v1299 · espejo entre aparatos: un alquiler nuevo cargado en el celular y un préstamo editado en la notebook NO se pierden al juntar; gana el último cambio de cada uno; las entidades y operaciones de descuento de cheques se juntan
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:900}});
 const r=await p.evaluate(()=>{ const base=()=>({ chq:[], deu:[{id:'d1',acr:'Fortaleza',cuota:2500000,u:100}], cos:[{id:'f1',tipo:'Alquiler',suc:'KM 7',det:'Rodan',m:4000000,dia:5,u:100}], cfg:{ dscE:[{id:'e1',n:'Financiera A',tasa:'3'}], dsco:[] } });
  const L={ __mt:{tes:2000}, tes:base() }, R={ __mt:{tes:1000}, tes:base() };
  // notebook (L, más nuevo): edita la cuota de Fortaleza
  L.tes.deu[0]=Object.assign({},L.tes.deu[0],{cuota:2600000,u:300});
  // celular (R): agrega un alquiler nuevo, edita Rodan más tarde, carga una entidad y una operación
  R.tes.cos.push({id:'f2',tipo:'Inmobiliaria',suc:'Franco',det:'Atlántica',m:5000000,dia:10,u:200});
  R.tes.cos[0]=Object.assign({},R.tes.cos[0],{m:4200000,u:400});
  R.tes.cfg.dscE.push({id:'e2',n:'Coop B',tasa:'2,5'}); R.tes.cfg.dsco.push({id:'o1',ent:'Coop B',m:1000000});
  const M=window.__memcMerge(L,R); const T=M.tes;
  return { deu:T.deu.map(d=>d.acr+':'+d.cuota), cos:T.cos.map(c=>c.det+':'+c.m), dscE:(T.cfg.dscE||[]).map(e=>e.n), dsco:(T.cfg.dsco||[]).length };
 });
 ok(r.deu.join()==='Fortaleza:2600000','la cuota editada en la notebook queda: '+r.deu);
 ok(r.cos.includes('Atlántica:5000000'),'el alquiler nuevo del celular no se pierde: '+r.cos);
 ok(r.cos.includes('Rodan:4200000'),'en Rodan gana el último cambio (celular): '+r.cos);
 ok(r.dscE.join()==='Financiera A,Coop B'&&r.dsco===1,'entidades y operaciones de descuento se juntan: '+r.dscE+' · '+r.dsco);
 ok(!errs.length,'sin errores '+errs.slice(0,3).join(' | '));
 await b.close(); process.exit(fail?1:0); })();
