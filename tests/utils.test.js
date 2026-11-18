import { describe, it, expect } from 'vitest';
import { validateMessage, formatHistoryForGemini, escapeHTML } from '../src/utils.js';

describe('Funciones utilitarias (utils.js)', () => {
  it('1. validateMessage debe rechazar textos vacíos o nulos', () => {
    expect(validateMessage('')).toBe(false);
    expect(validateMessage('   ')).toBe(false);
    expect(validateMessage(null)).toBe(false);
  });

  it('2. validateMessage debe aceptar mensajes válidos', () => {
    expect(validateMessage('Hola Tony')).toBe(true);
  });

  it('3. formatHistoryForGemini debe estructurar el historial correctamente', () => {
    const mockMessages = [
      { role: 'user', text: 'Hola', time: '10:00' },
      { role: 'model', text: 'Genial', time: '10:01' },
    ];

    const formatted = formatHistoryForGemini(mockMessages);

    expect(formatted).toEqual([
      { role: 'user', parts: [{ text: 'Hola' }] },
      { role: 'model', parts: [{ text: 'Genial' }] },
    ]);
  });

  it('4. escapeHTML debe prevenir inyección de scripts', () => {
    const input = '<script>alert("hack")</script>';
    expect(escapeHTML(input)).toBe('&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;');
  });
});