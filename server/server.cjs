const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction ? 5000 : (process.env.SERVER_PORT || 3001);
const HOST = isProduction ? '0.0.0.0' : '127.0.0.1';
const JWT_SECRET = process.env.JWT_SECRET || 'localvibe_jwt_secret_2024';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, name, email, avatar, is_organizer FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Token is not valid' });
    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const result = await pool.query('SELECT id, name, email, avatar, is_organizer FROM users WHERE id = $1', [decoded.userId]);
      if (result.rows.length > 0) req.user = result.rows[0];
    }
    next();
  } catch { next(); }
};

app.post('/api/users/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, password } = req.body;
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already registered' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, avatar, is_organizer',
      [name, email, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, isOrganizer: user.is_organizer } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, isOrganizer: user.is_organizer } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, avatar, is_organizer, location_address, location_lng, location_lat, preferences_categories, preferences_radius, org_name, org_description FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const u = result.rows[0];
    res.json({
      id: u.id, name: u.name, email: u.email, avatar: u.avatar, isOrganizer: u.is_organizer,
      location: { address: u.location_address, coordinates: [u.location_lng, u.location_lat] },
      preferences: { categories: u.preferences_categories || [], radius: u.preferences_radius },
      organizerProfile: u.is_organizer ? { organizationName: u.org_name, description: u.org_description } : null
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const formatEvent = (row, userRsvp = null) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  startDate: row.start_date,
  endDate: row.end_date,
  location: { address: row.location_address, coordinates: [row.location_lng, row.location_lat] },
  price: parseFloat(row.price) || 0,
  currency: row.currency,
  image: row.image,
  organizer: { id: row.organizer_id, name: row.organizer_name, email: row.organizer_email || '' },
  organizerName: row.organizer_name,
  isFeatured: row.is_featured,
  maxAttendees: row.max_attendees,
  attendeeCount: parseInt(row.attendee_count) || 0,
  goingCount: parseInt(row.going_count) || 0,
  interestedCount: parseInt(row.interested_count) || 0,
  tags: row.tags || [],
  status: row.status,
  userRsvp: userRsvp
});

const eventsBaseQuery = `
  SELECT e.*,
    u.name as organizer_name_joined, u.email as organizer_email,
    COALESCE((SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id), 0) as attendee_count,
    COALESCE((SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id AND r.status = 'going'), 0) as going_count,
    COALESCE((SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id AND r.status = 'interested'), 0) as interested_count
  FROM events e
  LEFT JOIN users u ON e.organizer_id = u.id
`;

