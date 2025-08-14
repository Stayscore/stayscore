import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from '@fastify/jwt';
import pkg from 'pg';
const { Pool } = pkg;

const app = Fastify({ logger: true });

await app.register(cors, { origin: process.env.APP_ORIGIN?.split(',') ?? true });
await app.register(jwtPlugin, { secret: process.env.JWT_SECRET || 'dev' });

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB || 'stayscore',
  user: process.env.POSTGRES_USER || 'stayscore',
  password: process.env.POSTGRES_PASSWORD || 'stayscore',
});

app.get('/health', async () => ({ ok: true }));

app.post('/auth/venue/signup', async (req, reply) => {
  const email = (req.body as any)?.email;
  const password = (req.body as any)?.password;
  if (!email || !password) return reply.code(400).send({ error: 'email & password required' });
  const r = await pool.query(
    'insert into app_user(role,email,password_hash) values($1,$2,$3) returning id',
    ['venue', email, password]
  );
  return { id: r.rows[0].id };
});

app.post('/auth/login', async (req, reply) => {
  const { email, password } = (req.body as any) || {};
  const r = await pool.query('select id, role, password_hash from app_user where email=$1', [email]);
  if (!r.rowCount || r.rows[0].password_hash !== password) return reply.code(401).send({ error: 'invalid' });
  const token = app.jwt.sign({ sub: r.rows[0].id, role: r.rows[0].role });
  return { token };
});

app.get('/ratings', async () => {
  const q = `
    select r.id, r.stars, r.comment, v.name as venue, r.created_at
    from rating r
    join stay s on r.stay_id = s.id
    join venue v on s.venue_id = v.id
    order by r.created_at desc
    limit 20
  `;
  const r = await pool.query(q);
  return r.rows;
});

app.addHook('onClose', async () => { await pool.end(); });

const port = Number(process.env.APP_PORT || 8080);
app.listen({ port, host: '0.0.0.0' }).catch(err => {
  app.log.error(err);
  process.exit(1);
});
