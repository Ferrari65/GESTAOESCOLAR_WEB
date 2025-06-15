import { jwtDecode } from 'jwt-decode';
import { AUTH_CONFIG, ENV } from '@/config/app';

// ===== INTERFACES =====
interface JWTPayload {
  sub?: string;
  email?: string;
  role: string;
  exp: number;
  iat?: number;
}

// ===== GERENCIADOR ÚNICO DE TOKENS =====
export const TokenManager = {

  save: (token: string, secretariaId?: string): void => {
    if (ENV.isServer) return;
    
    try {
      const expires = new Date(Date.now() + AUTH_CONFIG.maxAge * 1000).toUTCString();
      const isSecure = window.location.protocol === 'https:';
      
      document.cookie = `${AUTH_CONFIG.tokenCookieName}=${token}; path=/; expires=${expires}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      
      localStorage.setItem(AUTH_CONFIG.tokenLocalStorageKey, token);
      
      if (secretariaId) {
        localStorage.setItem(AUTH_CONFIG.secretariaIdKey, secretariaId);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar token:', error);
    }
  },

  // ===== OBTER TOKEN =====
  get: (): string | null => {
    if (ENV.isServer) return null;
    
    try {
      const cookieMatch = document.cookie.match(new RegExp(`${AUTH_CONFIG.tokenCookieName}=([^;]+)`));
      if (cookieMatch?.[1]) {
        return cookieMatch[1];
      }
      
      const localToken = localStorage.getItem(AUTH_CONFIG.tokenLocalStorageKey);
      return localToken;
    } catch (error) {
      console.error(' Erro ao obter token:', error);
      return null;
    }
  },

  // ===== OBTER TOKEN  =====
  getFromRequest: (request: { cookies: { get: (name: string) => { value?: string } | undefined } }): string | null => {
    try {
      const tokenFromCookie = request.cookies.get(AUTH_CONFIG.tokenCookieName)?.value;
      return tokenFromCookie && tokenFromCookie.trim() !== '' ? tokenFromCookie : null;
    } catch {
      return null;
    }
  },

  // ===== REMOVER TOKEN =====
  remove: (): void => {
    if (ENV.isServer) return;
    
    try {

      document.cookie = `${AUTH_CONFIG.tokenCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
      
      localStorage.removeItem(AUTH_CONFIG.tokenLocalStorageKey);
      localStorage.removeItem(AUTH_CONFIG.secretariaIdKey);
    } catch (error) {
      console.error(' Erro ao remover token:', error);
    }
  },

  // ===== VALIDAR TOKEN =====
  isValid: (token: string): boolean => {
    try {
      if (!token || token.trim() === '') return false;
      
      const payload = jwtDecode<JWTPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      
      const isNotExpired = payload.exp > now;
      
      const hasRole = Boolean(payload.role);
      
      return isNotExpired && hasRole;
    } catch (error) {
      return false;
    }
  },

  // ===== VERIFICAR SE EXPIROU =====
  isExpired: (token: string): boolean => {
    try {
      if (!token) return true;
      
      const payload = jwtDecode<JWTPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp <= now;
    } catch {
      return true;
    }
  },

  // ===== DECODIFICAR TOKEN =====
  decode: (token: string): JWTPayload | null => {
    try {
      if (!token || !TokenManager.isValid(token)) return null;
      return jwtDecode<JWTPayload>(token);
    } catch {
      return null;
    }
  },

  getSecretariaId: (): string | null => {
    if (ENV.isServer) return null;
    
    try {
      return localStorage.getItem(AUTH_CONFIG.secretariaIdKey);
    } catch {
      return null;
    }
  }
};

export const getToken = (): string | null => TokenManager.get();
export const isAuthenticated = (): boolean => {
  const token = TokenManager.get();
  return token !== null && TokenManager.isValid(token);
};
export const clearTokens = (): void => TokenManager.remove();

export default TokenManager;