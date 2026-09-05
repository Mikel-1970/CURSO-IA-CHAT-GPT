const CACHE='curso-ia-v20-review-r9';
const VERSION='20.0-review.9';
const FALLBACK='./index.html';

function injectBootstrap(html){
  if(!html.includes('v20-bootstrap.js')){
    html=html.replace('</body>',`<script src="./v20-bootstrap.js?v=${VERSION}"></script>\n</body>`);
  }
  html=html.replace(/<span class="pill ok">v19\.2<\/span>/g,'<span class="pill ok">v20.0</span>');
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
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('curso-ia-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients){
      try{
        const u=new URL(client.url);
        u.searchParams.set('appv',VERSION);
        u.searchParams.set('_sw',Date.now().toString());
        await client.navigate(u.toString());
      }catch(e){}
    }
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const out=await networkHtml(event.request);
        if(out.ok){
          const cache=await caches.open(CACHE);
          await cache.put(FALLBACK,out.clone());
        }
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
  event.respondWith((async()=>{
    try{
      return await fetch(event.request,{cache:'no-store'});
    }catch(e){
      const cache=await caches.open(CACHE);
      const cached=await cache.match(event.request);
      if(cached)return cached;
      throw e;
    }
  })());
});
