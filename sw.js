const C='cheltuieli-v3';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','icon-180.png','icon-512.png','manifest.webmanifest'])).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET')return;
 const u=new URL(r.url);
 // doar fișierele aplicației și modulele Firebase; restul (Firestore, Auth) trece direct
 if(u.origin!==location.origin&&u.hostname!=='www.gstatic.com')return;
 // pentru fișierele aplicației ignorăm parametrii din link (?amt=...&m=...), ca să nu umplem memoria cache
 const key=u.origin===location.origin?new Request(u.origin+u.pathname):r;
 e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(key,cp))}return res}).catch(()=>caches.match(key).then(m=>m||caches.match('index.html'))));
});
