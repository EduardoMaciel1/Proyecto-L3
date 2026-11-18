import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCharacter } from '../src/characters.js';
import { getChatHTML, initChatEvents } from '../src/chat.js';

function renderChat(characterId) {
  const character = getCharacter(characterId);
  document.body.innerHTML = getChatHTML(character);
  initChatEvents(character, vi.fn());
}

describe('Historial del chat por personaje', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('carga el historial guardado del personaje seleccionado', () => {
    localStorage.setItem(
      'chat_history_tony',
      JSON.stringify([{ role: 'user', text: 'Mi mensaje para Tony', time: '10:00' }])
    );

    renderChat('tony');

    expect(document.getElementById('chat-messages').textContent).toContain('Mi mensaje para Tony');
    expect(document.getElementById('history-status').textContent).toContain('Historial guardado');
  });

  it('mantiene separados los historiales de Tony y JARVIS', () => {
    localStorage.setItem(
      'chat_history_tony',
      JSON.stringify([{ role: 'user', text: 'Solo para Tony', time: '10:00' }])
    );
    localStorage.setItem(
      'chat_history_jarvis',
      JSON.stringify([{ role: 'user', text: 'Solo para JARVIS', time: '10:01' }])
    );

    renderChat('jarvis');

    const renderedMessages = document.getElementById('chat-messages').textContent;
    expect(renderedMessages).toContain('Solo para JARVIS');
    expect(renderedMessages).not.toContain('Solo para Tony');
  });

  it('borra únicamente el historial del personaje actual', () => {
    localStorage.setItem('chat_history_tony', '[]');
    localStorage.setItem('chat_history_jarvis', '[]');
    renderChat('tony');

    document.getElementById('clear-chat-btn').click();

    expect(localStorage.getItem('chat_history_tony')).toBeNull();
    expect(localStorage.getItem('chat_history_jarvis')).toBe('[]');
    expect(document.getElementById('history-status').textContent).toContain('Sin historial');
  });
});
