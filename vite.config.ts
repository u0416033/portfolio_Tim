import { fileURLToPath, URL } from "node:url";
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
const proxy_api = "http://220.135.33.221:5035"; //若Server在本機 則定為 localhost:5035
const proxy_api_local = "http://220.135.33.221:5035"; //若Server在本機 則定為 localhost:5035
// const proxy_api = "http://127.0.0.1:5035"; //若Server在本機 則定為 localhost:5035
// const proxy_api_local = "http://127.0.0.1:5035"; //若Server在本機 則定為 localhost:5035

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.PNG"],
  plugins: [
    vue(),
    vueJsx(),
    glsl({
      include: [
        // Glob pattern, or array of glob patterns to import
        "**/*.glsl",
        "**/*.wgsl",
        "**/*.vert",
        "**/*.frag",
        "**/*.vs",
        "**/*.fs",
      ],
      exclude: undefined, // Glob pattern, or array of glob patterns to ignore
      warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
      defaultExtension: "glsl", // Shader suffix when no extension is specified
      compress: false, // Compress output shader code
      watch: true, // Recompile shader on change
      root: "/", // Directory for root imports
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 2035,
    proxy: {
      "/api": {
        target: proxy_api_local,
      },
      "/thumbnail": {
        target: proxy_api,
        changeOrigin: true, //取代掉某部分路由
        rewrite: (path) => path.replace(/^\/thumbnail/, "Thumbnails/"),
      },
    },
  },
});
