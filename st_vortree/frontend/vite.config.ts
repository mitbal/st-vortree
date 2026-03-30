import react from "@vitejs/plugin-react";
import { defineConfig, LibraryFormats } from "vite";

export default defineConfig(() => {
  return {
    base: "./",
    plugins: [react()],
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    },
    build: {
      minify: false,
      outDir: "dist",
      lib: {
        entry: "./src/index.tsx",
        name: "st-vortree",
        formats: ["es"] as LibraryFormats[],
        fileName: () => "vortree.js",
      }
    },
  };
});
