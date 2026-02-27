import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    // Point to the local file you just saved
    input: './swagger.json', 
    output: {
        path: 'src/api',
        lint: false
    },
    plugins: [
        '@hey-api/client-fetch'
    ],
});