import { defineConfig, UserConfig } from 'vite'
// import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import path from 'path'
// import tsconfigPaths from 'vite-tsconfig-paths'


// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, "/src"),
      "@shared": path.resolve(__dirname, "../shared/src"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@app": path.resolve(__dirname, "./src/app")
    }
  },
  // optimizeDeps: {
  //   // include: ['react-redux']
  //   exclude: ['react-redux', 'node_modules/.cache']
  // },
  // build: {
  //   commonjsOptions: {
  //     // exclude: ['../shared'],
  //     // include: []
  //     include: [/node_modules/]
  //   }
  // },
  plugins: [
    react(),
    // tsconfigPaths()
  ],

  // esbuild: {
  //   loader: 'ts',
  //   include: /srs\/.*\.ts$/,
  //   exclude: /node_modules/
  // }
}) satisfies UserConfig
