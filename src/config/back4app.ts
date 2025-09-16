// Configurações do Back4App
export const BACK4APP_CONFIG = {
  applicationId: 'mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK',
  javascriptKey: 'gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX',
  serverURL: 'https://parseapi.back4app.com'
};

// Função para inicializar o Parse SDK
export async function initializeParse() {
  try {
    // Verificar se Parse já está inicializado
    if (typeof window !== 'undefined' && (window as any).Parse) {
      const Parse = (window as any).Parse;
      if (Parse.applicationId === BACK4APP_CONFIG.applicationId) {
        console.log('✅ Parse SDK já inicializado');
        return Parse;
      }
    }

    // Importar Parse SDK de forma mais segura
    const ParseModule = await import('parse');
    
    // Tentar diferentes formas de acessar o Parse
    let Parse = ParseModule.default || ParseModule.Parse || ParseModule;
    
    // Se ainda não conseguiu, tentar importação estática
    if (!Parse || typeof Parse.initialize !== 'function') {
      // Fallback: usar importação estática
      const { default: ParseDefault } = await import('parse');
      Parse = ParseDefault;
    }
    
    // Verificar se Parse é válido
    if (!Parse || typeof Parse.initialize !== 'function') {
      throw new Error('Parse SDK não foi carregado corretamente');
    }
    
    // Inicializar Parse
    Parse.initialize(BACK4APP_CONFIG.applicationId, BACK4APP_CONFIG.javascriptKey);
    Parse.serverURL = BACK4APP_CONFIG.serverURL;
    
    // Salvar no window para reutilização
    if (typeof window !== 'undefined') {
      (window as any).Parse = Parse;
    }
    
    console.log('✅ Parse SDK inicializado com sucesso');
    return Parse;
  } catch (error) {
    console.error('❌ Erro ao inicializar Parse SDK:', error);
    
    // Fallback: retornar um mock para desenvolvimento
    console.log('🔄 Usando modo fallback (dados mock)');
    return createMockParse();
  }
}

// Mock do Parse para desenvolvimento
function createMockParse() {
  return {
    applicationId: BACK4APP_CONFIG.applicationId,
    Query: (className: string) => ({
      find: async () => {
        console.log(`Mock: Querying ${className}`);
        return [];
      },
      include: function(field: string) {
        console.log(`Mock: Including ${field}`);
        return this;
      }
    }),
    initialize: () => {},
    serverURL: BACK4APP_CONFIG.serverURL
  };
}
