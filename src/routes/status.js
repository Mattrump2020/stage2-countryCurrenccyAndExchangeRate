import express from 'express';
import Country from '../models/Country.js';
import Meta from '../models/Meta.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const total = await Country.countDocuments();
    const meta = await Meta.findOne({ key: 'last_refreshed_at' });
    res.json({
      total_countries: total,
      last_refreshed_at: meta?.value ?? null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