app.get('/api/events', optionalAuth, async (req, res) => {
  try {
    const { category, featured, search, startDate, endDate, minPrice, maxPrice, limit = 20, offset = 0 } = req.query;
    let whereConditions = ["e.status = 'published'"];
    let params = [];
    let paramIndex = 1;

    if (category) { whereConditions.push(`e.category = $${paramIndex++}`); params.push(category); }
    if (featured === 'true') { whereConditions.push('e.is_featured = true'); }
    if (search) { whereConditions.push(`(e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`); params.push(`%${search}%`); paramIndex++; }
    if (startDate) { whereConditions.push(`e.start_date >= $${paramIndex++}`); params.push(startDate); }
    if (endDate) { whereConditions.push(`e.end_date <= $${paramIndex++}`); params.push(endDate); }
    if (minPrice) { whereConditions.push(`e.price >= $${paramIndex++}`); params.push(minPrice); }
    if (maxPrice) { whereConditions.push(`e.price <= $${paramIndex++}`); params.push(maxPrice); }

    const query = `${eventsBaseQuery} WHERE ${whereConditions.join(' AND ')} ORDER BY e.start_date ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    const events = result.rows.map(row => {
      row.organizer_name = row.organizer_name_joined || row.organizer_name;
      return formatEvent(row);
    });

    if (req.user) {
      const eventIds = events.map(e => e.id);
      if (eventIds.length > 0) {
        const rsvps = await pool.query('SELECT event_id, status FROM rsvps WHERE user_id = $1 AND event_id = ANY($2)', [req.user.id, eventIds]);
        const rsvpMap = {};
        rsvps.rows.forEach(r => { rsvpMap[r.event_id] = r.status; });
        events.forEach(e => { e.userRsvp = rsvpMap[e.id] || null; });
      }
    }

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/events/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(`${eventsBaseQuery} WHERE e.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    const row = result.rows[0];
    row.organizer_name = row.organizer_name_joined || row.organizer_name;
    let userRsvp = null;
    if (req.user) {
      const rsvpResult = await pool.query('SELECT status FROM rsvps WHERE event_id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      if (rsvpResult.rows.length > 0) userRsvp = rsvpResult.rows[0].status;
    }
    res.json(formatEvent(row, userRsvp));
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/events', auth, async (req, res) => {
  try {
    const { title, description, category, startDate, endDate, location, price, currency, image, maxAttendees, tags } = req.body;
    const result = await pool.query(
      `INSERT INTO events (title, description, category, start_date, end_date, location_address, location_lng, location_lat, price, currency, image, organizer_id, organizer_name, max_attendees, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [title, description, category, startDate, endDate, location.address, location.coordinates[0], location.coordinates[1],
        price || 0, currency || 'USD', image || '', req.user.id, req.user.name, maxAttendees || null, tags || []]
    );
    res.status(201).json(formatEvent(result.rows[0]));
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/events/:id', auth, async (req, res) => {
  try {
    const existing = await pool.query('SELECT organizer_id FROM events WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    if (existing.rows[0].organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    const { title, description, category, startDate, endDate, location, price, currency, image, maxAttendees, tags } = req.body;
    const result = await pool.query(
      `UPDATE events SET title=$1, description=$2, category=$3, start_date=$4, end_date=$5, location_address=$6,
       location_lng=$7, location_lat=$8, price=$9, currency=$10, image=$11, max_attendees=$12, tags=$13, updated_at=NOW()
       WHERE id=$14 RETURNING *`,
      [title, description, category, startDate, endDate, location.address, location.coordinates[0], location.coordinates[1],
        price || 0, currency || 'USD', image || '', maxAttendees || null, tags || [], req.params.id]
    );
    res.json(formatEvent(result.rows[0]));
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/events/:id', auth, async (req, res) => {
  try {
    const existing = await pool.query('SELECT organizer_id FROM events WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    if (existing.rows[0].organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/events/within-bounds', optionalAuth, async (req, res) => {
  try {
    const { northEast, southWest } = req.body;
    const result = await pool.query(
      `${eventsBaseQuery} WHERE e.status = 'published' AND e.location_lng BETWEEN $1 AND $2 AND e.location_lat BETWEEN $3 AND $4 ORDER BY e.start_date ASC`,
      [southWest[0], northEast[0], southWest[1], northEast[1]]
    );
    const events = result.rows.map(row => {
      row.organizer_name = row.organizer_name_joined || row.organizer_name;
      return formatEvent(row);
    });
    res.json(events);
  } catch (error) {
    console.error('Get events within bounds error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/rsvp/:eventId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const eventResult = await pool.query('SELECT id FROM events WHERE id = $1', [req.params.eventId]);
    if (eventResult.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    await pool.query(
      'INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, $3) ON CONFLICT (event_id, user_id) DO UPDATE SET status = $3, rsvp_date = NOW()',
      [req.params.eventId, req.user.id, status || 'going']
    );
    res.json({ message: 'RSVP updated', status: status || 'going' });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/rsvp/:eventId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM rsvps WHERE event_id = $1 AND user_id = $2', [req.params.eventId, req.user.id]);
    res.json({ message: 'RSVP cancelled' });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/rsvp/:eventId/attendees', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.id, u.name, u.avatar, r.status FROM rsvps r JOIN users u ON r.user_id = u.id WHERE r.event_id = $1',
      [req.params.eventId]
    );
    res.json(result.rows.map(r => ({ id: r.id, name: r.name, avatar: r.avatar, status: r.status })));
  } catch (error) {
    console.error('Get attendees error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
