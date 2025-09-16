// Configurações do Back4App
export const BACK4APP_CONFIG = {
  applicationId: 'mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK',
  javascriptKey: 'gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX',
  serverURL: 'https://parseapi.back4app.com'
};

// Função para inicializar o Parse SDK (versão simples)
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

    // Importação dinâmica do Parse com fallbacks
    let Parse;
    try {
      const ParseModule = await import('parse');
      Parse = ParseModule.default || ParseModule.Parse || ParseModule;
    } catch (importError) {
      console.error('Erro ao importar Parse:', importError);
      throw new Error('Parse SDK não pôde ser carregado');
    }
    
    // Verificar se Parse é válido
    if (!Parse || typeof Parse.initialize !== 'function') {
      throw new Error('Parse SDK não é válido');
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
    
    // Retornar um mock para desenvolvimento
    console.log('🔄 Usando modo fallback (dados mock)');
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
}
