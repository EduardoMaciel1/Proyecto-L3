# Chat con Tony Stark

Proyecto de clase: una aplicación web para conversar con Tony Stark, JARVIS o el Capitán América. La idea es practicar interfaces web, pruebas y la integración segura de una API de inteligencia artificial.

## Descripción

La aplicación permite elegir entre tres personajes, cada uno con su propio estilo e historial. Tony combina humor y sarcasmo; JARVIS responde de forma atenta y analítica; y el Capitán América tiene un tono sereno y directo.

## Funcionalidades

- Vistas Inicio, Chat y Acerca de con navegación SPA y History API.
- Diseño mobile-first adaptable a celulares, tablets y escritorio.
- Galería para elegir entre Tony Stark, JARVIS y el Capitán América, con personalidad e historial independiente para cada uno.
- Historial por personaje y preferencia de tema guardados en `localStorage`.
- Selector para cambiar entre tema claro y oscuro, con una paleta propia para cada personaje.
- Indicador de respuesta en curso, mensajes de error, marcas de hora y opción para copiar respuestas.
- Envío con Enter desde el formulario del chat.
- Integración con Gemini mediante una función de Vercel. La clave de API se mantiene en el servidor.
- Pruebas unitarias con Vitest.

## Tecnologías

- HTML, CSS y JavaScript.
- Vite para el desarrollo y la compilación.
- Vercel Serverless Functions para la API.
- Google Gemini API, modelo `gemini-3.5-flash-lite`.
- Vitest y jsdom para las pruebas.


## Capturas del proceso

Estas imágenes documentan la planificación inicial y las decisiones tomadas para el proyecto. No son capturas de la aplicación en ejecución.

### Inicio del proyecto

![Solicitud de guía paso a paso](./docs/capturas/01-inicio-proyecto.png)

### Elección del personaje

![Elección de Tony Stark como personaje inicial](./docs/capturas/02-eleccion-personaje.png)

### Personalidad y alcance del chat

![Definición de la personalidad y los temas del personaje](./docs/capturas/03-personalidad-chat.png)

### Contexto estudiantil

![Aclaración de que el proyecto es un trabajo de clase](./docs/capturas/04-contexto-estudiantil.png)

### Preguntas de prueba

![Ejemplos de preguntas para probar el chat](./docs/capturas/05-preguntas-de-prueba.png)

### Configuración inicial

![Inicio de la preparación del proyecto desde cero](./docs/capturas/06-configuracion-inicial.png)

### Mejoras futuras

![Idea de agregar otros personajes después de completar los requisitos](./docs/capturas/07-mejoras-futuras.png)


## Aplicación desplegada
[https://proyecto-l3.vercel.app](https://proyecto-l3.vercel.app)