import { resolve } from "path";
import { defineConfig } from "vite";
import eslintPlugin from "@nabla/vite-plugin-eslint";

export default ({ path, name, fileName }) => {
  return defineConfig({
    plugins: [eslintPlugin({ eslintOptions: { cache: false } })],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    build: {
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, path),
        name,
        fileName,
      },
      rollupOptions: {
        external: ["@wact/act"],
      },
    },
    esbuild: {
      jsxFactory: "h",
      jsxFragment: "Fragment",
    },
  });
};
