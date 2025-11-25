import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import type { UserConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  let buildConfig: UserConfig['build'] = {
    sourcemap: false,
    minify: 'esbuild',
  };

  if (isDev) {
    buildConfig = {
      minify: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    };
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: buildConfig,
    esbuild: isDev
      ? {
          jsxDev: true,
          keepNames: true,
          minifyIdentifiers: false,
        }
      : undefined,
    define: isDev
      ? {
          'process.env.NODE_ENV': '"development"',
          __DEV__: 'true',
        }
      : undefined,
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: 5173, // Garante a porta padrão para os testes Cypress
    },
  };
});