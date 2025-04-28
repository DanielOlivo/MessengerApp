import { defineConfig } from "vitest/config";
import path from 'path'

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest-setup.ts'],
        // environment: './vitest-env-socket.ts'
    },
    resolve: {
        alias: {
            "@src": path.resolve(__dirname, "./src"),
            "@shared": path.resolve(__dirname, "../shared/src"),
            "@features": path.resolve(__dirname, "./src/features"),
            "@app": path.resolve(__dirname, "./src/app"),

            "@socketServer": path.resolve(__dirname, '../server/src'),
            "@config": path.resolve(__dirname, '../server/src/config'),
        }
    },
})