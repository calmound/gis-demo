import { defineConfig } from "vite";
import path from "path";
import cesium from "vite-plugin-cesium";

export default defineConfig({
  plugins: [cesium()],
  build: {
    chunkSizeWarningLimit: 2000, // 避免 Cesium 过大导致警告
  },
});
