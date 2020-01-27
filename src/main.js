import App from './App.svelte';
const target = document.body;
target.innerHTML = "";
var app = new App({ target });

export default app;