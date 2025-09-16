// Configurações do Back4App
export const BACK4APP_CONFIG = {
  applicationId: 'mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK',
  javascriptKey: 'gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX',
  serverURL: 'https://parseapi.back4app.com'
};

// Função para inicializar o Parse SDK via CDN
export async function initializeParse() {
  try {
    // Verificar se Parse já está disponível no window
    if (typeof window !== 'undefined' && (window as any).Parse) {
      const Parse = (window as any).Parse;
      
      // Verificar se já está inicializado
      if (Parse.applicationId === BACK4APP_CONFIG.applicationId) {
        console.log('✅ Parse SDK já inicializado');
        return Parse;
      }
      
      // Inicializar Parse
      Parse.initialize(BACK4APP_CONFIG.applicationId, BACK4APP_CONFIG.javascriptKey);
      Parse.serverURL = BACK4APP_CONFIG.serverURL;
      
      console.log('✅ Parse SDK inicializado via CDN');
      return Parse;
    }
    
    // Se Parse não está disponível, aguardar um pouco e tentar novamente
    console.log('⏳ Aguardando Parse SDK carregar...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (typeof window !== 'undefined' && (window as any).Parse) {
      const Parse = (window as any).Parse;
      Parse.initialize(BACK4APP_CONFIG.applicationId, BACK4APP_CONFIG.javascriptKey);
      Parse.serverURL = BACK4APP_CONFIG.serverURL;
      
      console.log('✅ Parse SDK inicializado via CDN (retry)');
      return Parse;
    }
    
    throw new Error('Parse SDK não está disponível no window');
    
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
