
const isDev = process.env.NODE_ENV === 'development';

// ===== FUNÇÃO PRINCIPAL =====
function createLog(level: string, emoji: string, color: string) {
  return (context: string, message: string, data?: any) => {
    // Só mostra logs em desenvolvimento
    if (!isDev) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `${emoji} [${timestamp}] ${level} [${context}] ${message}`;
    
    // Escolher o método de console baseado no level
    const consoleMethod = level === 'ERROR' ? console.error : 
                         level === 'WARN' ? console.warn : 
                         console.log;
    
    if (data) {
      consoleMethod(formattedMessage, data);
    } else {
      consoleMethod(formattedMessage);
    }
  };
}

// ===== TIPOS DE LOG =====
export const log = {
  // Geral
  info: createLog('INFO', 'ℹ️', 'blue'),
  success: createLog('SUCCESS', '✅', 'green'),
  warn: createLog('WARN', '⚠️', 'yellow'),
  error: createLog('ERROR', '❌', 'red'),
  debug: createLog('DEBUG', '🐛', 'purple'),

  // Contextos específicos (shortcuts)
  auth: (message: string, data?: any) => {
    if (!isDev) return;
    console.log(`🔐 [AUTH] ${message}`, data || '');
  },

  api: (message: string, data?: any) => {
    if (!isDev) return;
    console.log(`🌐 [API] ${message}`, data || '');
  },

  form: (message: string, data?: any) => {
    if (!isDev) return;
    console.log(`📝 [FORM] ${message}`, data || '');
  },

  hook: (message: string, data?: any) => {
    if (!isDev) return;
    console.log(`⚛️ [HOOK] ${message}`, data || '');
  },

  cache: (message: string, data?: any) => {
    if (!isDev) return;
    console.log(`💾 [CACHE] ${message}`, data || '');
  },

  // Grupos (para operações complexas)
  group: (context: string, title: string) => {
    if (!isDev) return;
    console.group(`🔍 [${context}] ${title}`);
  },

  groupEnd: () => {
    if (!isDev) return;
    console.groupEnd();
  },

  // Performance
  time: (label: string) => {
    if (!isDev) return;
    console.time(`⏱️ ${label}`);
  },

  timeEnd: (label: string) => {
    if (!isDev) return;
    console.timeEnd(`⏱️ ${label}`);
  },

  // Transformação de dados
  transform: (operation: string, input: any, output: any) => {
    if (!isDev) return;
    
    console.group(`🔄 [TRANSFORM] ${operation}`);
    console.log('📥 Input:', input);
    console.log('📤 Output:', output);
    console.log('📊 Campos:', Object.keys(output).length);
    console.groupEnd();
  }
};


export default log;