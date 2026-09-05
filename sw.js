const CACHE='curso-ia-v20-1-stable-r1';
const VERSION='20.1.0';
const FALLBACK='./index.html';
const STATIC=[
  './v20-bootstrap.js','./v19-3.css','./v19-3-app.js','./v19-5-admin-hotfix.js','./v19-5-fix.js','./v19-5-login-hotfix.js',
  './v20-exam-score.js',
  './manifest.webmanifest','./icon-192.png','./icon-512.png','./login-futurista.png'
];

function injectBootstrap(html){
  if(!html.includes('v20-bootstrap.js')){
    html=html.replace('</body>',`<script src="./v20-bootstrap.js?v=${VERSION}"></script>\n</body>`);
  }
  html=html.replace(/<span class="pill ok">v19\.2<\/span>/g,'<span class="pill ok">v20.1</span>');
  return html;
}

async function networkHtml(request){
  const resp=await fetch(request,{cache:'no-store'});
  const text=await resp.text();
  const headers=new Headers(resp.headers);
  headers.set('content-type','text/html; charset=utf-8');
  headers.set('cache-control','no-store, max-age=0');
  return new Response(injectBootstrap(text),{status:resp.status,statusText:resp.statusText,headers});
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.all(STATIC.map(async url=>{
      try{const r=await fetch(`${url}?v=${VERSION}`,{cache:'no-store'});if(r.ok)await cache.put(`${url}?v=${VERSION}`,r.clone());}catch(e){}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('curso-ia-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const out=await networkHtml(event.request);
        if(out.ok){const cache=await caches.open(CACHE);await cache.put(FALLBACK,out.clone());}
        return out;
      }catch(e){
        const cache=await caches.open(CACHE);
        const cached=await cache.match(FALLBACK);
        if(cached)return cached;
        throw e;
      }
    })());
    return;
  }
  const url=new URL(event.request.url);
  const isLocal=url.origin===self.location.origin;
  if(isLocal){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const cached=await cache.match(event.request);
      if(cached)return cached;
      try{
        const resp=await fetch(event.request,{cache:'no-store'});
        if(resp.ok)await cache.put(event.request,resp.clone());
        return resp;
      }catch(e){
        if(cached)return cached;
        throw e;
      }
    })());
  }
});
