import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 1. defineConfig 내부에서 loadEnv를 호출해야 'mode'를 사용할 수 있습니다.
  // const env = loadEnv(mode, process.cwd(), '');
  const env = loadEnv(mode, __dirname, '');

  console.log('현재 모드:', mode);
  console.log('읽어온 API 주소:', env.VITE_PROXY_TARGET);

  // 프록시 target은 항상 실제 백엔드 주소를 사용 (.env 기본값)
  const apiTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080';;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        shared: path.resolve(__dirname, 'src/shared'),
        entities: path.resolve(__dirname, 'src/entities'),
        features: path.resolve(__dirname, 'src/features'),
        widgets: path.resolve(__dirname, 'src/widgets'),
        pages: path.resolve(__dirname, 'src/pages'),
        app: path.resolve(__dirname, 'src/app'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,

          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
          },
        },
      },
    },
  };
});