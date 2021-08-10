import * as fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import cors from 'fastify-cors';
import helmet from 'fastify-helmet';
import rateLimit from 'fastify-rate-limit';

export default async ({
  app,
}: {
  app: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>;
}): Promise<
  fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>
> => {
  app.get('/status', {}, (req, res) => {
    res.status(204);
  });
  app.head('/status', {}, (req, res) => {
    res.status(204);
  });

  await app.register(cors);
  await app.register(helmet);
  await app.register(rateLimit, {
    global: false,
    max: 5,
    timeWindow: '1 minute',
  });
  // Return the fastify app
  return app;
};
