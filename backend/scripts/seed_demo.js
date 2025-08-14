import pg from 'pg';
const { Pool } = pg;

const demoSQL = `
INSERT INTO app_user (role, username, consent_privacy) VALUES
('guest', 'SunnyTraveller', true) ON CONFLICT DO NOTHING;
INSERT INTO app_user (role, username, consent_privacy) VALUES
('guest', 'BusinessBob', true) ON CONFLICT DO NOTHING;
INSERT INTO app_user (role, username, consent_privacy) VALUES
('guest', 'AnnaHoliday', true) ON CONFLICT DO NOTHING;

INSERT INTO app_user (role, email, password_hash, consent_privacy) VALUES
('venue', 'hotel.alpenblick@example.com', 'Passwort123', true) ON CONFLICT (email) DO NOTHING;
INSERT INTO app_user (role, email, password_hash, consent_privacy) VALUES
('venue', 'cafe.morgenrot@example.com', 'Passwort123', true) ON CONFLICT (email) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM venue WHERE name='Hotel Alpenblick') THEN
    INSERT INTO venue (name, city, country, verification_status, created_by)
    VALUES ('Hotel Alpenblick', 'München', 'DE', 'verified',
      (SELECT id FROM app_user WHERE email='hotel.alpenblick@example.com'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM venue WHERE name='Café Morgenrot') THEN
    INSERT INTO venue (name, city, country, verification_status, created_by)
    VALUES ('Café Morgenrot', 'Berlin', 'DE', 'verified',
      (SELECT id FROM app_user WHERE email='cafe.morgenrot@example.com'));
  END IF;
END$$;

INSERT INTO stay (venue_id, guest_id, checkin_date, checkout_date, source, status)
SELECT v.id, g.id, '2025-08-01', '2025-08-03', 'qr', 'completed'
FROM venue v, app_user g
WHERE v.name='Hotel Alpenblick' AND g.username='SunnyTraveller'
ON CONFLICT DO NOTHING;

INSERT INTO stay (venue_id, guest_id, checkin_date, checkout_date, source, status)
SELECT v.id, g.id, '2025-07-15', '2025-07-16', 'qr', 'completed'
FROM venue v, app_user g
WHERE v.name='Hotel Alpenblick' AND g.username='BusinessBob'
ON CONFLICT DO NOTHING;

INSERT INTO stay (venue_id, guest_id, checkin_date, checkout_date, source, status)
SELECT v.id, g.id, '2025-08-05', '2025-08-05', 'qr', 'completed'
FROM venue v, app_user g
WHERE v.name='Café Morgenrot' AND g.username='AnnaHoliday'
ON CONFLICT DO NOTHING;

INSERT INTO rating (stay_id, stars, comment, created_by)
SELECT s.id, 5, 'Fantastischer Ausblick und super Service!', s.guest_id
FROM stay s JOIN venue v ON s.venue_id=v.id
WHERE v.name='Hotel Alpenblick' AND s.checkin_date='2025-08-01'
ON CONFLICT DO NOTHING;

INSERT INTO rating (stay_id, stars, comment, created_by)
SELECT s.id, 4, 'Sehr sauber, aber Frühstück könnte besser sein.', s.guest_id
FROM stay s JOIN venue v ON s.venue_id=v.id
WHERE v.name='Hotel Alpenblick' AND s.checkin_date='2025-07-15'
ON CONFLICT DO NOTHING;

INSERT INTO rating (stay_id, stars, comment, created_by)
SELECT s.id, 5, 'Leckerster Cappuccino der Stadt!', s.guest_id
FROM stay s JOIN venue v ON s.venue_id=v.id
WHERE v.name='Café Morgenrot'
ON CONFLICT DO NOTHING;

INSERT INTO reply (rating_id, venue_id, message)
SELECT r.id, v.id, 'Vielen Dank, wir freuen uns auf Ihren nächsten Besuch!'
FROM rating r JOIN stay s ON r.stay_id=s.id JOIN venue v ON s.venue_id=v.id
WHERE v.name='Hotel Alpenblick' AND r.stars=5
ON CONFLICT DO NOTHING;

INSERT INTO promotion (venue_id, title, min_stars, code, valid_from, valid_to, active)
SELECT v.id, '10% Rabatt für 5-Sterne-Gäste', 5, 'ALPEN10', '2025-08-01', '2025-12-31', true
FROM venue v WHERE v.name='Hotel Alpenblick'
ON CONFLICT DO NOTHING;
`;

async function run(){
  if (process.env.SEED_DEMO !== '1') { 
    console.log('Skipping demo seed (SEED_DEMO != 1)');
    return;
  }
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'stayscore',
    user: process.env.POSTGRES_USER || 'stayscore',
    password: process.env.POSTGRES_PASSWORD || 'stayscore',
  });
  await pool.query(demoSQL);
  await pool.end();
  console.log('Demo data seeded');
}
run().catch(e => { console.error(e); process.exit(1); });
