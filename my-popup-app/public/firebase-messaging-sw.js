importScripts(
  "https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js"
);

self.addEventListener("push", (event) => {
  console.log("Push event received:", event);
});
