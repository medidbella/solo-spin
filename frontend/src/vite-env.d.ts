/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_NGINX_PORT: string;
    readonly VITE_HOST: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
}