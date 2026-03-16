/*
 * @Author: tiankailong tzzhmmcc@163.com
 * @Date: 2026-03-02 16:58:56
 * @LastEditors: tiankailong tzzhmmcc@163.com
 * @LastEditTime: 2026-03-16 10:35:00
 * @FilePath: \workflow-webf:\LTProject\self-template-vue3\vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import vueJsx from '@vitejs/plugin-vue-jsx';
import {
  ArcoResolver,
  VueUseComponentsResolver,
} from 'unplugin-vue-components/resolvers';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载当前模式对应的 .env 文件
  const env = loadEnv(mode, process.cwd());
  const apiTarget = env.VITE_API_TARGET;

  return {
    envPrefix: ['VUE_APP_', 'VITE_'],
    server: {
      host: true, // 可以以IP访问
      port: 8080, // 端口
      open: true, // 自动打开游览器
      cors: true, // 允许跨域
      proxy: {
        // '/api': {
        //   target: apiTarget,  // 从 .env.development / .env.production 读取
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace('/api/', '/'),
        // },
      },
    },
    build: {
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 2000,
      // 在生产环境移除console.log
      terserOptions: {
        compress: {
          drop_console: false,
          pure_funcs: ['console.log', 'console.info'],
          drop_debugger: true,
        },
      },
      assetsDir: 'static/assets',
      // 静态资源打包到dist下的不同目录
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      Icons({ autoInstall: true, compiler: 'vue3' }),
      svgLoader(),
      AutoImport({
        dts: './src/auto-imports.d.ts',
        imports: ['vue', 'pinia', 'vue-router', '@vueuse/core'],
        eslintrc: {
          enabled: true,
          filepath: './eslintrc-auto-import.json',
          globalsPropValue: true,
        },
        resolvers: [ArcoResolver()],
      }),
      Components({
        dts: './src/components.d.ts',
        resolvers: [
          ArcoResolver({ sideEffect: true }),
          VueUseComponentsResolver(),
          IconsResolver(),
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'arcoblue-6': '#f85959',
          },
          javascriptEnabled: true,
        },
      },
    },
  };
});
