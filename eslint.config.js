import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Context modules deliberately export a provider component next to the hook
    // that reads it — splitting them across files to satisfy fast refresh would
    // make the pairing harder to follow for no runtime benefit.
    files: ['src/core/auth/index.tsx', 'src/core/theme/index.tsx', 'src/hooks/useToast.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
