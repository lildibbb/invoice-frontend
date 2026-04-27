import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: '../shared/openapi.json',
  output: {
    path: 'src/app/core/api',
    format: 'prettier',
    lint: 'eslint',
  },
  types: {
    enums: 'typescript',
  },
});
