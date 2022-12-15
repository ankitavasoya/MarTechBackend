import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Export configuration object
export const Config = {
  // HTTP Port to run our web application
  port: process.env.PORT || 4000,

  backendURL: process.env.API_URL,
};
