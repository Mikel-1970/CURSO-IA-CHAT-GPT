/* Curso IA ChatGPT v19.5.3 — recuperación de acceso iOS/WebKit */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

function installLoginCss(){
  if($('v1953LoginHotfixStyle'))return;
  $('v1952LoginHotfixStyle')?.remove();
  const style=document.createElement('style');
  style.id='v1953LoginHotfixStyle';
  style.textContent=`
    #loginScreen{pointer-events:auto!important;}
    #loginScreen::before,#loginScreen::after{pointer-events:none!important;}
    #loginScreen .login-card{position:relative!important;z-index:100!important;pointer-events:auto!important;}
    #loginScreen #loginForm,#loginScreen #loggedOutBox,#loginScreen .login-field{pointer-events:auto!important;}
    #loginScreen .login-field{position:relative!important;}
    #loginScreen .login-field-icon{pointer-events:none!important;}
    #loginScreen .login-field input{
      pointer-events:auto!important;touch-action:manipulation!important;-webkit-user-select:text!important;user-select:text!important;
      position:relative!important;z-index:2!important;-webkit-appearance:none!important;appearance:none!important;
    }
    #loginScreen .password-eye{position:relative!important;z-index:3!important;pointer-events:auto!important;}
    #loginHotfixVersion{position:fixed;left:max(8px,env(safe-area-inset-left));bottom:max(8px,env(safe-area-inset-bottom));z-index:999;padding:4px 7px;border-radius:8px;background:rgba(0,24,54,.78);color:#dff6ff;font:600 11px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;pointer-events:none;border:1px solid rgba(120,215,255,.35)}
    html.v1953-ios #loginScreen .login-card{transform:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}
    html.v1953-ios #loginScreen{transform:none!important;}
  `;
  document.head.appendChild(style);
  if(isIOS)document.documentElement.classList.add('v1953-ios');
}

function loginIsVisible(){const s=$('loginScreen');return !!s&&!s.classList.contains('hidden')&&getComputedStyle(s).display!=='none';}
function credentialsAreVisible(){const b=$('loggedOutBox');return loginIsVisible()&&!!b&&!b.classList.contains('hidden')&&getComputedStyle(b).display!=='none';}

function addVersionBadge(){let b=$('loginHotfixVersion');if(!b){b=document.createElement('div');b.id='loginHotfixVersion';document.body.appendChild(b);}b.textContent='v19.5.3';b.style.display=loginIsVisible()?'block':'none';}

function closeLoginBlockers(){
  if(!loginIsVisible())return;
  document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close();}catch(e){d.removeAttribute('open');}});
}

function rebuildInput(id,opts){
  const old=$(id);if(!old||old.dataset.v1953==='1')return old;
  const input=document.createElement('input');
  input.id=id;input.name=opts.name;input.type=opts.type;input.value=old.value||'';input.placeholder=old.placeholder||opts.placeholder;
  input.autocomplete=opts.autocomplete;input.dataset.v1953='1';
  if(opts.inputmode)input.inputMode=opts.inputmode;
  if(opts.autocapitalize)input.setAttribute('autocapitalize',opts.autocapitalize);
  if(opts.spellcheck===false)input.spellcheck=false;
  if(opts.minlength)input.minLength=opts.minlength;
  if(opts.enterkeyhint)input.setAttribute('enterkeyhint',opts.enterkeyhint);
  if(old.hasAttribute('data-i18n-placeholder'))input.setAttribute('data-i18n-placeholder',old.getAttribute('data-i18n-placeholder'));
  old.replaceWith(input);
  return input;
}

function rebuildNativeCredentials(){
  if(!credentialsAreVisible())return;
  rebuildInput('authEmail',{name:'username',type:'email',placeholder:'Usuario',autocomplete:'username',inputmode:'email',autocapitalize:'none',spellcheck:false});
  rebuildInput('authPassword',{name:'password',type:'password',placeholder:'Clave',autocomplete:'current-password',minlength:8,enterkeyhint:'go'});
}

function restore(){
  installLoginCss();addVersionBadge();
  const screen=$('loginScreen'),card=screen?.querySelector('.login-card');
  screen?.removeAttribute('inert');card?.removeAttribute('inert');
  if(!credentialsAreVisible())return;
  closeLoginBlockers();rebuildNativeCredentials();
  ['authEmail','authPassword'].forEach(id=>{const i=$(id);if(!i)return;i.disabled=false;i.readOnly=false;i.removeAttribute('inert');});
  ['signInBtn','forgotPasswordBtn','togglePasswordBtn'].forEach(id=>{const b=$(id);if(!b)return;b.classList.remove('keyboard-occluded');b.removeAttribute('inert');b.disabled=false;});
}

function nativeFocus(e){
  if(!credentialsAreVisible())return;
  const field=e.target.closest?.('.login-field');if(!field||e.target.closest?.('button'))return;
  const input=field.querySelector('input');if(input&&!input.disabled)input.focus();
}

function init(){
  restore();
  document.addEventListener('click',nativeFocus,true);
  window.addEventListener('pageshow',restore,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')restore();});
  setTimeout(restore,500);setTimeout(restore,1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
