/* Curso IA ChatGPT v19.5.2 — hotfix de acceso iOS/PWA */
(()=>{
'use strict';
const $=id=>document.getElementById(id);

function installLoginCss(){
  if($('v1952LoginHotfixStyle'))return;
  const style=document.createElement('style');
  style.id='v1952LoginHotfixStyle';
  style.textContent=`
    #loginScreen{pointer-events:auto!important;}
    #loginScreen::before,#loginScreen::after{pointer-events:none!important;}
    #loginScreen .login-card{position:relative!important;z-index:2147483000!important;pointer-events:auto!important;}
    #loginScreen #loginForm,#loginScreen #loggedOutBox,#loginScreen .login-field{pointer-events:auto!important;}
    #loginScreen .login-field input{
      pointer-events:auto!important;
      touch-action:manipulation!important;
      -webkit-user-select:text!important;
      user-select:text!important;
      position:relative!important;
      z-index:2147483001!important;
    }
    #loginScreen .login-field-icon{pointer-events:none!important;}
    #loginScreen .password-eye{position:relative!important;z-index:2147483002!important;pointer-events:auto!important;}
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

function guardDiagnosticDialog(){
  const d=$('diagnosticDialog');
  if(!d||d.dataset.loginGuard==='1')return;
  d.dataset.loginGuard='1';
  const originalShowModal=typeof d.showModal==='function'?d.showModal.bind(d):null;
  if(originalShowModal){
    d.showModal=function(){
      if(loginIsVisible()){
        try{if(this.open)this.close();}catch(e){this.removeAttribute('open');}
        return;
      }
      return originalShowModal();
    };
  }
}

function clearUnexpectedModalBlockers(){
  if(!loginIsVisible())return;
  guardDiagnosticDialog();
  document.querySelectorAll('dialog[open]').forEach(d=>{
    try{d.close();}catch(e){d.removeAttribute('open');}
  });
}

function restoreCredentialFields(){
  installLoginCss();
  guardDiagnosticDialog();
  const screen=$('loginScreen'),card=screen?.querySelector('.login-card');
  if(screen){screen.removeAttribute('inert');screen.style.pointerEvents='auto';}
  if(card){card.removeAttribute('inert');card.style.pointerEvents='auto';}
  if(!credentialsAreVisible())return;
  clearUnexpectedModalBlockers();
  ['authEmail','authPassword'].forEach(id=>{
    const input=$(id);if(!input)return;
    input.disabled=false;input.readOnly=false;input.removeAttribute('inert');
    input.style.pointerEvents='auto';input.style.webkitUserSelect='text';input.style.userSelect='text';
  });
  ['signInBtn','forgotPasswordBtn','togglePasswordBtn'].forEach(id=>{
    const b=$(id);if(!b)return;b.classList.remove('keyboard-occluded');b.removeAttribute('inert');b.disabled=false;
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
  observer.observe(document.documentElement,{subtree:true,attributes:true,childList:true,attributeFilter:['class','open','inert','disabled','readonly']});
  window.addEventListener('pageshow',restoreCredentialFields,{passive:true});
  window.addEventListener('focus',restoreCredentialFields,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')restoreCredentialFields();});
  setInterval(restoreCredentialFields,250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
