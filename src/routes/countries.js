import express from 'express';
import path from 'path';
import fs from 'fs';
import Country from '../models/Country.js';
import { refreshAll } from '../services/refreshService.js';

const router = express.Router();

router.post('/refresh', async (req, res) => {
  try {
    const result = await refreshAll();
    res.json({
      message: 'Refresh successful',
      total: result.total,
      last_refreshed_at: result.last_refreshed_at.toISOString()
    });
  } catch (err) {
    if (err.isExternal) {
      return res.status(503).json({
        error: 'External data source unavailable',
        details: err.message
      });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/', async (req, res) => {
  try {
    const { region, currency, sort } = req.query;
    const filter = {};
    if (region) filter.region = region;
    if (currency) filter.currency_code = currency;

    let query = Country.find(filter).select('-__v');

    if (sort === 'gdp_desc') query = query.sort({ estimated_gdp: -1 });
    else if (sort === 'gdp_asc') query = query.sort({ estimated_gdp: 1 });

    const results = await query.exec();
    res.json(results.map(r => ({
      id: r._id,
      name: r.name,
      capital: r.capital,
      region: r.region,
      population: r.population,
      currency_code: r.currency_code || null,
      exchange_rate: r.exchange_rate ?? null,
      estimated_gdp: r.estimated_gdp ?? null,
      flag_url: r.flag_url,
      last_refreshed_at: r.last_refreshed_at?.toISOString() ?? null
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:name', async (req, res) => {
  try {
    const country = await Country.findOne({ name: new RegExp(`^${req.params.name}$`, 'i') });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    res.json({
      id: country._id,
      name: country.name,
      capital: country.capital,
      region: country.region,
      population: country.population,
      currency_code: country.currency_code || null,
      exchange_rate: country.exchange_rate ?? null,
      estimated_gdp: country.estimated_gdp ?? null,
      flag_url: country.flag_url,
      last_refreshed_at: country.last_refreshed_at?.toISOString() ?? null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:name', async (req, res) => {
  try {
    const result = await Country.findOneAndDelete({ name: new RegExp(`^${req.params.name}$`, 'i') });
    if (!result) return res.status(404).json({ error: 'Country not found' });
    res.json({ message: 'Country deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/image', async (req, res) => {
  try {
    const cachePath = path.resolve(process.env.CACHE_PATH || 'cache/summary.png');
    if (!fs.existsSync(cachePath)) return res.status(404).json({ error: 'Summary image not found' });
    res.sendFile(cachePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
