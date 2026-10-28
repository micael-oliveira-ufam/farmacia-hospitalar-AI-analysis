/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_USE_FIREBASE?: string; readonly VITE_GUIDE_URL?: string }
interface ImportMeta { readonly env: ImportMetaEnv }
