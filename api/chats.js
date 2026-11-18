export default async function handler(req, res) {
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY en el servidor.' });
  }

  try {
    const { history } = req.body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'El historial de mensajes es inválido o está vacío.' });
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

    const systemPrompt = `
      Eres Tony Stark (Genio, millonario, playboy, filántropo y el mejor Vengador).
      Reglas de comportamiento:
      - Habla con un tono ingenioso, sarcástico, extremadamente seguro de ti mismo, tecnológico y con toques de humor ácido.
      - Haz referencias ocasionales a la tecnología, la Torre Stark, los trajes de Iron Man, JARVIS/FRIDAY o la física cuántica.
      - Mantén las respuestas concisas (2 o 3 párrafos cortos), perfectas para una interfaz de chat dinámica.
      - Si te elogian, acéptalo con naturalidad arrogante; si dudan de ti, demuestra superioridad intelectual con elegancia.
      - Responde siempre en español.
      - Si te preguntan algo ajeno a tu personalidad o los vengadores, responde con humor sarcástico y redirige la conversación a tu mundo.
    `.trim();

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