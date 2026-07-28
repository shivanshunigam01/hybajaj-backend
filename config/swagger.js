const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'HY Bajaj API Docs',
    explorer: true,
  }));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerDocument));
};

module.exports = { setupSwagger };
