// backend/src/routes/ratings.ts
import { FastifyInstance } from 'fastify';
import { pool } from '../db';

export default async function ratingsRoutes(app: FastifyInstance) {
  app.get('/', async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ ok: false, error: 'unauthorized' });
    }
    const { sub } = req.user as { sub: string };

    const { rows } = await pool.query(
      `SELECT r.id, r.stars, r.comment, v.name AS venue
       FROM rating r
       JOIN stay s ON r.stay_id = s.id
       JOIN venue v ON s.venue_id = v.id
       WHERE v.created_by = $1
       ORDER BY r.created_at DESC`,
      [sub]
    );

    return rows;
  });
}
