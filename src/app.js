import { getChatHTML, initChatEvents } from './chat.js';
import { characters, getCharacter } from './characters.js';

const appContainer = document.getElementById('app');
const THEME_STORAGE_KEY = 'tony_stark_chat_theme';

const routes = {
  '/home': () => `
    <section class="card">
      <span class="badge">Elige con quién conversar</span>
      <h1>Un chat, tres personalidades</h1>
      <p>
        Puedes cambiar de personaje cuando quieras. Cada uno tiene su propio estilo y conserva
        su conversación en este dispositivo.
      </p>
      <div class="character-gallery">
        ${characters
          .map(
            (character) => `
              <article class="character-card">
                <span class="badge">${character.title}</span>
                <h2>${character.name}</h2>
                <p>${character.description}</p>
                <a href="/chat?character=${character.id}" data-link class="btn-primary">
                  Conversar
                </a>
              </article>
            `
          )
          .join('')}
      </div>
    </section>
  `,
  '/chat': () => {
    const characterId = new URLSearchParams(window.location.search).get('character');
    return getChatHTML(getCharacter(characterId));
  },
  '/about': () => `
    <section class="card">
      <span class="badge">Un proyecto de clase</span>
      <h1>¿De qué se trata?</h1>
      <p>
        Empecé con la idea de crear un chat para conversar con Tony Stark sobre tecnología y los
        Vengadores. Después sumé a JARVIS y al Capitán América para probar distintos estilos.
      </p>
      <p>
        Al hacer el proyecto practiqué cómo organizar una aplicación web, adaptarla a distintos
        tamaños de pantalla y conectarla con Gemini. También agregué el cambio de tema y el guardado
        separado de las conversaciones.
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
    const characterId = new URLSearchParams(window.location.search).get('character');
    initChatEvents(getCharacter(characterId), (id) => navigateTo(`/chat?character=${id}`));
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

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const isDark = theme === 'dark';
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', `Cambiar al tema ${isDark ? 'claro' : 'oscuro'}`);
    themeToggle.setAttribute('aria-pressed', String(isDark));
  }
}

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
setTheme(savedTheme === 'light' ? 'light' : 'dark');

document.getElementById('theme-toggle').addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  setTheme(nextTheme);
});