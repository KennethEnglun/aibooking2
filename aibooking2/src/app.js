import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { initializeDb } from './db.js';
import bookingRouter from './routes/bookingRoutes.js';

// Initialize DayJS plugins
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault('Asia/Hong_Kong');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/health', (_, res) => res.send({ status: 'ok' }));

// Booking routes
app.use('/api', bookingRouter);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', detail: err.message });
});

// Start the server after DB init
initializeDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  }); 