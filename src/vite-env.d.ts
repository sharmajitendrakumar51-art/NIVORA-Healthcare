/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_CANCELLATION_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  readonly VITE_API_URL: string;
  readonly VITE_ADMIN_PANEL_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
