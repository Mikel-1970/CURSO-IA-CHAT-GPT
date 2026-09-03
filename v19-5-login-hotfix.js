/* Curso IA ChatGPT v19.5.1 — hotfix de acceso iOS/PWA */
(()=>{
'use strict';
const $=id=>document.getElementById(id);

function installLoginCss(){
  if($('v1951LoginHotfixStyle'))return;
  const style=document.createElement('style');
  style.id='v1951LoginHotfixStyle';
  style.textContent=`
    #loginScreen{pointer-events:auto!important;}
    #loginScreen::before,#loginScreen::after{pointer-events:none!important;}
    #loginScreen .login-card{position:relative!important;z-index:100!important;pointer-events:auto!important;}
    #loginScreen #loginForm,#loginScreen #loggedOutBox,#loginScreen .login-field{pointer-events:auto!important;}
    #loginScreen .login-field input{
      pointer-events:auto!important;
      touch-action:manipulation!important;
      -webkit-user-select:text!important;
      user-select:text!important;
      position:relative!important;
      z-index:2!important;
    }
    #loginScreen .login-field-icon{pointer-events:none!important;}
    #loginScreen .password-eye{position:relative!important;z-index:3!important;pointer-events:auto!important;}
  `;
  document.head.appendChild(style);
}

function loginIsVisible(){
  const screen=$('loginScreen');
  return !!screen&&!screen.classList.contains('hidden')&&getComputedStyle(screen).display!=='none';
}
function credentialsAreVisible(){
  const box=$('loggedOutBox');
  return loginIsVisible()&&!!box&&!box.classList.contains('hidden')&&getComputedStyle(box).display!=='none';
}

function clearUnexpectedModalBlockers(){
  if(!loginIsVisible())return;
  document.querySelectorAll('dialog[open]').forEach(d=>{
    try{d.close();}catch(e){d.removeAttribute('open');}
  });
}

function restoreCredentialFields(){
  installLoginCss();
  const screen=$('loginScreen'),card=screen?.querySelector('.login-card');
  if(screen)screen.removeAttribute('inert');
  if(card)card.removeAttribute('inert');
  if(!credentialsAreVisible())return;
  clearUnexpectedModalBlockers();
  ['authEmail','authPassword'].forEach(id=>{
    const input=$(id);if(!input)return;
    input.disabled=false;input.readOnly=false;input.removeAttribute('inert');
    input.style.pointerEvents='auto';
  });
  ['signInBtn','forgotPasswordBtn','togglePasswordBtn'].forEach(id=>{
    const b=$(id);if(!b)return;b.classList.remove('keyboard-occluded');b.removeAttribute('inert');
  });
}

function focusFieldFromContainer(e){
  if(!credentialsAreVisible())return;
  const field=e.target.closest?.('.login-field');
  if(!field||e.target.closest?.('button'))return;
  const input=field.querySelector('input');
  if(input&&!input.disabled){
    try{input.focus({preventScroll:true});}catch(err){input.focus();}
  }
}

function init(){
  restoreCredentialFields();
  document.addEventListener('pointerdown',focusFieldFromContainer,true);
  document.addEventListener('touchstart',focusFieldFromContainer,{capture:true,passive:true});
  const observer=new MutationObserver(()=>restoreCredentialFields());
  observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','open','inert','disabled','readonly']});
  window.addEventListener('pageshow',restoreCredentialFields,{passive:true});
  window.addEventListener('focus',restoreCredentialFields,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')restoreCredentialFields();});
  setInterval(restoreCredentialFields,800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
