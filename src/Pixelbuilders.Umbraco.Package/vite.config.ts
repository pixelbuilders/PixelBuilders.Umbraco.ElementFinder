import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "element-finder",
        },
        // Point to wwwroot in your C# project
        outDir: "../Pixelbuilders.Umbraco.ElementFinder.Core/wwwroot", 
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco-cms\//, /^lit/], 
        },
    },
});