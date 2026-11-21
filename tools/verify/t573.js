// v1313 · 🖍️ Pizarrón › 🧑‍🏫 Consultar / Mejorar: Claude, un profesor o un profesional lee lo que escribí y la respuesta queda en la MISMA hoja, debajo, en otro bloque, con el nombre de quién fue; mi escrito no se toca
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:650}});
 const reqs=[]; await p.route('https://api.anthropic.com/**', async r=>{ const body=JSON.parse(r.request().postData()||'{}'); const txt=JSON.stringify(body.messages); reqs.push(txt);
  const out=/SU MISMO escrito mejorado/.test(txt)?'La fe sin obras está muerta: lo que creemos se ve en lo que hacemos cada día.\n\nCambié: corregí la ortografía y ordené la idea en una sola frase.':'Desde el quirófano lo veo así: decidir es hacerse cargo. Pienso así porque opero todos los días.';
  r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({content:[{type:'text',text:out}],stop_reason:'end_turn'})}); });
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); window.__ivX.setKey('sk-ant-prueba-local'); window.__ateneo.goSala('pizarra'); }); await p.waitForTimeout(1200);
 await p.evaluate(()=>document.querySelector('[data-pzb-tab]').click()); await p.waitForTimeout(1200);
 await p.evaluate(()=>{ const pg=window.__pzb.pages()[window.__pzb.B.page]; pg.s.length=0; pg.ocr={}; pg.s.push({t:'texto',c:'#FFF176',x:60,y:120,fs:34,txt:'la fe sin hobras esta muerta por que lo que creemos se be en lo que asemos'}); window.__pzb.redraw(); });
 const fit=await p.evaluate(()=>{ const btn=[...document.querySelectorAll('.pzb-tools button')].map(e=>e.getBoundingClientRect()); return {ask:!!document.querySelector('[data-pzb="ask"]'),bottom:Math.round(Math.max.apply(null,btn.map(x=>x.bottom))),ih:innerHeight}; });
 ok(fit.ask&&fit.bottom<=fit.ih,'el botón «🧑‍🏫 Consultar / Mejorar» está entre las herramientas y todo sigue entrando en la pantalla: '+JSON.stringify(fit));
 await p.click('[data-pzb="ask"]'); await p.waitForTimeout(400);
 ok(await p.evaluate(()=>!!document.getElementById('pzbAsk')&&document.querySelectorAll('#pzbAskWho option').length>=25),'se abre el cuadro con qué querés, sobre qué y quién responde (Claude, profesor y los profesionales)');
 await p.click('#pzbAsk [data-ask="go"]'); await p.waitForTimeout(2500);
 const r1=await p.evaluate(()=>{ const pg=window.__pzb.pages()[window.__pzb.B.page]; return {n:pg.s.length,mio:pg.s[0].txt,items:pg.s.slice(1).map(x=>({t:x.txt.slice(0,70),y:Math.round(x.y),ans:x.ans||''})),bloques:window.__pzb.blocks(pg).length,st:document.getElementById('pzbAskSt').textContent}; });
 console.log('  estado: '+r1.st+' · errs: '+errs.join(' / ').slice(0,300)); ok(/SU MISMO escrito mejorado/.test(reqs[0]||'')&&/la fe sin hobras/.test(reqs[0]||''),'a Claude le llega mi escrito tal cual, con el pedido de mejorarlo sin cambiar el sentido');
 ok(r1.n===3&&/hobras/.test(r1.mio),'mi escrito queda intacto y se agregan el título y la respuesta: '+r1.n+' textos');
 ok(/Claude · mejoró tu escrito/.test(r1.items[0].t)&&r1.items[0].ans&&/La fe sin obras está muerta/.test(r1.items[1].t),'el bloque nuevo lleva el título de quién fue («'+r1.items[0].t+'») y debajo la respuesta');
 ok(r1.items[0].y>120+34+70&&r1.bloques===2,'queda DEBAJO de mi escrito, en otro bloque ('+r1.bloques+' bloques, y='+r1.items[0].y+')');
 // ahora que opine un cirujano, sobre lo último que escribí (no sobre la respuesta de Claude)
 await p.evaluate(()=>{ [...document.querySelectorAll('#pzbAsk [data-seg="what"] [data-ak]')].find(x=>x.dataset.ak==='resp').click(); const s=document.getElementById('pzbAskWho'); s.value=[...s.options].find(o=>/Cirujano/.test(o.textContent)).value; });
 await p.click('#pzbAsk [data-ask="go"]'); await p.waitForTimeout(2500);
 const r2=await p.evaluate(()=>{ const pg=window.__pzb.pages()[window.__pzb.B.page]; return {n:pg.s.length,tit:pg.s[3]?pg.s[3].txt:'',y3:pg.s[3]?pg.s[3].y:0,y2:pg.s[2].y,bloques:window.__pzb.blocks(pg).length}; });
 const q2=reqs[reqs.length-1]||'';
 ok(/Sos Cirujano/.test(q2)&&/la fe sin hobras/.test(q2)&&!/Cambié: corregí/.test(q2),'al cirujano le llega MI escrito, no la respuesta anterior');
 ok(r2.n===5&&/Cirujano · responde/.test(r2.tit)&&r2.y3>r2.y2&&r2.bloques===3,'su respuesta queda en un tercer bloque, más abajo, con su nombre: «'+r2.tit+'»');
 await p.evaluate(()=>{ const a=document.getElementById('pzbAsk'); a&&a.remove(); window.__pzb.B.oy=0; window.__pzb.redraw(); document.getElementById('pzBoard').scrollIntoView({block:'start'}); }); await p.waitForTimeout(600); await p.screenshot({path:'/tmp/claude-0/-home-claude/35b1ce44-d35c-5596-924f-bd3f45a2f74d/scratchpad/ask.png'});
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
