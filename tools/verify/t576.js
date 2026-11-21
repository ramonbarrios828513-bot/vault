// v1314 · 🤖 un aparato con clave de Claude Y conectado a la nube propia: el 🤖 decía ✓ pero ningún módulo podía preguntar (la conexión quedaba vacía al arrancar). Ahora la conexión se mantiene y, si se pierde, se rearma sola.
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:700}});
 await p.route('https://api.anthropic.com/**', r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({content:[{type:'text',text:'hola desde la prueba'}],stop_reason:'end_turn'})}));
 await p.evaluate(()=>localStorage.setItem('iv-ai-key','sk-ant-prueba-local'));
 await p.addInitScript(()=>{ window.claude=window.claude||{}; window.claude.use=async function(n){ return null; }; window.claude.use.__nube=true; });
 await p.reload(); await p.waitForTimeout(3500);
 const r=await p.evaluate(async()=>{ const o={st:window.__aiState(),chip:(document.getElementById('aiChip')||{}).textContent}; try{ o.ask=(await window.__aiAsk('hola',{})).text; }catch(e){ o.err=JSON.stringify(e); } return o; });
 ok(r.st.mode==='api'&&/✓/.test(r.chip),'con clave y nube propia, el 🤖 de arriba marca ✓');
 ok(r.ask==='hola desde la prueba','y los módulos SÍ pueden preguntarle a Claude: '+(r.ask||r.err));
 // si la conexión se pierde por lo que sea, se rearma sola
 await p.evaluate(()=>{ window.__xpT.ai(null); }); await p.waitForTimeout(3600);
 const r2=await p.evaluate(async()=>{ try{ return (await window.__aiAsk('hola',{})).text; }catch(e){ return 'ERR '+JSON.stringify(e); } });
 ok(r2==='hola desde la prueba','si la conexión queda vacía, se vuelve a armar sola: '+r2);
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
