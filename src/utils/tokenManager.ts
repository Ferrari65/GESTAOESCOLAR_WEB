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
      
      console.log('✅ Token salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar token:', error);
    }
  },

  get: (): string | null => {
    if (ENV.isServer) return null;
    
    try {
      // ✅ PRIORIDADE: Cookie primeiro, localStorage como fallback
      const cookieMatch = document.cookie.match(new RegExp(`${AUTH_CONFIG.tokenCookieName}=([^;]+)`));
      if (cookieMatch?.[1] && cookieMatch[1].trim() !== '') {
        return cookieMatch[1];
      }
      
      const localToken = localStorage.getItem(AUTH_CONFIG.tokenLocalStorageKey);
      if (localToken && localToken.trim() !== '') {
        return localToken;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
      return null;
    }
  },

  getFromRequest: (request: { cookies: { get: (name: string) => { value?: string } | undefined } }): string | null => {
    try {
      const tokenFromCookie = request.cookies.get(AUTH_CONFIG.tokenCookieName)?.value;
      return tokenFromCookie && tokenFromCookie.trim() !== '' ? tokenFromCookie : null;
    } catch {
      return null;
    }
  },

  remove: (): void => {
    if (ENV.isServer) return;
    
    try {
      // ✅ CORREÇÃO: Remove de todas as formas possíveis
      document.cookie = `${AUTH_CONFIG.tokenCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
      document.cookie = `${AUTH_CONFIG.tokenCookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
      
      localStorage.removeItem(AUTH_CONFIG.tokenLocalStorageKey);
      localStorage.removeItem(AUTH_CONFIG.secretariaIdKey);
      
      console.log('✅ Token removido com sucesso');
    } catch (error) {
      console.error('❌ Erro ao remover token:', error);
    }
  },

  // ✅ CORREÇÃO PRINCIPAL: Validação mais rigorosa
  isValid: (token: string): boolean => {
    try {
      if (!token || token.trim() === '') {
        console.log('🔒 Token vazio ou nulo');
        return false;
      }
      
      // ✅ CORREÇÃO: Verifica se tem pelo menos 3 partes (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('🔒 Token com formato inválido');
        return false;
      }
      
      const payload = jwtDecode<JWTPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      
      // ✅ CORREÇÃO: Adiciona margem de 30 segundos para evitar problemas de sincronização
      const isNotExpired = payload.exp > (now + 30);
      const hasRole = Boolean(payload.role);
      
      if (!isNotExpired) {
        console.log('🔒 Token expirado:', {
          exp: new Date(payload.exp * 1000).toISOString(),
          now: new Date(now * 1000).toISOString()
        });
      }
      
      if (!hasRole) {
        console.log('🔒 Token sem role');
      }
      
      return isNotExpired && hasRole;
    } catch (error) {
      console.log('🔒 Erro ao validar token:', error);
      return false;
    }
  },

  // ✅ CORREÇÃO: Método separado para verificar expiração
  isExpired: (token: string): boolean => {
    try {
      if (!token || token.trim() === '') return true;
      
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = jwtDecode<JWTPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      
      // ✅ CORREÇÃO: Sem margem aqui, verificação exata
      const isExpired = payload.exp <= now;
      
      if (isExpired) {
        console.log('🔒 Token expirado detectado:', {
          exp: new Date(payload.exp * 1000).toISOString(),
          now: new Date(now * 1000).toISOString(),
          diffMinutes: Math.round((payload.exp - now) / 60)
        });
      }
      
      return isExpired;
    } catch (error) {
      console.log('🔒 Erro ao verificar expiração:', error);
      return true;
    }
  },

  decode: (token: string): JWTPayload | null => {
    try {
      if (!token || !TokenManager.isValid(token)) {
        return null;
      }
      return jwtDecode<JWTPayload>(token);
    } catch (error) {
      console.log('🔒 Erro ao decodificar token:', error);
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
  },

  // ✅ NOVO: Método para debug
  debug: (): void => {
    if (ENV.isServer || process.env.NODE_ENV !== 'development') return;
    
    console.group('🔍 TOKEN DEBUG');
    
    const token = TokenManager.get();
    console.log('Token exists:', !!token);
    
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token valid:', TokenManager.isValid(token));
      console.log('Token expired:', TokenManager.isExpired(token));
      
      try {
        const payload = jwtDecode<JWTPayload>(token);
        console.log('Payload:', {
          role: payload.role,
          exp: new Date(payload.exp * 1000).toISOString(),
          timeToExpiry: Math.round((payload.exp - Date.now() / 1000) / 60) + ' minutes'
        });
      } catch (e) {
        console.log('Payload decode error:', e);
      }
    }
    
    console.groupEnd();
  }
};

// ✅ CORREÇÃO: Exports mais limpos
export const getToken = (): string | null => TokenManager.get();
export const isAuthenticated = (): boolean => {
  const token = TokenManager.get();
  return token !== null && TokenManager.isValid(token);
};
export const clearTokens = (): void => TokenManager.remove();

export default TokenManager;