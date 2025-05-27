
import axios from 'axios';
import { parseCookies } from 'nookies';

export function getAPIClient() {
  const { 'nextauth.token': token } = parseCookies();

  const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000,
  });

  if (token) {
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  api.interceptors.request.use(config => {
    const { 'nextauth.token': currentToken } = parseCookies();
    
    if (currentToken) {
      config.headers['Authorization'] = `Bearer ${currentToken}`;
    }
    
    return config;
  });

  return api;
}

export const api = getAPIClient();