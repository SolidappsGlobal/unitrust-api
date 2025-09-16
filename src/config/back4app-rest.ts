// Configurações do Back4App
export const BACK4APP_CONFIG = {
  applicationId: 'mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK',
  javascriptKey: 'gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX',
  serverURL: 'https://parseapi.back4app.com'
};

// Função para fazer queries via REST API
export async function queryData(className: string, include?: string) {
  try {
    const url = new URL(`/classes/${className}`, BACK4APP_CONFIG.serverURL);
    
    if (include) {
      url.searchParams.append('include', include);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Query ${className} executada com sucesso`);
    return data.results || [];
    
  } catch (error) {
    console.error(`❌ Erro ao query ${className}:`, error);
    throw error;
  }
}

// Função para inicializar (compatibilidade com o componente)
export async function initializeParse() {
  console.log('✅ Usando REST API do Back4App');
  return {
    applicationId: BACK4APP_CONFIG.applicationId,
    Query: (className: string) => ({
      find: async () => {
        return await queryData(className);
      },
      include: function(field: string) {
        return {
          find: async () => {
            return await queryData(className, field);
          }
        };
      }
    }),
    initialize: () => {},
    serverURL: BACK4APP_CONFIG.serverURL
  };
}
