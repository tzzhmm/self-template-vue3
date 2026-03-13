/*
 * @Author: tiankailong tzzhmmcc@163.com
 * @Date: 2026-03-02 16:58:55
 * @LastEditors: tiankailong tzzhmmcc@163.com
 * @LastEditTime: 2026-03-13 16:45:08
 * @FilePath: src\router\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开 koroFileHeader 查看配置 
 * 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createRouter, createWebHistory } from 'vue-router';
import appRoutes from './modules-index';
import createRouterGuard from './guard';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'ocrDemo',
      component: () => import('@/views/ocrDemo/index.vue'),
      meta: {
        // router other information
      },
    },
    ...appRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'noFound',
      component: () => import('@/views/exception/404.vue'),
      meta: {
        title: '404',
      },
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
      meta: {
        // router other information
      },
    },
    {
      path: '/selfDemo',
      name: 'selfDemo',
      component: () => import('@/views/selfDemo/index.vue'),
      meta: {
        // router other information
      },
    }
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

createRouterGuard(router);

export default router;
