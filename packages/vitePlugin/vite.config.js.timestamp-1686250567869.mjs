// vite.config.js
import { resolve } from "path";
import { defineConfig } from "file:///Users/kjw/project/wact/node_modules/.pnpm/vite@3.2.7/node_modules/vite/dist/node/index.js";
import eslintPlugin from "file:///Users/kjw/project/wact/node_modules/.pnpm/@nabla+vite-plugin-eslint@1.5.0_eslint@7.32.0+vite@3.2.7/node_modules/@nabla/vite-plugin-eslint/src/index.js";
var __vite_injected_original_dirname = "/Users/kjw/project/wact/packages/vitePlugin";
var vite_config_default = defineConfig({
  plugins: [eslintPlugin({ eslintOptions: { cache: false } })],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.js"),
      name: "wwxVitePlugin",
      fileName: "wwxVitePlugin"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMva2p3L3Byb2plY3Qvd2FjdC9wYWNrYWdlcy92aXRlUGx1Z2luXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMva2p3L3Byb2plY3Qvd2FjdC9wYWNrYWdlcy92aXRlUGx1Z2luL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9rancvcHJvamVjdC93YWN0L3BhY2thZ2VzL3ZpdGVQbHVnaW4vdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBlc2xpbnRQbHVnaW4gZnJvbSAnQG5hYmxhL3ZpdGUtcGx1Z2luLWVzbGludCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtlc2xpbnRQbHVnaW4oeyBlc2xpbnRPcHRpb25zOiB7IGNhY2hlOiBmYWxzZSB9IH0pXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICBlbXB0eU91dERpcjogZmFsc2UsXG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXguanMnKSxcbiAgICAgIG5hbWU6ICd3d3hWaXRlUGx1Z2luJyxcbiAgICAgIGZpbGVOYW1lOiAnd3d4Vml0ZVBsdWdpbicsXG4gICAgfSxcbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1ULFNBQVMsZUFBZTtBQUMzVSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGtCQUFrQjtBQUZ6QixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSxPQUFPLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFBQSxFQUMzRCxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
