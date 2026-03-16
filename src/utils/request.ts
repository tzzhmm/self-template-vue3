/*
 * @Author: tiankailong tzzhmmcc@163.com
 * @Date: 2026-03-02 16:58:55
 * @LastEditors: tiankailong tzzhmmcc@163.com
 * @LastEditTime: 2026-03-16 10:38:23
 * @FilePath: \workflow-webf:\LTProject\self-template-vue3\src\utils\request.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

const publishRootUrl = import.meta.env.VUE_APP_PublishRootUrl
const localRootUrl = import.meta.env.VUE_APP_LocalRootUrl

const baseUrl: any = import.meta.env.MODE === 'production' ? publishRootUrl : localRootUrl;

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 1000 * 30,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 200) {
      return response.data;
    }
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

const service = {
  get<T = any>(url: string, data?: object): Promise<T> {
    return axiosInstance.get(url, { params: data });
  },

  post<T = any>(url: string, data?: object): Promise<T> {
    return axiosInstance.post(url, data);
  },

  put<T = any>(url: string, data?: object): Promise<T> {
    return axiosInstance.put(url, data);
  },

  delete<T = any>(url: string, data?: object): Promise<T> {
    return axiosInstance.delete(url, data);
  },

  upload: (url: string, file: FormData | File) =>
    axiosInstance.post(url, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default service;
