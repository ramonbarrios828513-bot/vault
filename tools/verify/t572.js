// v1313 · 🏛️ Ateneo › Clase y debate › «Miradas»: además de profesionales hay «personas y vidas» (mujer, hombre, pobre, rico, político, futbolista, cirujano, científico, debatista…); cada uno dice por qué piensa así y la síntesis pregunta qué moldea cada mirada
const setup=require('./rvlib.js'); let fail=0; const ok=(c,m)=>{ console.log((c?'✔':'✘ FALLA')+' '+m); if(!c) fail++; };
(async()=>{ const {b,p,errs}=await setup({vp:{width:1366,height:800}});
 const reqs=[]; await p.route('https://api.anthropic.com/**', async r=>{ const body=JSON.parse(r.request().postData()||'{}'); const txt=JSON.stringify(body.messages); reqs.push(txt);
  const uno=/se\\u00f1ala a UNA persona|señala a UNA persona/.test(txt); const out=uno?{nombre:'Cirujano',perfil:'Dr. Benítez, 52 años, cirujano en Asunción',respuesta:'En el quirófano se decide rápido. **Pienso así porque** opero todos los días.'}:/moderador de un panel/.test(txt)?{sintesis:'### En qué coinciden\nPrueba.\n### Qué moldea cada mirada\nPrueba.',notas:[{nombre:'Mujer',porcentaje:80,bien:'x',falto:'y',comentario:'z'}],aceptacion:70,mejor:'Mujer'}:{alumnos:[{nombre:'Mujer',perfil:'Ana, 38 años, enfermera en Ciudad del Este',respuesta:'Lo veo así. **Pienso así porque** trabajo de noche.'},{nombre:'Persona pobre',perfil:'Luis, 45, changarín',respuesta:'Yo vivo al día. Pienso así porque no me sobra.'},{nombre:'Científico',perfil:'investigadora',respuesta:'La evidencia dice… Pienso así porque mido.'}]};
  r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({content:[{type:'text',text:JSON.stringify(out)}],stop_reason:'end_turn'})}); });
 await p.evaluate(()=>{ document.querySelectorAll('.big-ov').forEach(x=>x.hidden=true); window.__ivX.setKey('sk-ant-prueba-local'); window.__ateneo.goSala('pizarra'); }); await p.waitForTimeout(1200);
 await p.click('[data-pz="tab:cls"]'); await p.waitForTimeout(500);
 const g=await p.evaluate(()=>({grp:[...document.querySelectorAll('#pzPro .pz-grp')].map(e=>e.textContent.slice(0,40)),chips:[...document.querySelectorAll('#pzPro button')].map(e=>e.textContent.trim()),modo:document.querySelector('#pzMode [data-m="pro"]').textContent}));
 ok(g.grp.length>=2&&/Personas y vidas/.test(g.grp.join('|')),'los que opinan vienen en dos grupos: '+g.grp.join(' | '));
 const need=['Mujer','Hombre','Persona pobre','Persona rica','Político','Futbolista','Cirujano','Científico','Debatista','Abogado'];
 ok(need.every(n=>g.chips.some(c=>c.indexOf(n)>=0)),'están mujer, hombre, pobre, rico, político, futbolista, cirujano, científico, debatista y abogado ('+g.chips.length+' en total)');
 // elegir solo 3: Mujer, Persona pobre, Científico
 await p.evaluate(()=>{ [...document.querySelectorAll('#pzPro button[aria-pressed="true"]')].forEach(b=>b.click()); }); await p.waitForTimeout(200);
 for (const n of ['Mujer','Persona pobre','Científico']) { await p.evaluate((n)=>{ [...document.querySelectorAll('#pzPro button')].find(b=>b.textContent.indexOf(n)>=0).click(); },n); await p.waitForTimeout(120); }
 await p.fill('#pzQ2','¿El dinero cambia a las personas?'); await p.click('[data-pz="abrir"]'); await p.waitForTimeout(2500);
 const pr=reqs[0]||'';
 ok(/Pienso así porque/.test(pr)&&/rutina/.test(pr)&&/sin caricaturas ni estereotipos/.test(pr)&&/UNA persona concreta/.test(pr),'la consigna pide a cada uno decir por qué piensa así, sin estereotipos');
 ok(/una mujer adulta concreta/.test(pr)&&/vive al día/.test(pr)&&/cient[ií]fico investigador/.test(pr)&&!/te[óo]logo evang/.test(pr),'al panel van solo los 3 elegidos');
 const out=await p.evaluate(()=>document.getElementById('pzOut').innerText);
 ok(/Mujer/.test(out)&&/Persona pobre/.test(out)&&/Científico/.test(out)&&/Pienso así porque/.test(out),'se ve la respuesta individual de cada uno');
 await p.evaluate(()=>{ const x=[...document.querySelectorAll('[data-pz="concluir"]')].find(e=>e.offsetParent); x&&x.click(); }); await p.waitForTimeout(2500);
 const pc=reqs.find(x=>/moderador/.test(x))||'';
 ok(/Qué moldea cada mirada/.test(pc)&&/Domados por la cultura o auténticos/.test(pc),'la síntesis pregunta qué moldea cada mirada y si somos domados por la cultura o auténticos');
 // 👉 A DEDO: mesa vacía, señalo al cirujano, después le repregunto

 await p.fill('#pzQ2','¿Vale más la experiencia o el estudio?'); await p.click('[data-pz="dedo0"]'); await p.waitForTimeout(700);
 const d0=await p.evaluate(()=>({card:!!document.querySelector('.pz-dedo'),n:document.querySelectorAll('#pzDedo [data-pzd]').length,resp:document.querySelectorAll('#pzOut .pz-grid .pz-resp').length}));
 ok(d0.card&&d0.n>=25&&d0.resp===0,'«A dedo» abre la mesa vacía con todas las personas para señalar: '+JSON.stringify(d0));
 const n0=reqs.length; await p.evaluate(()=>{ [...document.querySelectorAll('#pzDedo [data-pzd]')].find(b=>/Cirujano/.test(b.textContent)).click(); }); await p.waitForTimeout(2200);
 const rq=reqs[n0]||''; ok(reqs.length===n0+1&&/UNA persona/.test(rq)&&/Cirujano/.test(rq)&&/Vale más la experiencia/.test(rq),'al tocar «Cirujano» se le pregunta solo a él, con la pregunta lanzada');
 const d1=await p.evaluate(()=>({txt:document.getElementById('pzOut').innerText,ok:[...document.querySelectorAll('#pzDedo [data-pzd]')].find(b=>/Cirujano/.test(b.textContent)).textContent}));
 ok(/Dr\. Benítez/.test(d1.txt)&&/quirófano/.test(d1.txt)&&/✓/.test(d1.ok),'se ve la respuesta del cirujano y queda marcado con ✓');
 await p.fill('#pzDedoQ','¿Y si el paciente fuera tu hijo?'); await p.evaluate(()=>{ [...document.querySelectorAll('#pzDedo [data-pzd]')].find(b=>/Cirujano/.test(b.textContent)).click(); }); await p.waitForTimeout(2200);
 const rq2=reqs[reqs.length-1]||''; const d2=await p.evaluate(()=>document.getElementById('pzOut').innerText);
 ok(/REPREGUNTA/.test(rq2)&&/fuera tu hijo/.test(rq2)&&/YA DIJERON OTROS/.test(rq2)&&/Repregunta: ¿Y si el paciente fuera tu hijo\?/.test(d2)&&/Cirujano \(2\)/.test(d2),'la repregunta va a quien toco, sabiendo lo ya dicho, y queda anotada');
 await p.fill('#pzDedoOtro','Taxista'); await p.click('[data-pzd="otro"]'); await p.waitForTimeout(2200);
 ok(/Taxista/.test(reqs[reqs.length-1]||''),'puedo señalar a alguien que no está en la lista (Taxista)');
 ok(errs.length===0,'sin errores'+(errs.length?': '+errs.join(' | '):'')); await b.close(); process.exit(fail?1:0); })();
