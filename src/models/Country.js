import mongoose from 'mongoose';

const CountrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  capital: String,
  region: String,
  population: { type: Number, required: true },
  currency_code: String,
  exchange_rate: Number,
  estimated_gdp: Number,
  flag_url: String,
  last_refreshed_at: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Country', CountrySchema);
