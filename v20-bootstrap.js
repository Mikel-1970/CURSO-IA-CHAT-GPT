/* CURSO IA — arranque directo de la revisión 20.0-review.9
   Carga las capas de revisión en orden y evita depender de múltiples inyecciones HTML.
*/
(()=>{
'use strict';
const VERSION='20.0-review.9';
const scripts=[
  './v19-3-app.js',
  './v19-5-admin-hotfix.js',
  './v19-5-fix.js',
  './v19-5-login-hotfix.js',
  './v20-review-mode.js',
  './v20-exam-score.js',
  './v20-version-unify.js',
  './v20-review-ux.js'
];
function addCss(){
  if(document.querySelector('link[data-v20-bootstrap-css]'))return;
  const l=document.createElement('link');
  l.rel='stylesheet';l.href=`./v19-3.css?v=${VERSION}`;l.dataset.v20BootstrapCss='1';
  document.head.appendChild(l);
}
function load(src){
  return new Promise((resolve,reject)=>{
    const base=src.split('/').pop();
    const existing=[...document.scripts].find(s=>(s.src||'').includes(base));
    if(existing){resolve();return;}
    const s=document.createElement('script');
    s.src=`${src}?v=${VERSION}`;s.async=false;s.dataset.v20Bootstrap='1';
    s.onload=resolve;s.onerror=()=>reject(new Error(`No se pudo cargar ${src}`));
    document.body.appendChild(s);
  });
}
async function start(){
  addCss();
  for(const src of scripts){
    try{await load(src);}catch(e){console.error('[CURSO IA bootstrap]',e);}
  }
  document.documentElement.dataset.cursoIaVersion=VERSION;
  window.dispatchEvent(new CustomEvent('cursoia:booted',{detail:{version:VERSION}}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
