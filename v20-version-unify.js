/* Curso IA — unificación visual de versión y corrección de autofill iOS */
(()=>{
'use strict';
const APP_VERSION='20.0-review.4';
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

function unifyVersion(){
  document.querySelectorAll('.shell-brand .pill').forEach(el=>el.textContent=SHORT_VERSION);
  const loginBadge=document.getElementById('loginHotfixVersion');
  if(loginBadge)loginBadge.textContent=APP_VERSION;
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length)return;
    const t=(el.textContent||'').trim();
    if(/^v19(?:\.\d+)*(?:\.\d+)?$/i.test(t))el.textContent=SHORT_VERSION;
    if(/^v19\.5\.3$/i.test(t))el.textContent=APP_VERSION;
  });
}

function init(){
  applyAutofillFix();
  unifyVersion();
  const obs=new MutationObserver(()=>{applyAutofillFix();unifyVersion();});
  obs.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:false});
  window.addEventListener('pageshow',unifyVersion,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')unifyVersion();});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
