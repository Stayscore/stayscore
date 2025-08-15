// backend/src/main.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import authRoutes from './routes/auth.js';

async function start() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.APP_ORIGIN ?? true, // dein Frontend (Render-URL)
  });

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? 'dev_secret',
  });

  // Health
  app.get('/health', async () => ({ ok: true }));

  // >>> Auth-Routen unter /auth
  await app.register(authRoutes, { prefix: '/auth' });

  const port = Number(process.env.APP_PORT ?? 8080);
  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`Server listening on ${port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
