import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMessageToAPI } from '../src/chat.js';

describe('Integración con API del Chat (con mock de fetch)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('5. sendMessageToAPI debe retornar la respuesta del modelo correctamente', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'Prueba superada, chico.' }),
    });

    const result = await sendMessageToAPI([{ role: 'user', text: '¿Qué tal?' }]);
    expect(result).toBe('Prueba superada, chico.');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('6. sendMessageToAPI debe lanzar error si la API falla', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Servidor no disponible' }),
    });

    await expect(sendMessageToAPI([{ role: 'user', text: 'Hola' }])).rejects.toThrow(
      'Servidor no disponible'
    );
  });
});