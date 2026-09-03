/* CURSO IA v20 beta — diagnóstico por nivel sin saltos de capítulos */
(()=>{
'use strict';

const byId=id=>document.getElementById(id);
const LEVEL_KEY_PREFIX='curso_ia_course_level_';
const DIAG_VERSION='v20-levels-1';

const LEVELS={
  1:{name:'Nivel 1 · Inicial',short:'Nivel 1',description:'Desarrollo más detenido de los conceptos iniciales, explicaciones guiadas y ejemplos adicionales.'},
  2:{name:'Nivel 2 · Intermedio',short:'Nivel 2',description:'Profundidad equilibrada en fundamentos, aplicación y contenidos avanzados.'},
  3:{name:'Nivel 3 · Avanzado',short:'Nivel 3',description:'Fundamentos más condensados y mayor profundidad en contenidos complejos, casos y ejercicios avanzados.'}
};

const QUESTIONS=[
  {q:'Una respuesta de IA contiene un dato importante para tomar una decisión. ¿Qué haces?',o:['Lo acepto si la explicación parece coherente.','Lo compruebo en una fuente adecuada antes de decidir.','Le pregunto a la IA si está segura.','Repito la pregunta hasta obtener la misma cifra.'],a:1},
  {q:'Quieres resumir un documento largo sin introducir información ajena. ¿Qué instrucción es mejor?',o:['“Resúmelo bien y sin errores”.','“Resume solo el contenido del documento y separa hechos, dudas y datos no localizados”.','“Haz un resumen completo usando también tus conocimientos”.','“Completa lo que falte para que el resumen quede redondo”.'],a:1},
  {q:'Una tarea se repite cada semana con entradas parecidas. ¿Qué enfoque suele ser más útil?',o:['Escribir un prompt nuevo cada semana.','Diseñar una plantilla y un flujo repetible con controles.','Cambiar de modelo cada semana.','Pedir respuestas más largas.'],a:1},
  {q:'¿Qué da más control al delegar una tarea compleja a una IA?',o:['Objetivo, contexto, restricciones, formato y criterios de comprobación.','Muchos ejemplos aunque no estén relacionados.','Pedir siempre una respuesta exhaustiva.','Dar libertad total para que la IA decida el enfoque.'],a:0},
  {q:'Necesitas información que puede haber cambiado recientemente. ¿Qué haces?',o:['Uso la memoria del modelo.','Solicito información actualizada y reviso las fuentes utilizadas.','Pido una estimación y solo la reviso si parece rara.','Comparo dos respuestas del mismo modelo.'],a:1},
  {q:'Al comparar varias ofertas en PDF, ¿qué flujo es más sólido?',o:['Preguntar directamente cuál es la mejor.','Extraer criterios comparables, detectar datos faltantes y después analizar diferencias.','Resumir cada PDF y elegir el resumen más convincente.','Convertir a texto y asumir que la extracción es completa.'],a:1},
  {q:'Una hoja de cálculo contiene importes y fórmulas. ¿Qué control es especialmente importante?',o:['Verificar totales, unidades, fórmulas y filas excluidas antes de concluir.','Confiar si la IA reconoce los encabezados.','Redondear primero todos los valores.','Ocultar las fórmulas para simplificar el análisis.'],a:0},
  {q:'¿Cuándo es razonable automatizar una tarea con poca supervisión?',o:['Cuando es frecuente, reversible, bien definida y el coste del error es bajo.','Cuando tarda mucho aunque el error tenga consecuencias importantes.','Cuando la IA la hizo bien una vez.','Cuando no hay tiempo para revisar.'],a:0},
  {q:'Una IA va a preparar una comunicación externa con consecuencias relevantes. ¿Qué diseño es más sólido?',o:['Redactar y enviar automáticamente.','Redactar, comprobar y dejar aprobación humana final cuando el impacto lo justifique.','Que la persona redacte todo y la IA solo corrija ortografía.','Que dos modelos voten y el ganador envíe el mensaje.'],a:1},
  {q:'¿Qué diferencia principal hay entre una respuesta aislada y un proceso fiable con IA?',o:['El proceso fiable usa prompts más largos.','El proceso define entradas, pasos, controles, excepciones, responsabilidades y salida esperada.','La respuesta aislada solo sirve para tareas personales.','Un proceso fiable necesita siempre una aplicación programada.'],a:1}
];

let shownQuestions=8;
let answers={};
let phase='questions';
let pendingResult=null;

function scoreToLevel(score){
  if(score<5)return 1;
  if(score<7)return 2;
  return 3;
}

function currentUserId(){
  try{return session?.user?.id||null;}catch{return null;}
}

function setStatus(message){
  const n=byId('diagnosticMsg');
  if(n)n.textContent=message||'';
}

function readVisibleAnswers(){
  for(let i=0;i<shownQuestions;i++){
    const c=document.querySelector(`input[name="v20dq${i}"]:checked`);
    if(c)answers[i]=Number(c.value);
  }
}

function renderQuestions(){
  const host=byId('diagnosticQuestions');
  if(!host)return;
  host.innerHTML=QUESTIONS.slice(0,shownQuestions).map((x,i)=>`<fieldset class="diagnostic-q"><legend>${i+1}. ${x.q}</legend>${x.o.map((v,j)=>`<label class="diagnostic-option"><input type="radio" name="v20dq${i}" value="${j}" ${answers[i]===j?'checked':''}><span>${v}</span></label>`).join('')}</fieldset>`).join('');
  host.querySelectorAll('input[type="radio"]').forEach(input=>input.addEventListener('change',()=>{const m=input.name.match(/v20dq(\d+)/);if(m)answers[Number(m[1])]=Number(input.value);}));
}

function renderLevelChoice(score,recommended){
  const host=byId('diagnosticQuestions');
  if(!host)return;
  host.innerHTML=`<div class="mini" style="margin-bottom:14px"><strong>Resultado: ${score.toFixed(1)} / 10</strong><p style="margin-bottom:0">Nivel recomendado: <strong>${LEVELS[recommended].name}</strong>.</p></div><p>Puedes mantener la recomendación o elegir otro nivel. En todos los casos realizarás <strong>todos los capítulos</strong>; cambia la profundidad y el tipo de apoyo.</p>${[1,2,3].map(level=>`<label class="diagnostic-option" style="align-items:flex-start"><input type="radio" name="v20level" value="${level}" ${level===recommended?'checked':''}><span><strong>${LEVELS[level].name}</strong><br><small>${LEVELS[level].description}</small></span></label>`).join('')}`;
}

function countCorrect(total){
  let correct=0;
  for(let i=0;i<total;i++)if(answers[i]===QUESTIONS[i].a)correct++;
  return correct;
}

function needsRefinement(correct){
  return shownQuestions===8&&(correct===4||correct===5);
}

async function evaluateDiagnostic(){
  readVisibleAnswers();
  for(let i=0;i<shownQuestions;i++){
    if(!Number.isInteger(answers[i])){setStatus(`Falta responder la pregunta ${i+1}.`);return;}
  }
  const correct=countCorrect(shownQuestions);
  if(needsRefinement(correct)){
    shownQuestions=10;
    renderQuestions();
    setStatus('Tus respuestas están cerca de un cambio de nivel. Añadimos 2 preguntas para afinar la recomendación.');
    return;
  }
  const score=(correct/shownQuestions)*10;
  const recommended=scoreToLevel(score);
  pendingResult={score,recommended,correct,total:shownQuestions};
  phase='level';
  renderLevelChoice(score,recommended);
  const button=byId('diagnosticSubmit');
  if(button)button.textContent='Guardar nivel y comenzar';
  setStatus('El nivel recomendado no bloquea nada. Puedes escoger un nivel superior o inferior antes de empezar.');
}

async function persistLevel(){
  const selected=Number(document.querySelector('input[name="v20level"]:checked')?.value||pendingResult?.recommended||2);
  if(!LEVELS[selected]){setStatus('Selecciona un nivel.');return;}
  setStatus('Guardando resultado…');
  try{
    const {data:{session:s}}=await sb.auth.getSession();
    if(!s?.user)throw new Error('No hay una sesión válida.');
    const now=new Date().toISOString();
    const storedAnswers={};
    for(let i=0;i<pendingResult.total;i++)storedAnswers[String(i+1)]=answers[i];
    storedAnswers._diagnostic_version=DIAG_VERSION;
    storedAnswers._recommended_level=pendingResult.recommended;
    storedAnswers._selected_level=selected;
    const {error:diagError}=await sb.from('course_diagnostic_results').upsert({user_id:s.user.id,score:Number(pendingResult.score.toFixed(2)),max_score:10,recommended_chapter:1,answers:storedAnswers,completed_at:now,updated_at:now});
    if(diagError)throw diagError;

    const {data:progress,error:readError}=await sb.from('course_progress_v2').select('data').eq('user_id',s.user.id).maybeSingle();
    if(readError)throw readError;
    const data=progress?.data&&typeof progress.data==='object'?progress.data:{};
    data.courseLevel=selected;
    data.diagnosticScore=Number(pendingResult.score.toFixed(2));
    data.diagnosticVersion=DIAG_VERSION;
    data.diagnosticCompletedAt=now;
    data.updatedAt=now;
    const {error:progressError}=await sb.from('course_progress_v2').upsert({user_id:s.user.id,data,updated_at:now});
    if(progressError)throw progressError;

    try{localStorage.setItem(LEVEL_KEY_PREFIX+s.user.id,String(selected));}catch{}
    try{await sb.auth.updateUser({data:{...(s.user.user_metadata||{}),course_level:selected,diagnostic_score:Number(pendingResult.score.toFixed(2))}});}catch{}

    const dialog=byId('diagnosticDialog');
    if(dialog?.open)dialog.close();
    alert(`Resultado: ${pendingResult.score.toFixed(1)}/10. Nivel recomendado: ${LEVELS[pendingResult.recommended].short}. Nivel elegido: ${LEVELS[selected].short}. Realizarás todos los capítulos del curso.`);
  }catch(err){setStatus(err?.message||String(err));}
}

function onSubmit(e){
  e?.preventDefault?.();
  e?.stopImmediatePropagation?.();
  if(phase==='questions')evaluateDiagnostic();
  else persistLevel();
}

function patchDialog(){
  const dialog=byId('diagnosticDialog');
  const button=byId('diagnosticSubmit');
  const host=byId('diagnosticQuestions');
  if(!dialog||!button||!host)return false;
  if(dialog.dataset.v20levels==='1')return true;
  dialog.dataset.v20levels='1';
  const title=dialog.querySelector('h2');
  const intro=dialog.querySelector('.dialog-body > p');
  if(title)title.textContent='Test inicial de nivel';
  if(intro)intro.innerHTML='Empieza con 8 preguntas breves y solo añade alguna más si hace falta afinar. El resultado recomienda <strong>Nivel 1, 2 o 3</strong>. No se salta ningún capítulo.';
  shownQuestions=8;
  answers={};
  phase='questions';
  pendingResult=null;
  renderQuestions();
  button.textContent='Evaluar nivel';
  button.onclick=null;
  button.addEventListener('click',onSubmit,true);
  setStatus('Este test sirve únicamente para ajustar la profundidad del curso.');
  return true;
}

function getStoredLevel(){
  const id=currentUserId();
  if(!id)return null;
  const n=Number(localStorage.getItem(LEVEL_KEY_PREFIX+id));
  return LEVELS[n]?n:null;
}

window.CursoIALevel={
  version:DIAG_VERSION,
  levels:LEVELS,
  scoreToLevel,
  get:getStoredLevel
};

function init(){
  if(!patchDialog()){
    const observer=new MutationObserver(()=>{if(patchDialog())observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();