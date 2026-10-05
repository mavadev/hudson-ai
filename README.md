<div align="center">
  <img width="1774" height="887" alt="Hudson AI Banner" src="https://github.com/user-attachments/assets/d1e877b3-3ddd-4c21-a913-89e6183aacda" />
</div>

## 📖 Descripción

Hudson AI es la interfaz de usuario conversacional moderna desarrollada con **Next.js 15 (App Router)** y **Tailwind CSS v4**. Está diseñada para integrarse con el microservicio backend de Gemini ofreciendo respuestas en tiempo real mediante *streaming*, gestión avanzada de temas (Light/Dark mode) y soporte para el flujo completo de autenticación y sesiones de chat.

Su arquitectura limpia y modular facilita la escalabilidad, la integración de la base de datos y una experiencia de usuario fluida tanto en dispositivos móviles como de escritorio.

## 🧪 Capturas de Pantalla

<p align="center">
  <img alt="Hudson AI Interface" src="https://github.com/user-attachments/assets/57fdca69-0420-44ac-a2ac-4c81c4907128" />
</p>

> Explora la interfaz adaptativa con soporte completo para Markdown, resaltado de código y cambio de temas.

## ✨ Características

- ✅ Interfaz web desarrollada con Next.js 15 (React 19) y App Router.
- ✅ Respuestas en streaming (*ReadableStream*) con cancelación de respuesta (*AbortController*).
- ✅ Tema dinámico (Light / Dark Mode) sincronizado con modales de Clerk vía `@theme`.
- ✅ Autenticación flexible: Modo Invitado (Guest Mode) y autenticación completa con Clerk.
- ✅ Persistencia de conversaciones y mensajes en **MongoDB**.
- ✅ Estados de carga visuales (*Skeletons*) para evitar parpadeos de interfaz (*Layout Shift*).
- ✅ Formateo de texto enriquecido y bloques de código con *Syntax Highlighting* vía `highlight.js`.
- ✅ Peticiones limpias y optimizadas mediante `fetch` nativo sin librerías externas redundantes.
- ✅ Diseño responsivo para pantallas móviles y de escritorio.

## 🏗️ Arquitectura del proyecto

La aplicación sigue la estructura del App Router de Next.js dividida en capas lógicas de presentación, lógica de negocio y comunicación con la API.

```text
src/
├── app/          # Rutas principales de la aplicación y endpoints internos (API routes)
├── components/   # Componentes UI reutilizables (Chat, Sidebar, PromptBox, Skeletons)
├── interfaces/   # Definiciones de tipos TypeScript (Chat, Message, User)
├── lib/          # Configuración de base de datos (MongoDB) y utilidades
└── services/     # Funciones de comunicación HTTP con la API (fetch nativo)
```

| Carpeta | Descripción |
|----------|-------------|
| **api** | Páginas de la interfaz, layouts e integración de endpoints locales Next.js. |
| **components** | Componentes modulares de React divididos por responsabilidad de UI. |
| **interfaces** | Contratos de interfaces de TypeScript para un tipado estricto. |
| **lib** | Clientes compartidos como la conexión Mongoose a MongoDB. |
| **services** | Funciones helper para peticiones HTTP consumiendo el microservicio backend. |

## ⚙️ Variables de entorno

Crea un archivo `.env` con las siguientes variables:

```env
MONGODB_URI=your_mongodb_connection_string
CLERK_WEBHOOK_SECRET=your_clerk_webhook
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
API_URL=http://localhost:8000
```

## 💻 Instalación local

Clona el repositorio:

```bash
git clone https://github.com/mavadev/hudson-ai.git
cd hudson-ai
```

Instala las dependencias:

```bash
npm install
```

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

## 🌐 Despliegue

El proyecto está optimizado para desplegarse fácilmente en **Vercel**.

| Configuración | Valor |
|---------------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |


## 🔮 Mejoras futuras

- Soporte para adjuntar archivos e imágenes en el chat.
- Búsqueda y filtrado dentro del historial de conversaciones.
- PWA (Progressive Web App) para soporte offline.

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**.

Desarrollado con ❤️ por **Gianmarco Chistama**
