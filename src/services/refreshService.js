import axios from 'axios';
import Country from '../models/Country.js';
import Meta from '../models/Meta.js';
import { generateSummaryImage } from '../utils/image.js';

const COUNTRIES_API = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const RATES_API = 'https://open.er-api.com/v6/latest/USD';

const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pickFirstCurrencyCode = currencies => Array.isArray(currencies) && currencies[0]?.code ? currencies[0].code : null;
const getRandomMultiplier = () => Math.floor(Math.random() * 1001) + 1000;

export const refreshAll = async () => {
  try {
    const [countriesRes, ratesRes] = await Promise.all([
      axios.get(COUNTRIES_API, { timeout: 15000 }),
      axios.get(RATES_API, { timeout: 15000 })
    ]);

    const countries = countriesRes.data;
    const rateMap = ratesRes.data.rates;
    const now = new Date();

    const operations = countries.map(c => {
      const currency_code = pickFirstCurrencyCode(c.currencies);
      const exchange_rate = currency_code ? rateMap[currency_code] ?? null : null;
      const estimated_gdp = exchange_rate
        ? (c.population * getRandomMultiplier()) / exchange_rate
        : currency_code ? null : 0;

      return {
        updateOne: {
          filter: { name: { $regex: new RegExp(`^${escapeRegExp(c.name)}$`, 'i') } },
          update: {
            $set: {
              name: c.name,
              capital: c.capital ?? null,
              region: c.region ?? null,
              population: c.population ?? 0,
              currency_code,
              exchange_rate,
              estimated_gdp,
              flag_url: c.flag ?? null,
              last_refreshed_at: now
            }
          },
          upsert: true
        }
      };
    });

    await Country.bulkWrite(operations, { ordered: false });
    await Meta.findOneAndUpdate({ key: 'last_refreshed_at' }, { value: now }, { upsert: true });

    const top5 = await Country.find({ estimated_gdp: { $ne: null } }).sort({ estimated_gdp: -1 }).limit(5).lean();
    await generateSummaryImage({ total: await Country.countDocuments(), top5, last_refreshed_at: now });

    return { total: await Country.countDocuments(), last_refreshed_at: now };
  } catch (err) {
    const apiName = err?.config?.url?.includes('restcountries.com')
      ? 'Countries API'
      : err?.config?.url?.includes('open.er-api.com')
      ? 'Exchange Rates API'
      : 'External API';
    const error = new Error(`Could not fetch data from ${apiName}`);
    error.isExternal = true;
    throw error;
  }
};
