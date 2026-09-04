/* Curso IA — modo de revisión de contenido v20.1
   - Español temporal sin borrar traducciones
   - Revisión libre para administradores sin alterar progreso
   - Corrección independiente de tests para revisión editorial
   - No intercepta el CRUD normal de notas
*/
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
let reviewChapter=1;

function adminNow(){try{return !!(isAdmin||accessProfile?.role==='admin');}catch(e){return false;}}
function ready(){try{return !!(document.body&&typeof courseContent!=='undefined'&&courseContent&&Object.keys(courseContent).length);}catch(e){return false;}}

function forceSpanish(){
  try{currentLanguage='es';pendingLoginLanguage='es';localStorage.setItem('curso_ia_language','es');}catch(e){}
  document.documentElement.lang='es';
  if(!$('v20SpanishOnlyStyle')){
    const st=document.createElement('style');st.id='v20SpanishOnlyStyle';st.textContent=`
      .login-language,#profileLanguageFieldWrap,[data-profile-edit="language"],#adminLanguage,#editUserLanguage,#setupLanguage{display:none!important}
      .v20-review-open{overflow:hidden!important}
      #v20ReviewWorkspace{position:fixed;z-index:120;inset:0;background:#eef4fb;overflow:auto;padding-bottom:max(32px,env(safe-area-inset-bottom))}
      #v20ReviewWorkspace .v20-head{position:sticky;top:0;z-index:4;background:rgba(255,255,255,.97);border-bottom:1px solid #d5e1ee;padding:max(10px,env(safe-area-inset-top)) 14px 10px}
      #v20ReviewWorkspace .v20-head-inner{max-width:1080px;margin:auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
      #v20ReviewWorkspace .v20-title{font-weight:800;color:#0a2b57;flex:1;min-width:220px}
      #v20ReviewWorkspace .v20-body{max-width:980px;margin:auto;padding:20px 14px 105px}
      #v20ReviewWorkspace .v20-review-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
      #v20ReviewWorkspace .v20-review-tab.active{background:#1e6fc5;color:white;border-color:#1e6fc5}
      #v20ReviewWorkspace .v20-panel{display:none} #v20ReviewWorkspace .v20-panel.active{display:block}
      #v20ReviewWorkspace .v20-exam-q{border:1px solid #d5e1ee;border-radius:14px;background:white;padding:14px;margin:12px 0}
      #v20ReviewWorkspace .v20-option{display:flex;gap:9px;align-items:flex-start;border:1px solid #d9e3ed;border-radius:10px;padding:10px;margin:7px 0;background:#fbfdff}
      #v20ReviewWorkspace .v20-option input{margin-top:3px}
      #v20ReviewWorkspace .v20-explanation{margin-top:9px;padding:9px 11px;border-radius:9px;background:#eef6ff;display:none}
      #v20ReviewWorkspace .v20-explanation.show{display:block}
      #v20ReviewWorkspace .v20-score{font-size:1.05rem;font-weight:800;margin:12px 0;padding:12px;border-radius:10px;background:#eaf4ff}
      #v20ReviewWorkspace .v20-practice-card{border:1px solid #d5e1ee;border-radius:14px;background:#fff;padding:14px;margin:12px 0}
      #v20ReviewBtn{white-space:nowrap}
    `;document.head.appendChild(st);
  }
  ['loginLanguageSelect','profileEditLanguage','adminLanguage','editUserLanguage','setupLanguage'].forEach(id=>{const n=$(id);if(n)n.value='es';});
}

function patchUnlock(){
  if(!adminNow())return;
  try{
    if(typeof isChapterUnlocked==='function'&&!isChapterUnlocked.__v20review){
      const original=isChapterUnlocked;
      const wrapped=function(n){return adminNow()?true:original(n);};
      wrapped.__v20review=true;wrapped.__original=original;isChapterUnlocked=wrapped;
    }
  }catch(e){}
}

