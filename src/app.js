import { getChatHTML, initChatEvents } from './chat.js';

const appContainer = document.getElementById('app');

const routes = {
  '/home': () => `
    <section class="card">
      <span class="badge">Genio • Multimillonario • Filántropo</span>
      <h1>Chatea con Tony Stark</h1>
      <p>
        Entra al taller de Tony Stark. Pon a prueba su ingenio, háblale de tecnología,
        pregúntale sobre los Vengadores o reta su intelecto con física cuántica.
      </p>
      <p>
        <em>"A veces hay que correr antes de aprender a caminar."</em>
      </p>
      <a href="/chat" data-link class="btn-primary">Iniciar Chat con Tony</a>
    </section>
  `,
  '/chat': () => getChatHTML(),
  '/about': () => `
    <section class="card">
      <span class="badge">Sobre el Proyecto</span>
      <h1>Arquitectura SPA & IA</h1>
      <p>
        Esta aplicación utiliza una Single Page Application (SPA) en JavaScript con enrutamiento
        mediante la <strong>History API</strong> y diseño <em>Mobile-First</em>.
      </p>
      <p>
        La conexión con <strong>Google Gemini AI</strong> está blindada mediante una
        <em>Vercel Serverless Function</em> (` + "`api/chats.js`" + `) para mantener segura la API key.
      </p>
      <a href="/home" data-link class="btn-primary">Volver al Inicio</a>
    </section>
  `,
};

export function navigateTo(url) {
  window.history.pushState(null, null, url);
  router();
}

export function router() {
  let path = window.location.pathname;

  if (path === '/' || !routes[path]) {
    path = '/home';
    window.history.replaceState(null, null, '/home');
  }

  appContainer.innerHTML = routes[path]();

  if (path === '/chat') {
    initChatEvents();
  }

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === path);
  });
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-link]');
  if (link) {
    e.preventDefault();
    navigateTo(link.getAttribute('href'));
  }
});

window.addEventListener('popstate', router);
document.addEventListener('DOMContentLoaded', router);