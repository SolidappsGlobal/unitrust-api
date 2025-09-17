// Back4App Configuration
export const BACK4APP_CONFIG = {
  applicationId: 'mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK',
  javascriptKey: 'gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX',
  serverURL: 'https://parseapi.back4app.com'
};

// Function to initialize Parse SDK via CDN
export async function initializeParse() {
  try {
    // Check if Parse is already available in window
    if (typeof window !== 'undefined' && (window as any).Parse) {
      const Parse = (window as any).Parse;
      
      // Check if already initialized
      if (Parse.applicationId === BACK4APP_CONFIG.applicationId) {
        console.log('✅ Parse SDK already initialized');
        return Parse;
      }
      
      // Initialize Parse
      Parse.initialize(BACK4APP_CONFIG.applicationId, BACK4APP_CONFIG.javascriptKey);
      Parse.serverURL = BACK4APP_CONFIG.serverURL;
      
      console.log('✅ Parse SDK initialized via CDN');
      return Parse;
    }
    
    // If Parse is not available, wait a bit and try again
    console.log('⏳ Waiting for Parse SDK to load...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (typeof window !== 'undefined' && (window as any).Parse) {
      const Parse = (window as any).Parse;
      Parse.initialize(BACK4APP_CONFIG.applicationId, BACK4APP_CONFIG.javascriptKey);
      Parse.serverURL = BACK4APP_CONFIG.serverURL;
      
      console.log('✅ Parse SDK initialized via CDN (retry)');
      return Parse;
    }
    
    throw new Error('Parse SDK is not available in window');
    
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
