import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  // Deno runtime, not part of the Vite/React TS project — linted (if at
  // all) by `deno lint` in its own environment, not this app's ruleset.
  { ignores: ['dist', 'dev-dist', 'node_modules', 'supabase/functions/**'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.config.{js,ts}', 'scripts/**'],
    languageOptions: { globals: { process: 'readonly' } },
  },
  prettierConfig,
)
