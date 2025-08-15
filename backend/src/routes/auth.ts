// backend/src/routes/auth.ts
import { FastifyInstance } from 'fastify';
import { pool } from '../db';
import bcrypt from 'bcryptjs';

type LoginBody = { email: string; password: string };

export default async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginBody }>('/login', async (req, reply) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return reply.code(400).send({ ok: false, error: 'missing_fields' });
    }

    const { rows } = await pool.query(
      'SELECT id, username, email, password, role FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    if (rows.length === 0) {
      return reply.code(401).send({ ok: false, error: 'invalid_credentials' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return reply.code(401).send({ ok: false, error: 'invalid_credentials' });
    }

    const token = app.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '7d' }
    );

    // Für dein Admin-Frontend reicht { ok: true } – Token geben wir zusätzlich zurück
    return reply.send({ ok: true, token });
  });
}
