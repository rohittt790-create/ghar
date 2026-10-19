process.env.VERCEL = process.env.VERCEL || '1';
const serverModule = require('../server/dist/index.js');
const app = serverModule.default || serverModule;

module.exports = app;
