/* Curso IA — puntuación global de exámenes normales */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
function examItems(chapter){
  try{
    const p=courseContent?.[chapter]?.practice||{};
    return (Array.isArray(p.sections)?p.sections:[]).flatMap(s=>Array.isArray(s.exercises)?s.exercises:[]).filter(q=>q?.type==='choice'&&Array.isArray(q.options)&&q.options.length);
  }catch(e){return [];}
}
function scoreState(){
  try{
    const ch=Number(current)||0,items=examItems(ch),checks=state?.checks?.[ch]||{};
    if(!items.length)return null;
    let done=0,correct=0;
    items.forEach((q,i)=>{const id=String(q.id||`${i+1}`),r=checks[id];if(r){done++;if(r.correct===true)correct++;}});
    return {chapter:ch,total:items.length,done,correct,pct:done?Math.round(correct*100/done):0,finalPct:items.length?Math.round(correct*100/items.length):0};
  }catch(e){return null;}
}
function paint(){
  const counter=$('genericPracticeCounter'),s=scoreState();if(!counter||!s||!s.done)return;
  let box=$('v20NormalExamScore');
  if(!box){box=document.createElement('div');box.id='v20NormalExamScore';box.style.cssText='margin-top:10px;padding:11px 12px;border-radius:10px;background:#eaf4ff;border:1px solid #b8d8f5;color:#123b66;font-weight:800;';counter.insertAdjacentElement('afterend',box);}
  if(s.done<s.total){box.textContent=`Puntuación provisional: ${s.correct}/${s.done} correctas · ${s.pct}% · Faltan ${s.total-s.done} preguntas por comprobar.`;}
  else{box.textContent=`Puntuación final: ${s.correct}/${s.total} · ${s.finalPct}% · ${s.finalPct>=60?'Examen superado':'Examen no superado'}.`;}
}
function schedulePaint(){setTimeout(paint,80);setTimeout(paint,300);}
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-gen-check],#genericPracticeDone'))schedulePaint();},true);
const obs=new MutationObserver(()=>{if($('genericPracticeCounter'))schedulePaint();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{obs.observe(document.body,{subtree:true,childList:true});schedulePaint();},{once:true});else{obs.observe(document.body,{subtree:true,childList:true});schedulePaint();}
})();
