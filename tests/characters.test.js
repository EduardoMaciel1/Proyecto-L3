import { describe, expect, it } from 'vitest';
import { characters, getCharacter, setCharacterTheme } from '../src/characters.js';
import { getChatHTML } from '../src/chat.js';

describe('Selección de personajes', () => {
  it('ofrece al menos tres personajes con identificadores únicos', () => {
    expect(characters.length).toBeGreaterThanOrEqual(3);
    expect(new Set(characters.map((character) => character.id)).size).toBe(characters.length);
  });

  it('cada personaje tiene su propia presentación e introducción', () => {
    expect(characters.every((character) => character.title && character.description && character.greeting)).toBe(
      true
    );
    expect(new Set(characters.map((character) => character.greeting)).size).toBe(characters.length);
  });

  it('permite cambiar de personaje desde la vista del chat', () => {
    const chat = getChatHTML(getCharacter('jarvis'));
    expect(chat).toContain('<strong>JARVIS</strong>');
    expect(chat).toContain('id="character-select"');
    expect(chat).toContain('<option value="captain-america"');
  });

  it('usa Tony como opción segura para identificadores desconocidos', () => {
    expect(getCharacter('unknown').id).toBe('tony');
  });

  it('actualiza el tema visual al personaje elegido', () => {
    const root = document.createElement('html');

    expect(setCharacterTheme('jarvis', root)).toBe('jarvis');
    expect(root.dataset.character).toBe('jarvis');
    expect(setCharacterTheme('unknown', root)).toBe('tony');
    expect(root.dataset.character).toBe('tony');
  });
});
