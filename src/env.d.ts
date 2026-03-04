declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

// Extends the built-in ImportMeta interface to include Vite environment variables
// Note that Vite environment variables must be prefixed with VITE_ to be exposed to the client-side code
interface ImportMetaEnv {
  readonly VITE_LLM_API_BASE_URL?: string;
  readonly VITE_LLM_API_PORT?: string;
  readonly VITE_AUTH_TOKEN?: string;
  readonly VITE_DATA_PACKAGE_PATH?: string;
  readonly VITE_PRODUCTION?: string;
  readonly VITE_BENCHMARK_ENDPOINT_URL?: string;
  readonly VITE_ENABLE_CUSTOM_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
