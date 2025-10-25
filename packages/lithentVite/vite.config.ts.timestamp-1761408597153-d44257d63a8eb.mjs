// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "file:///Users/kjw/project/lithent/node_modules/.pnpm/vite@5.4.8_@types+node@22.9.0_lightningcss@1.30.1_terser@5.18.1/node_modules/vite/dist/node/index.js";
import checker from "file:///Users/kjw/project/lithent/node_modules/.pnpm/vite-plugin-checker@0.8.0_eslint@9.16.0_jiti@2.6.1__optionator@0.9.4_typescript@5.6.3_vite@5._wz4ynjmkgzu52l23ftt7zqvp3e/node_modules/vite-plugin-checker/dist/esm/main.js";
import dts from "file:///Users/kjw/project/lithent/node_modules/.pnpm/vite-plugin-dts@2.3.0_@types+node@22.9.0_rollup@4.24.0_vite@5.4.8_@types+node@22.9.0_lightningcss@1.30.1_terser@5.18.1_/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/kjw/project/lithent/packages/lithentVite";
var vite_config_default = defineConfig({
  plugins: [
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"'
      }
    }),
    dts({
      outputDir: ["dist"],
      exclude: ["../../hmrParser/**"],
      skipDiagnostics: true
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src"),
      "lithent/hmrParser": resolve(__vite_injected_original_dirname, "../../hmrParser/src")
    }
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "lithentVite",
      fileName: (format) => format === "umd" ? "index.umd.js" : "index.mjs"
    },
    rollupOptions: {
      external: ["vite", "lithent"],
      output: {
        globals: {
          vite: "vite",
          lithent: "lithent"
        }
      }
    }
  },
  server: {
    port: 4e3,
    open: "/html/parsor.html"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMva2p3L3Byb2plY3QvbGl0aGVudC9wYWNrYWdlcy9saXRoZW50Vml0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2tqdy9wcm9qZWN0L2xpdGhlbnQvcGFja2FnZXMvbGl0aGVudFZpdGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2tqdy9wcm9qZWN0L2xpdGhlbnQvcGFja2FnZXMvbGl0aGVudFZpdGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBjaGVja2VyIGZyb20gJ3ZpdGUtcGx1Z2luLWNoZWNrZXInO1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgY2hlY2tlcih7XG4gICAgICB0eXBlc2NyaXB0OiB0cnVlLFxuICAgICAgZXNsaW50OiB7XG4gICAgICAgIHVzZUZsYXRDb25maWc6IHRydWUsXG4gICAgICAgIGxpbnRDb21tYW5kOiAnZXNsaW50IFwiLi9zcmMvKiovKi57dHMsdHN4fVwiJyxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgZHRzKHtcbiAgICAgIG91dHB1dERpcjogWydkaXN0J10sXG4gICAgICBleGNsdWRlOiBbJy4uLy4uL2htclBhcnNlci8qKiddLFxuICAgICAgc2tpcERpYWdub3N0aWNzOiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgJ2xpdGhlbnQvaG1yUGFyc2VyJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9obXJQYXJzZXIvc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBlbXB0eU91dERpcjogZmFsc2UsXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzJyksXG4gICAgICBuYW1lOiAnbGl0aGVudFZpdGUnLFxuICAgICAgZmlsZU5hbWU6IGZvcm1hdCA9PiAoZm9ybWF0ID09PSAndW1kJyA/ICdpbmRleC51bWQuanMnIDogJ2luZGV4Lm1qcycpLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsndml0ZScsICdsaXRoZW50J10sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgIHZpdGU6ICd2aXRlJyxcbiAgICAgICAgICBsaXRoZW50OiAnbGl0aGVudCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDQwMDAsXG4gICAgb3BlbjogJy9odG1sL3BhcnNvci5odG1sJyxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErVCxTQUFTLGVBQWU7QUFDdlYsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sU0FBUztBQUhoQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxRQUFRO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixRQUFRO0FBQUEsUUFDTixlQUFlO0FBQUEsUUFDZixhQUFhO0FBQUEsTUFDZjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsSUFBSTtBQUFBLE1BQ0YsV0FBVyxDQUFDLE1BQU07QUFBQSxNQUNsQixTQUFTLENBQUMsb0JBQW9CO0FBQUEsTUFDOUIsaUJBQWlCO0FBQUEsSUFDbkIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDL0IscUJBQXFCLFFBQVEsa0NBQVcscUJBQXFCO0FBQUEsSUFDL0Q7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQ3hDLE1BQU07QUFBQSxNQUNOLFVBQVUsWUFBVyxXQUFXLFFBQVEsaUJBQWlCO0FBQUEsSUFDM0Q7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxRQUFRLFNBQVM7QUFBQSxNQUM1QixRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxNQUFNO0FBQUEsVUFDTixTQUFTO0FBQUEsUUFDWDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
