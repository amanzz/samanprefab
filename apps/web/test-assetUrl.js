const { API_CONFIG } = require('./src/lib/api.ts');
console.log(API_CONFIG.assetUrl('uploads/test.png'));
console.log(API_CONFIG.assetUrl('/uploads/test.png'));
