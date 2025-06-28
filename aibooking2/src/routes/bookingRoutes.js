import express from 'express';
import { getDb } from '../db.js';
import { parseBookingFromText } from '../services/nlpService.js';
import dayjs from 'dayjs';
import pkg from 'rrule';
const { RRule } = pkg;

const router = express.Router();

// Middleware for simple admin authentication using header X-ADMIN-TOKEN & env ADMIN_TOKEN
router.use((req, res, next) => {
  const { path, method } = req;
  if (path.startsWith('/admin')) {
    const token = req.headers['x-admin-token'];
    if (token !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
  next();
});

// POST /api/booking/nlp : create booking based on natural language message
router.post('/booking/nlp', async (req, res, next) => {
  try {
    const { message, title } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const parsed = await parseBookingFromText(message);
    const db = getDb();

    const venueRow = await db.get('SELECT id FROM venues WHERE name = ?', parsed.venue);
    if (!venueRow) return res.status(400).json({ error: `Unknown venue ${parsed.venue}` });

    let bookingIds = [];

    if (parsed.type === 'single') {
      const { start, end } = parsed;
      const result = await db.run(
        'INSERT INTO bookings (venue_id, title, start, end) VALUES (?,?,?,?)',
        [venueRow.id, title || parsed.venue + ' 預訂', start, end]
      );
      bookingIds.push(result.lastID);
    } else if (parsed.type === 'recurring') {
      // store recurrence rule
      const r = await db.run('INSERT INTO recurrences (rule) VALUES (?)', parsed.rrule);
      const recurrenceId = r.lastID;

      // Generate occurrences within 1 year for materialization
      const rule = RRule.fromString(parsed.rrule);
      const until = dayjs().add(1, 'year').toDate();
      const dates = rule.between(new Date(), until, true);

      for (const dt of dates) {
        const start = dayjs(dt);
        const end = start.add(parsed.durationMinutes, 'minute');
        const result = await db.run(
          'INSERT INTO bookings (venue_id, title, start, end, recurrence_id) VALUES (?,?,?,?,?)',
          [venueRow.id, title || parsed.venue + ' 周期預訂', start.toISOString(), end.toISOString(), recurrenceId]
        );
        bookingIds.push(result.lastID);
      }
    }

    res.json({ success: true, bookingIds });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings : list all bookings (optionally view=list|table)
router.get('/bookings', async (req, res, next) => {
  try {
    const db = getDb();
    const rows = await db.all(
      `SELECT b.*, v.name as venue FROM bookings b JOIN venues v ON v.id = b.venue_id ORDER BY start`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Admin endpoints for CRUD
router.get('/admin/bookings/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const row = await db.get(
      `SELECT b.*, v.name as venue FROM bookings b JOIN venues v ON v.id = b.venue_id WHERE b.id = ?`,
      req.params.id
    );
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/admin/bookings/:id', async (req, res, next) => {
  try {
    const { start, end, title } = req.body;
    const db = getDb();
    const result = await db.run(
      `UPDATE bookings SET start = COALESCE(?, start), end = COALESCE(?, end), title = COALESCE(?, title), updated_at=CURRENT_TIMESTAMP WHERE id = ?`,
      [start, end, title, req.params.id]
    );
    res.json({ updated: result.changes });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/bookings/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const result = await db.run('DELETE FROM bookings WHERE id = ?', req.params.id);
    res.json({ deleted: result.changes });
  } catch (err) {
    next(err);
  }
});

export default router; 