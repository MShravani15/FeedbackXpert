const config = {
    local: {
      baseUrl: window.location.origin
    },
    production: {
      baseUrl: "https://feedbackxpert-86d7c.web.app"
    }
  };
  
  const environment = window.location.host.includes('web.app') 
    ? 'production' 
    : 'local';
  
  export const BASE_URL = config[environment].baseUrl;