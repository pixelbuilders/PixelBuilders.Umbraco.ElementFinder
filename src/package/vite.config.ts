import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "element-finder",
        },
        // Point this directly into your Core Project
        outDir: "../ElementFinder.Core/App_Plugins/Pixelbuilders.ElementFinder",
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco-cms\//, /^lit/], 
        },
    },
});