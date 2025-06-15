
import { log } from '@/utils/logger';
import type { CacheItem, CacheConfig } from '@/types/shared';

class CacheManager<T> {
  private cache = new Map<string, CacheItem<T>>();
  private config: CacheConfig;
  private name: string;

  constructor(name: string, config: CacheConfig = { duration: 5 * 60 * 1000 }) {
    this.name = name;
    this.config = config;
    
    // Limpeza automática a cada 10 minutos
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  // Verificar se um item está válido
  private isValid(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < this.config.duration;
  }

  // Obter item do cache
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      log.cache(`[${this.name}] Cache miss para: ${key}`);
      return null;
    }

    if (!this.isValid(item)) {
      log.cache(`[${this.name}] Cache expirado para: ${key}`);
      this.cache.delete(key);
      return null;
    }

    log.cache(`[${this.name}] Cache hit para: ${key}`);
    return item.data;
  }

  // Salvar item no cache
  set(key: string, data: T): void {
    // Verificar limite de tamanho
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };

    this.cache.set(key, item);
    log.cache(`[${this.name}] Item salvo no cache: ${key}`);
  }

  // Verificar se tem dados válidos
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? this.isValid(item) : false;
  }

  // Remover item específico
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      log.cache(`[${this.name}] Item removido do cache: ${key}`);
    }
    return deleted;
  }

  // Limpar cache expirado
  cleanup(): void {
    const initialSize = this.cache.size;
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp >= this.config.duration) {
        this.cache.delete(key);
      }
    }

    const cleaned = initialSize - this.cache.size;
    if (cleaned > 0) {
      log.cache(`[${this.name}] Limpeza: ${cleaned} itens removidos`);
    }
  }

  // Limpar tudo
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    log.cache(`[${this.name}] Cache limpo completamente: ${size} itens`);
  }

  // Estatísticas
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    log.cache(`[${this.name}] Configuração atualizada:`, this.config);
  }
}

// ===== FACTORY PARA CRIAR CACHES =====
export function createCache<T>(
  name: string, 
  config?: CacheConfig
): CacheManager<T> {
  return new CacheManager<T>(name, config);
}

// ===== CACHES PRÉ-DEFINIDOS =====

// Cache para lista de cursos
export const cursoCache = createCache<any[]>('cursos', {
  duration: 3 * 60 * 1000, // 3 minutos
  maxSize: 100,
});

// Cache para lista de professores
export const professorCache = createCache<any[]>('professores', {
  duration: 5 * 60 * 1000, // 5 minutos
  maxSize: 200,
});

// Cache para lista de disciplinas
export const disciplinaCache = createCache<any[]>('disciplinas', {
  duration: 10 * 60 * 1000, // 10 minutos
  maxSize: 150,
});

// Cache para dados da secretaria
export const secretariaCache = createCache<any>('secretaria', {
  duration: 5 * 60 * 1000, // 5 minutos
  maxSize: 50,
});

// Cache para turmas
export const turmaCache = createCache<any[]>('turmas', {
  duration: 5 * 60 * 1000, // 5 minutos
  maxSize: 100,
});

// ===== UTILITÁRIOS =====

// Gerar chave de cache baseada em parâmetros
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
}

// Invalidar múltiplos caches
export function invalidateAll(): void {
  cursoCache.clear();
  professorCache.clear();
  disciplinaCache.clear();
  secretariaCache.clear();
  turmaCache.clear();
  
  log.cache('Todos os caches foram invalidados');
}

// Estatísticas de todos os caches
export function getAllCacheStats(): Record<string, any> {
  return {
    cursos: cursoCache.stats(),
    professores: professorCache.stats(),
    disciplinas: disciplinaCache.stats(),
    secretaria: secretariaCache.stats(),
    turmas: turmaCache.stats(),
  };
}

// ===== HOOK PARA USAR CACHE =====
import { useState, useCallback } from 'react';

export function useCache<T>(cacheManager: CacheManager<T>) {
  const [isLoading, setIsLoading] = useState(false);

  const getCached = useCallback((key: string): T | null => {
    return cacheManager.get(key);
  }, [cacheManager]);

  const setCached = useCallback((key: string, data: T): void => {
    cacheManager.set(key, data);
  }, [cacheManager]);

  const hasCached = useCallback((key: string): boolean => {
    return cacheManager.has(key);
  }, [cacheManager]);

  const deleteCached = useCallback((key: string): boolean => {
    return cacheManager.delete(key);
  }, [cacheManager]);

  const clearCache = useCallback((): void => {
    cacheManager.clear();
  }, [cacheManager]);

  return {
    getCached,
    setCached,
    hasCached,
    deleteCached,
    clearCache,
    isLoading,
    setIsLoading,
  };
}
