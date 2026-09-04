const CACHE='curso-ia-v20-review-r6';
const SHELL=['./manifest.webmanifest','./icon-192.png','./icon-512.png','./v19-3.css','./v19-3-app.js','./v19-5-admin-hotfix.js','./v19-5-fix.js','./v19-5-login-hotfix.js','./v20-review-mode.js','./v20-exam-score.js','./v20-version-unify.js','./v20-review-ux.js'];

async function enhancedHtmlResponse(response){
  const text=await response.text();
  let html=text;
  if(!html.includes('v19-3.css'))html=html.replace('</head>','<link rel="stylesheet" href="./v19-3.css?v=20.0-review.6">\n</head>');
  if(!html.includes('v19-3-app.js'))html=html.replace('</body>','<script src="./v19-3-app.js?v=20.0-review.6"></script>\n</body>');
  if(!html.includes('v19-5-admin-hotfix.js'))html=html.replace('</body>','<script src="./v19-5-admin-hotfix.js?v=20.0-review.6"></script>\n</body>');
  if(!html.includes('v19-5-fix.js'))html=html.replace('</body>','<script src="./v19-5-fix.js?v=20.0-review.6"></script>\n</body>');
  if(!html.includes('v19-5-login-hotfix.js'))html=html.replace('</body>','<script src="./v19-5-login-hotfix.js?v=20.0-review.6"></script>\n</body>');
  if(!html.includes('v20-review-mode.js'))html=html.replace('</body>','<script src="./v20-review-mode.js?v=20.0-review.6"></script>\n</body>');
  if(!html.includes('v20-exam-score.js'))html=html.replace('</body>','<script src="./v20-exam-score.js?v=20.0-review.6"></script>\n</body>');
  if(!html.includes('v20-version-unify.js'))html=html.replace('</body>','<script src="./v20-version-unify.js?v=20.0-review.6"></script>\n</body>');
  if(!html.includes('v20-review-ux.js'))html=html.replace('</body>','<script src="./v20-review-ux.js?v=20.0-review.6"></script>\n</body>');
  const headers=new Headers(response.headers);
  headers.set('content-type','text/html; charset=utf-8');headers.set('cache-control','no-cache');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(SHELL);try{const resp=await fetch('./index.html',{cache:'no-store'});if(resp.ok){const enhanced=await enhancedHtmlResponse(resp);await cache.put('./index.html',enhanced.clone());await cache.put('./',enhanced.clone());}}catch(e){}await self.skipWaiting();})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients){try{const url=new URL(client.url);url.searchParams.set('appv','20.0-review.6');await client.navigate(url.toString());}catch(e){}}})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;if(event.request.mode==='navigate'){event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const resp=await fetch(event.request,{cache:'no-store'});const ct=resp.headers.get('content-type')||'';const out=ct.includes('text/html')?await enhancedHtmlResponse(resp):resp;if(out.ok){await cache.put('./index.html',out.clone());await cache.put('./',out.clone());}return out;}catch(e){return (await cache.match('./index.html'))||(await cache.match('./'));}})());return;}event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(event.request);if(cached)return cached;try{const resp=await fetch(event.request,{cache:'no-store'});if(resp.ok)cache.put(event.request,resp.clone());return resp;}catch(e){return cached;}})());});
