// @ts-ignore
import App from './App.svelte';
const target = document.body;
target.innerHTML = "";
var app = new App({ target });

if ('serviceWorker' in window.navigator) {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(console.error);
}

export default app;