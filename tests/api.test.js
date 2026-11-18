import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/chats.js';

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('Función de API del chat', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-api-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              finishReason: 'STOP',
              content: { parts: [{ text: 'Hola ' }, { text: 'desde Gemini.' }] },
            },
          ],
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each([
    ['tony', 'Tony Stark'],
    ['jarvis', 'JARVIS'],
    ['captain-america', 'Capitán América'],
  ])('usa instrucciones propias para %s', async (characterId, expectedCharacter) => {
    const req = {
      method: 'POST',
      body: {
        characterId,
        history: [{ role: 'user', parts: [{ text: 'Hola' }] }],
      },
    };
    const res = createResponse();

    await handler(req, res);

    const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toBe('Hola desde Gemini.');
    expect(requestBody.systemInstruction.parts[0].text).toContain(expectedCharacter);
  });

  it('rechaza personajes desconocidos antes de llamar a Gemini', async () => {
    const res = createResponse();

    await handler(
      {
        method: 'POST',
        body: {
          characterId: 'unknown',
          history: [{ role: 'user', parts: [{ text: 'Hola' }] }],
        },
      },
      res
    );

    expect(res.statusCode).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('informa si Gemini indica que la respuesta llegó al límite', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: 'Respuesta parcial' }] } }],
      }),
    });
    const res = createResponse();

    await handler(
      {
        method: 'POST',
        body: {
          characterId: 'tony',
          history: [{ role: 'user', parts: [{ text: 'Hola' }] }],
        },
      },
      res
    );

    expect(res.statusCode).toBe(502);
    expect(res.body.error).toContain('incompleta');
  });
});
