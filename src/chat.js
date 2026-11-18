import { formatTimestamp, validateMessage, formatHistoryForGemini, escapeHTML } from './utils.js';

const STORAGE_KEY = 'tony_stark_chat_history';

let messages = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  {
    role: 'model',
    text: 'Soy Tony Stark. Genio, multimillonario, filántropo... y aparentemente también tu asistente. Haz tu pregunta. Intentaré no juzgarla demasiado rápido.',
    time: formatTimestamp(),
  },
];

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function getChatHTML() {
  return `
    <section class="chat-wrapper">
      <div class="chat-header">
        <div>
          <strong>Tony Stark</strong>
          <span style="font-size: 0.8rem; color: var(--text-secondary); display: block;">
            En línea • Malibú / Torre Stark
          </span>
        </div>
        <button id="clear-chat-btn" class="btn-danger" title="Borrar historial">
          Borrar historial
        </button>
      </div>

      <div id="error-container"></div>
      <div id="chat-messages" class="chat-messages"></div>

      <form id="chat-form" class="chat-form">
        <input
          type="text"
          id="chat-input"
          class="chat-input"
          placeholder="Escribe algo para Tony Stark..."
          autocomplete="off"
          required
        />
        <button type="submit" id="send-btn" class="btn-primary">Enviar</button>
      </form>
    </section>
  `;
}

export function initChatEvents() {
  const messagesContainer = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const clearBtn = document.getElementById('clear-chat-btn');
  const errorContainer = document.getElementById('error-container');

  function renderMessages(isTyping = false) {
    messagesContainer.innerHTML = messages
      .map(
        (msg, index) => `
        <div class="message ${msg.role}">
          <div>${escapeHTML(msg.text).replace(/\n/g, '<br>')}</div>
          <div class="message-meta">
            <span>${msg.time}</span>
            ${
              msg.role === 'model'
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
        <div class="typing-indicator">Tony está procesando los datos en su armadura...</div>
      `;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  messagesContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('copy-btn')) {
      const idx = e.target.getAttribute('data-index');
      await navigator.clipboard.writeText(messages[idx].text);
      e.target.textContent = '¡Copiado!';
      setTimeout(() => (e.target.textContent = 'Copiar'), 1500);
    }
  });

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    messages = [
      {
        role: 'model',
        text: 'Registro eliminado. Tienes una segunda oportunidad para impresionarme.',
        time: formatTimestamp(),
      },
    ];
    saveHistory();
    renderMessages();
  });

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorContainer.innerHTML = '';

    const userText = chatInput.value;
    if (!validateMessage(userText)) return;

    messages.push({
      role: 'user',
      text: userText.trim(),
      time: formatTimestamp(),
    });
    saveHistory();
    chatInput.value = '';
    chatInput.disabled = true;
    sendBtn.disabled = true;
    renderMessages(true);

    try {
      const reply = await sendMessageToAPI(messages);
      messages.push({
        role: 'model',
        text: reply,
        time: formatTimestamp(),
      });
      saveHistory();
    } catch (err) {
      errorContainer.innerHTML = `<div class="error-banner">${escapeHTML(err.message)}</div>`;
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
      renderMessages(false);
    }
  });

  renderMessages();
}

export async function sendMessageToAPI(currentMessages) {
  const response = await fetch('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history: formatHistoryForGemini(currentMessages),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo obtener respuesta del servidor.');
  }

  return data.reply;
}