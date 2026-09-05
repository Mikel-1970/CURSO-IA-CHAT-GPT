/* Curso IA — versión visible y autofill iOS, sin observación global del DOM */
(()=>{
'use strict';
const APP_VERSION='20.0-review.10';
const SHORT_VERSION='v20.0';

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
  document.querySelectorAll('.shell-brand .pill').forEach(el=>setText(el,SHORT_VERSION));
  setText(document.getElementById('loginHotfixVersion'),APP_VERSION);
}
function init(){
  applyAutofillFix();
  unifyVersion();
  setTimeout(unifyVersion,250);
  setTimeout(unifyVersion,1200);
  window.addEventListener('pageshow',unifyVersion,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')unifyVersion();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
