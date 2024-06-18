/*
self.addEventListener("install", e=>{
    e.waitUntil(
        caches.open("static").then(cache => {
            return cache.addAll(["./", "./src/style.css", "./icons/192x192.png", "./src/dashboard.js", "./img/ffaed8203f6911eeb55756181a0358a2_upscaled.jpg"]);
        })
    );
});


self.addEventListener("fetch", e =>{
    e.respondWith(
        caches.match(e.request).then(response =>{
            return response || fetch(e.request)
        })
    )
})*/
