
import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
// import qs from 'qs';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_TIMEOUT = import.meta.env.VITE_TIMEOUT
  ? parseInt(import.meta.env.VITE_TIMEOUT)
  : 30000;

export const createClient = (config?: AxiosRequestConfig) => {
  return axios.create({
    baseURL: BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'content-type': 'application/json',
    },
    withCredentials: true,
    // paramsSerializer: (params) =>
    //   qs.stringify(params, { arrayFormat: 'repeat' }),
    ...config,
  });
};

export const httpClient = createClient();