function ensureReviewButton(){
  if(!adminNow()||$('v20ReviewBtn'))return;
  const host=document.querySelector('.shell-actions')||document.querySelector('.shell-header-inner')||document.body;
  const b=document.createElement('button');b.id='v20ReviewBtn';b.type='button';b.className='icon-btn';b.textContent='Revisión del curso';b.addEventListener('click',openReview);host.appendChild(b);
}

function ensureWorkspace(){
  if($('v20ReviewWorkspace'))return;
  const w=document.createElement('section');w.id='v20ReviewWorkspace';w.className='hidden';
  w.innerHTML=`<div class="v20-head"><div class="v20-head-inner"><button id="v20ReviewClose" class="icon-btn" type="button">← Volver</button><div class="v20-title">Modo de revisión · no modifica el progreso</div><select id="v20ReviewChapter" aria-label="Capítulo"></select></div></div><div class="v20-body"><div class="v20-review-tabs"><button class="btn v20-review-tab active" data-v20-tab="theory" type="button">Teoría</button><button class="btn v20-review-tab" data-v20-tab="exercises" type="button">Ejercicios</button><button class="btn v20-review-tab" data-v20-tab="exam" type="button">Examen</button></div><div id="v20ReviewTheory" class="v20-panel active"></div><div id="v20ReviewExercises" class="v20-panel"></div><div id="v20ReviewExam" class="v20-panel"></div></div>`;
  document.body.appendChild(w);
  $('v20ReviewClose').addEventListener('click',closeReview);
  $('v20ReviewChapter').addEventListener('change',e=>{reviewChapter=Number(e.target.value)||1;renderReview();});
  w.querySelectorAll('[data-v20-tab]').forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.v20Tab,b)));
}
function activateTab(name,button=null){
  const w=$('v20ReviewWorkspace');if(!w)return;
  w.querySelectorAll('.v20-review-tab').forEach(x=>x.classList.toggle('active',button?x===button:x.dataset.v20Tab===name));
  w.querySelectorAll('.v20-panel').forEach(x=>x.classList.remove('active'));
  const id={theory:'v20ReviewTheory',exercises:'v20ReviewExercises',exam:'v20ReviewExam'}[name];if(id)$(id)?.classList.add('active');
}
function populateChapters(){
  const s=$('v20ReviewChapter');if(!s)return;const nums=Object.keys(courseContent||{}).map(Number).filter(n=>n>=1).sort((a,b)=>a-b);
  s.innerHTML=nums.map(n=>`<option value="${n}">${n}. ${esc(courseContent[n]?.title||'Capítulo '+n)}</option>`).join('');if(!nums.includes(reviewChapter))reviewChapter=nums[0]||1;s.value=String(reviewChapter);
}
function renderTheory(){
  const c=courseContent?.[reviewChapter],box=$('v20ReviewTheory');if(!box)return;if(!c){box.innerHTML='<div class="card">Contenido no disponible.</div>';return;}
  box.innerHTML=`<div class="card"><div class="muted">Capítulo ${reviewChapter} · versión ${esc(c.version||'—')} · revisión editorial</div><h1>${esc(c.title||'')}</h1><p><strong>Objetivo:</strong> ${esc(c.objective||'')}</p></div><div class="card lesson-content">${c.content_html||'<p>Sin teoría.</p>'}</div>`;
}
function renderExercises(){
  const c=courseContent?.[reviewChapter],box=$('v20ReviewExercises');if(!box)return;const data=c?.exercises||{},items=Array.isArray(data.items)?data.items:[];
  let html=`<div class="card"><h2>${esc(data.title||'Ejercicios')}</h2><p>${esc(data.instructions||'')}</p><div class="notice"><strong>Modo revisión:</strong> estas actividades no se guardan como completadas.</div></div>`;
  html+=items.length?items.map((x,i)=>`<article class="v20-practice-card"><h3>${i+1}. ${esc(x.title||'Actividad')}</h3><p>${esc(x.task||'')}</p>${Array.isArray(x.expected)&&x.expected.length?`<h4>Resultado esperado</h4><ul>${x.expected.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:''}${Array.isArray(x.observe)&&x.observe.length?`<h4>Qué observar</h4><ul>${x.observe.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:''}${x.correction?`<details><summary>Corrección razonada</summary><p>${esc(x.correction)}</p></details>`:''}</article>`).join(''):'<div class="card">No hay ejercicios definidos en este capítulo.</div>';
  box.innerHTML=html;
}
function optionText(o){return typeof o==='string'?o:(o?.label??o?.text??String(o?.value??''));}
function optionValue(o,i){return typeof o==='object'&&o?.value!=null?String(o.value):String.fromCharCode(65+i);}
function examItems(){const p=courseContent?.[reviewChapter]?.practice||{},sections=Array.isArray(p.sections)?p.sections:[];return sections.flatMap(s=>Array.isArray(s.exercises)?s.exercises:[]);}
function renderExam(){
  const box=$('v20ReviewExam');if(!box)return;const p=courseContent?.[reviewChapter]?.practice||{},items=examItems();let html=`<div class="card"><h2>${esc(p.title||'Examen')}</h2><p>${esc(p.instructions||'')}</p><div class="notice"><strong>Modo revisión:</strong> corregir aquí no altera intentos ni progreso.</div></div>`;
  if(!items.length){box.innerHTML=html+'<div class="card">No hay examen definido.</div>';return;}
  html+=`<form id="v20ReviewExamForm">`+items.map((q,qi)=>{const opts=Array.isArray(q.options)?q.options:[];if(q.type!=='choice'||!opts.length)return `<section class="v20-exam-q"><h3>${qi+1}. ${esc(q.question||'')}</h3><p class="muted">Pregunta abierta.</p>${q.reference_answer?`<details><summary>Respuesta de referencia</summary><p>${esc(q.reference_answer)}</p></details>`:''}</section>`;return `<section class="v20-exam-q"><h3>${qi+1}. ${esc(q.question||'')}</h3>${opts.map((o,oi)=>`<label class="v20-option"><input type="radio" name="v20q${qi}" value="${esc(optionValue(o,oi))}"><span>${esc(optionText(o))}</span></label>`).join('')}<div class="v20-explanation" id="v20exp${qi}"></div></section>`;}).join('')+`<div class="btnrow"><button id="v20CorrectExam" class="btn primary" type="button">Corregir examen</button><button id="v20ResetExam" class="btn" type="button">Reiniciar</button></div><div id="v20ExamScore"></div></form>`;
  box.innerHTML=html;$('v20CorrectExam')?.addEventListener('click',correctExam);$('v20ResetExam')?.addEventListener('click',renderExam);
}
function correctExam(){
  const items=examItems();let correct=0,total=0,answered=0;items.forEach((q,qi)=>{if(q.type!=='choice'||!Array.isArray(q.options)||!q.options.length)return;total++;const chosen=document.querySelector(`input[name="v20q${qi}"]:checked`)?.value||'';if(chosen)answered++;const good=String(q.answer||'').trim(),ok=!!chosen&&chosen===good;if(ok)correct++;const exp=$('v20exp'+qi);if(exp){exp.classList.add('show');exp.innerHTML=`<strong>${ok?'Correcta':'Incorrecta'}.</strong> ${esc(q.explanation||'')}${!ok&&good?`<div class="muted">Respuesta correcta: ${esc(good)}</div>`:''}`;}});const pct=total?Math.round(correct*100/total):0;if($('v20ExamScore'))$('v20ExamScore').innerHTML=`<div class="v20-score">Puntuación: ${correct}/${total} · ${pct}% · Respondidas: ${answered}/${total}</div>`;
}
function renderReview(){populateChapters();renderTheory();renderExercises();renderExam();}
function openReview(){if(!adminNow())return;ensureWorkspace();renderReview();$('v20ReviewWorkspace').classList.remove('hidden');document.body.classList.add('v20-review-open');}
function closeReview(){$('v20ReviewWorkspace')?.classList.add('hidden');document.body.classList.remove('v20-review-open');}
function keepReady(){forceSpanish();patchUnlock();ensureWorkspace();ensureReviewButton();}
function init(){keepReady();new MutationObserver(()=>{forceSpanish();patchUnlock();ensureReviewButton();}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});setInterval(()=>{if(ready())keepReady();},1000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
