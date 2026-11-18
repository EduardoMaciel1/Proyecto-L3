export default async function handler(req, res) {
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY en el servidor.' });
  }

  try {
    const { history, characterId = 'tony' } = req.body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'El historial de mensajes es inválido o está vacío.' });
    }

    const systemPrompts = {
      tony: `
        Eres una versión ficticia de Tony Stark, inventor y experto en tecnología.
        Habla en español con ingenio, confianza, sarcasmo ligero y humor original.
        Puedes conversar sobre tecnología y los Vengadores; si te preguntan algo ajeno,
        responde brevemente con humor y redirige la charla a esos temas.
        Sé conciso, no inventes datos y distingue la tecnología real de la ficción.
      `,
      jarvis: `
        Eres una versión ficticia de JARVIS, un asistente virtual atento y analítico.
        Habla siempre en español con cortesía, precisión y humor sutil.
        Ayuda principalmente con tecnología y temas de los Vengadores. Si la pregunta
        es ajena, responde amablemente y ofrece volver a esos temas. No inventes datos
        y distingue la tecnología real de la ficción.
      `,
      'captain-america': `
        Eres una versión ficticia de Steve Rogers, conocido como el Capitán América.
        Habla siempre en español de forma directa, serena, respetuosa y alentadora.
        Puedes conversar sobre los Vengadores, liderazgo y trabajo en equipo. Si la
        pregunta es ajena, responde con amabilidad y redirige la conversación.
        No inventes datos y distingue los hechos de la ficción.
      `,
    };

    if (!Object.hasOwn(systemPrompts, characterId)) {
      return res.status(400).json({ error: 'El personaje seleccionado no es válido.' });
    }

    const isValidFormat = history.every(
      (msg) =>
        msg &&
        (msg.role === 'user' || msg.role === 'model') &&
        Array.isArray(msg.parts) &&
        msg.parts.length > 0 &&
        typeof msg.parts[0].text === 'string'
    );

    if (!isValidFormat) {
      return res.status(400).json({ error: 'El formato de los mensajes en el historial no es válido.' });
    }

    const systemPrompt = systemPrompts[characterId].trim();

    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent';

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: history,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 800,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || 'Error al comunicarse con Google Gemini AI.';
      return res.status(response.status).json({ error: errorMsg });
    }

    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === 'MAX_TOKENS') {
      return res.status(502).json({
        error: 'La respuesta de la IA quedó incompleta. Intenta pedir una respuesta más breve.',
      });
    }

    const replyText = candidate?.content?.parts
      ?.map((part) => part.text)
      .filter((text) => typeof text === 'string')
      .join('')
      .trim();

    if (!replyText) {
      return res.status(502).json({ error: 'La IA no devolvió una respuesta válida.' });
    }

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno al procesar la solicitud en el servidor.' });
  }
}