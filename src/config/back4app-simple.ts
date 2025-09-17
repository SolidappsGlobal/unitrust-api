// Back4App Configuration
export const BACK4APP_CONFIG = {
  applicationId: 'mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK',
  javascriptKey: 'gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX',
  serverURL: 'https://parseapi.back4app.com'
};

// Function to initialize Parse SDK (simple version)
export async function initializeParse() {
  try {
    // Check if Parse is already initialized
    if (typeof window !== 'undefined' && (window as any).Parse) {
      const Parse = (window as any).Parse;
      if (Parse.applicationId === BACK4APP_CONFIG.applicationId) {
        console.log('✅ Parse SDK already initialized');
        return Parse;
      }
    }

    // Dynamic Parse import with fallbacks
    let Parse;
    try {
      const ParseModule = await import('parse');
      Parse = ParseModule.default || ParseModule.Parse || ParseModule;
    } catch (importError) {
      console.error('Error importing Parse:', importError);
      throw new Error('Parse SDK could not be loaded');
    }
    
    // Check if Parse is valid
    if (!Parse || typeof Parse.initialize !== 'function') {
      throw new Error('Parse SDK is not valid');
    }
    
    // Initialize Parse
    Parse.initialize(BACK4APP_CONFIG.applicationId, BACK4APP_CONFIG.javascriptKey);
    Parse.serverURL = BACK4APP_CONFIG.serverURL;
    
    // Save to window for reuse
    if (typeof window !== 'undefined') {
      (window as any).Parse = Parse;
    }
    
    console.log('✅ Parse SDK initialized successfully');
    return Parse;
  } catch (error) {
    console.error('❌ Error initializing Parse SDK:', error);
    
    // Return a mock for development
    console.log('🔄 Using fallback mode (mock data)');
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
