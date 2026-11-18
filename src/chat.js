import { formatTimestamp, validateMessage, formatHistoryForGemini, escapeHTML } from './utils.js';
import { characters } from './characters.js';

const LEGACY_STORAGE_KEY = 'tony_stark_chat_history';

function getStorageKey(characterId) {
  return `chat_history_${characterId}`;
}

function getGreeting(character) {
  return {
    role: 'model',
    text: character.greeting,
    time: formatTimestamp(),
  };
}

function loadMessages(character) {
  const storageKey = getStorageKey(character.id);
  let savedHistory = localStorage.getItem(storageKey);

  if (!savedHistory && character.id === 'tony') {
    savedHistory = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (savedHistory) {
      localStorage.setItem(storageKey, savedHistory);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }

  if (!savedHistory) {
    return { messages: [getGreeting(character)], hasSavedHistory: false, error: '' };
  }

  try {
    const parsedHistory = JSON.parse(savedHistory);
    const validHistory =
      Array.isArray(parsedHistory) &&
      parsedHistory.every(
        (message) =>
          message &&
          (message.role === 'user' || message.role === 'model') &&
          typeof message.text === 'string' &&
          typeof message.time === 'string'
      );

    if (!validHistory) {
      throw new Error('El historial guardado tiene un formato inválido.');
    }

    return { messages: parsedHistory, hasSavedHistory: true, error: '' };
  } catch {
    return {
      messages: [getGreeting(character)],
      hasSavedHistory: false,
      error: 'No se pudo leer el historial guardado de este personaje.',
    };
  }
}

export function getChatHTML(character) {
  const options = characters
    .map(
      (item) =>
        `<option value="${item.id}" ${item.id === character.id ? 'selected' : ''}>${item.name}</option>`
    )
    .join('');

  return `
    <section class="chat-wrapper">
      <div class="chat-header">
        <div class="chat-heading">
          <strong>${character.name}</strong>
          <span class="chat-subtitle">${character.title}</span>
          <span id="history-status" class="history-status" aria-live="polite"></span>
        </div>
        <div class="chat-actions">
          <label class="sr-only" for="character-select">Cambiar personaje</label>
          <select id="character-select" class="character-select">${options}</select>
          <button id="clear-chat-btn" class="btn-danger" type="button" title="Borrar historial de ${character.name}">
            Borrar historial
          </button>
        </div>
      </div>

      <div id="error-container" aria-live="polite"></div>
      <div id="chat-messages" class="chat-messages" aria-live="polite"></div>

      <form id="chat-form" class="chat-form">
        <input
          type="text"
          id="chat-input"
          class="chat-input"
          placeholder="Escribe algo para ${character.name}..."
          aria-label="Mensaje para ${character.name}"
          autocomplete="off"
          required
        />
        <button type="submit" id="send-btn" class="btn-primary">Enviar</button>
      </form>
    </section>
  `;
}

export function initChatEvents(character, onCharacterChange) {
  const messagesContainer = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const clearBtn = document.getElementById('clear-chat-btn');
  const characterSelect = document.getElementById('character-select');
  const errorContainer = document.getElementById('error-container');
  const historyStatus = document.getElementById('history-status');
  const loaded = loadMessages(character);
  let messages = loaded.messages;
  let hasSavedHistory = loaded.hasSavedHistory;

  function updateHistoryStatus() {
    historyStatus.textContent = hasSavedHistory
      ? 'Historial guardado en este dispositivo'
      : 'Sin historial guardado';
  }

  function saveHistory() {
    localStorage.setItem(getStorageKey(character.id), JSON.stringify(messages));
    hasSavedHistory = true;
    updateHistoryStatus();
  }

  function renderMessages(isTyping = false) {
    messagesContainer.innerHTML = messages
      .map(
        (message, index) => `
          <div class="message ${message.role}">
            <div>${escapeHTML(message.text).replace(/\n/g, '<br>')}</div>
            <div class="message-meta">
              <span>${escapeHTML(message.time)}</span>
              ${
                message.role === 'model'
                  ? `<button type="button" class="copy-btn" data-index="${index}">Copiar</button>`
                  : ''
              }
            </div>
          </div>
        `
      )
      .join('');

    if (isTyping) {
      messagesContainer.innerHTML += `
        <div class="typing-indicator">${character.name} está escribiendo...</div>
      `;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  messagesContainer.addEventListener('click', async (event) => {
    const copyButton = event.target.closest('.copy-btn');
    if (!copyButton) return;

    const message = messages[Number(copyButton.dataset.index)];
    try {
      await navigator.clipboard.writeText(message.text);
      copyButton.textContent = '¡Copiado!';
      setTimeout(() => (copyButton.textContent = 'Copiar'), 1500);
    } catch {
      errorContainer.innerHTML = '<div class="error-banner">No se pudo copiar. Revisa los permisos del navegador.</div>';
    }
  });

  characterSelect.addEventListener('change', () => {
    onCharacterChange(characterSelect.value);
  });

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem(getStorageKey(character.id));
    messages = [getGreeting(character)];
    hasSavedHistory = false;
    updateHistoryStatus();
    errorContainer.innerHTML = '';
    renderMessages();
  });

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorContainer.innerHTML = '';

    const userText = chatInput.value;
    if (!validateMessage(userText)) return;

    messages.push({
      role: 'user',
      text: userText.trim(),
      time: formatTimestamp(),
    });

    try {
      saveHistory();
    } catch {
      errorContainer.innerHTML = '<div class="error-banner">No se pudo guardar el historial en este dispositivo.</div>';
    }

    chatInput.value = '';
    chatInput.disabled = true;
    sendBtn.disabled = true;
    characterSelect.disabled = true;
    renderMessages(true);

    try {
      const reply = await sendMessageToAPI(messages, character.id);
      messages.push({
        role: 'model',
        text: reply,
        time: formatTimestamp(),
      });
      saveHistory();
    } catch (error) {
      errorContainer.innerHTML = `<div class="error-banner">${escapeHTML(error.message)}</div>`;
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      characterSelect.disabled = false;
      chatInput.focus();
      renderMessages();
    }
  });

  if (loaded.error) {
    errorContainer.innerHTML = `<div class="error-banner">${escapeHTML(loaded.error)}</div>`;
  }
  updateHistoryStatus();
  renderMessages();
}

export async function sendMessageToAPI(currentMessages, characterId = 'tony') {
  const response = await fetch('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      characterId,
      history: formatHistoryForGemini(currentMessages),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo obtener respuesta del servidor.');
  }

  return data.reply;
}
