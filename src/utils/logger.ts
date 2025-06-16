// ===== LOGGER CENTRALIZADO E SIMPLIFICADO =====
// Todos os logs passam por aqui, facilitando controle e limpeza

import { ENV } from '@/config/app';

// ===== CONFIGURAÇÃO =====
const shouldLog = ENV.isDevelopment;

// ===== FUNÇÃO PRINCIPAL =====
function createLog(level: string, emoji: string, consoleMethod: 'log' | 'warn' | 'error' | 'info') {
  return (context: string, message: string, data?: unknown) => { // ✅ CORRIGIDO: any → unknown
    // ✅ APENAS em desenvolvimento
    if (!shouldLog) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `${emoji} [${timestamp}] ${level} [${context}] ${message}`;
    
    if (data !== undefined) {
      console[consoleMethod](formattedMessage, data);
    } else {
      console[consoleMethod](formattedMessage);
    }
  };
}

// ===== TIPOS DE LOG =====
export const log = {
  // Básicos
  info: createLog('INFO', 'ℹ️', 'info'),
  success: createLog('SUCCESS', '✅', 'log'),
  warn: createLog('WARN', '⚠️', 'warn'),
  error: createLog('ERROR', '❌', 'error'),
  debug: createLog('DEBUG', '🐛', 'log'),

  // Contextos específicos (para facilitar)
  auth: (message: string, data?: unknown) => { // ✅ CORRIGIDO: any → unknown
    if (!shouldLog) return;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔐 [${timestamp}] [AUTH] ${message}`, data || '');
  },

  api: (message: string, data?: unknown) => { // ✅ CORRIGIDO: any → unknown
    if (!shouldLog) return;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🌐 [${timestamp}] [API] ${message}`, data || '');
  },

  form: (message: string, data?: unknown) => { // ✅ CORRIGIDO: any → unknown
    if (!shouldLog) return;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`📝 [${timestamp}] [FORM] ${message}`, data || '');
  },

  // Para grupos de logs relacionados
  group: (context: string, title: string) => {
    if (!shouldLog) return;
    console.group(`🔍 [${context}] ${title}`);
  },

  groupEnd: () => {
    if (!shouldLog) return;
    console.groupEnd();
  },

  // Para medir performance
  time: (label: string) => {
    if (!shouldLog) return;
    console.time(`⏱️ ${label}`);
  },

  timeEnd: (label: string) => {
    if (!shouldLog) return;
    console.timeEnd(`⏱️ ${label}`);
  },

  // Para transformações de dados
  transform: (operation: string, input: unknown, output: unknown) => { // ✅ CORRIGIDO: any → unknown
    if (!shouldLog) return;
    
    console.group(`🔄 [TRANSFORM] ${operation}`);
    console.log('📥 Input:', input);
    console.log('📤 Output:', output);
    console.log('📊 Campos:', Object.keys((output as object) || {}).length);
    console.groupEnd();
  }
};

// ===== FUNÇÕES DE CONVENIÊNCIA =====

// Para remover todos os logs de uma vez (se precisar)
export function disableLogs() {
  // Você pode sobrescrever os métodos se precisar desabilitar completamente
  Object.keys(log).forEach(key => {
    if (typeof log[key as keyof typeof log] === 'function') {
      (log as Record<string, unknown>)[key] = () => {}; // ✅ CORRIGIDO: any → Record<string, unknown>
    }
  });
}

// Para debug condicional 
export function logIf(condition: boolean, level: keyof typeof log, context: string, message: string, data?: unknown) { // ✅ CORRIGIDO: any → unknown
  if (condition && shouldLog) {
    if (level === 'transform') {
      log[level](context, message, data);
    } else {
      (log[level] as (context: string, message: string, data?: unknown) => void)(context, message, data); // ✅ CORRIGIDO: Cast específico
    }
  }
}

// ===== EXPORT DEFAULT =====
export default log;