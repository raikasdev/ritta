import loaders from './loaders';
import fastify from 'fastify';
import logger from './logger';
import api from './api';
import config from './config';

logger.info('Starting Ritta Server');

const app = fastify({ trustProxy: true, logger: true, pluginTimeout: 20000 });

await loaders({ fastifyApp: app });

app.register(api, { prefix: '/api' });

app.all('/', {}, (_, res) => {
  res.redirect(config.frontUrl);
});

app.setNotFoundHandler((_, reply) => {
  reply.code(404).send({ message: 'Not found' });
});

try {
  await app.listen(process.env.PORT || 3000);
  logger.info(
    `Ritta Server is now running on port ${process.env.PORT || 3000}`
  );
} catch (e) {
  logger.error(e);
  process.exit(1);
}
