import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['**/*.js', 'src/components/ui/**', '.eslintrc.js'],
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      react: reactPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'react/react-in-jsx-scope': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    }
  },
  ...tseslint.configs.recommended
];
