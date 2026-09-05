/* Curso IA — unificación visual de versión y corrección de autofill iOS */
(()=>{
'use strict';
const APP_VERSION='20.0-review.9';
const SHORT_VERSION='v20.0';
let scheduled=false;

function applyAutofillFix(){
  if(document.getElementById('v20AutofillFixStyle'))return;
  const st=document.createElement('style');
  st.id='v20AutofillFixStyle';
  st.textContent=`
    #loginScreen input:-webkit-autofill,
    #loginScreen input:-webkit-autofill:hover,
    #loginScreen input:-webkit-autofill:focus,
    #loginScreen input:-webkit-autofill:active{
      -webkit-text-fill-color:#fff!important;
      caret-color:#fff!important;
      -webkit-box-shadow:0 0 0 1000px rgba(5,43,82,.96) inset!important;
      box-shadow:0 0 0 1000px rgba(5,43,82,.96) inset!important;
      transition:background-color 9999s ease-out 0s!important;
      border-color:rgba(197,232,255,.72)!important;
    }
    #loginScreen input[autocomplete="username"],
    #loginScreen input[autocomplete="current-password"]{
      background:rgba(5,43,82,.72)!important;
      color:#fff!important;
    }
  `;
  document.head.appendChild(st);
}

function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
function unifyVersion(){
  scheduled=false;
  document.querySelectorAll('.shell-brand .pill').forEach(el=>setText(el,SHORT_VERSION));
  setText(document.getElementById('loginHotfixVersion'),APP_VERSION);
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length)return;
    const t=(el.textContent||'').trim();
    if(/^v19(?:\.\d+)*$/i.test(t))setText(el,SHORT_VERSION);
  });
}
function scheduleUnify(){if(scheduled)return;scheduled=true;requestAnimationFrame(unifyVersion);}
function init(){
  applyAutofillFix();unifyVersion();
  const obs=new MutationObserver(scheduleUnify);obs.observe(document.body,{subtree:true,childList:true,characterData:true});
  window.addEventListener('pageshow',scheduleUnify,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleUnify();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
