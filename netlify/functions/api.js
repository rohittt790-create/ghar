const serverless = require('serverless-http');
const path = require('path');
const fs = require('fs');

process.env.NETLIFY = 'true';

let app = null;
let loadError = null;

try {
  const candidates = [
    path.resolve(__dirname, '../../server/dist/index.js'),
    path.resolve(process.cwd(), 'server/dist/index.js'),
    path.resolve(__dirname, './server/dist/index.js'),
    path.resolve(__dirname, 'server/dist/index.js'),
  ];

  const resolvedPath = candidates.find((p) => fs.existsSync(p));

  if (!resolvedPath) {
    throw new Error(`Could not find server/dist/index.js. Checked: ${JSON.stringify(candidates)}`);
  }

  const serverModule = require(resolvedPath);
  app = serverModule.default || serverModule;
} catch (err) {
  loadError = err;
}

const handlerWithNetlifyBase = app ? serverless(app, { basePath: '/.netlify/functions/api' }) : null;
const handlerDefault = app ? serverless(app) : null;

exports.handler = async (event, context) => {
  if (loadError) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Netlify Function Init Error',
        message: loadError.message,
        stack: loadError.stack,
      }),
    };
  }

  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    return await handlerWithNetlifyBase(event, context);
  }
  return await handlerDefault(event, context);
};
