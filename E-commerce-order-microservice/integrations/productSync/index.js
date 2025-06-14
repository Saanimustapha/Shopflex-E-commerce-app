const syncProductCache = require('./syncService');
require('dotenv').config();

(async () => {
  try {
    await syncProductCache();
    console.log('Product cache synchronization started successfully.');
  } catch (error) {
    console.error('Error starting product cache synchronization:', error.message);
  }
})();
