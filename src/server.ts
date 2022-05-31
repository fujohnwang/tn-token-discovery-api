import cors from '@fastify/cors';
import {fastify} from 'fastify';
import {LOGGER} from './constant';
import router from './controllers/router';

export function startApiServer() {
  const FASTIFY_PORT = process.env.FASTIFY_PORT || 3000;
  const FASTIFY_ADDRESS = process.env.FASTIFY_ADDRESS || '127.0.0.1';

  const server = fastify({
    logger: LOGGER,
    trustProxy: true,
  });
  server
    .register(cors)
    .after(err => {
      if (err) {
        console.error(`register plugins failed: ${err.message}`);
        throw err;
      }
    })
    .register(router)
    .ready()
    .then(
      () => {
        LOGGER.info('Server successfully booted!');
      },
      err => {
        LOGGER.trace('Server start error', err);
      }
    );

  server.listen(FASTIFY_PORT, FASTIFY_ADDRESS).then(() => {
    server.log.info(
      `🚀 TN Token Discovery API Server running on port ${FASTIFY_PORT} at ${FASTIFY_ADDRESS}`
    );
  });
}
