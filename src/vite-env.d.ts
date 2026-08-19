/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the API. Defaults to the local server when unset. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
