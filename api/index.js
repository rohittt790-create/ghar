const path = require('path');
const fs = require('fs');

let app = null;
let loadError = null;

try {
  process.env.VERCEL = process.env.VERCEL || '1';

  const candidates = [
    path.resolve(__dirname, '../server/dist/index.js'),
    path.resolve(process.cwd(), 'server/dist/index.js'),
    path.resolve(__dirname, './server/dist/index.js'),
    path.resolve(__dirname, 'server/dist/index.js'),
  ];

  let resolvedPath = candidates.find((p) => fs.existsSync(p));

  if (!resolvedPath) {
    let dirnameFiles = [];
    try {
      dirnameFiles = fs.readdirSync(__dirname);
    } catch (e) {}

    let cwdFiles = [];
    try {
      cwdFiles = fs.readdirSync(process.cwd());
    } catch (e) {}

    throw new Error(
      `Could not find server/dist/index.js. Checked: ${JSON.stringify(candidates)}. ` +
      `__dirname: ${__dirname} (${JSON.stringify(dirnameFiles)}), ` +
      `process.cwd(): ${process.cwd()} (${JSON.stringify(cwdFiles)})`
    );
  }

  const serverModule = require(resolvedPath);
  app = serverModule.default || serverModule;
} catch (err) {
  loadError = err;
}

module.exports = (req, res) => {
  if (loadError) {
    return res.status(500).json({
      success: false,
      error: 'Vercel Serverless Function Init Error',
      message: loadError.message,
      stack: loadError.stack,
    });
  }

  try {
    if (req.url && (req.url === '/api/index.js' || req.url.startsWith('/api/index.js?'))) {
      const original =
        req.headers['x-matched-path'] ||
        req.headers['x-forwarded-uri'] ||
        req.originalUrl;
      if (original && original !== '/api/index.js') {
        req.url = original;
      }
    }
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Vercel Serverless Function Runtime Error',
      message: err.message,
      stack: err.stack,
    });
  }
};
