# Country Currency & Exchange API (Node.js + MongoDB)

This backend API fetches country and currency data, caches it in MongoDB, computes estimated GDP, and generates a summary image.

## Features

- `POST /countries/refresh` — Fetch and cache countries and exchange rates
- `GET /countries` — List countries with filters: `?region=`, `?currency=`, `?sort=gdp_desc|gdp_asc`
- `GET /countries/:name` — Get country by name
- `DELETE /countries/:name` — Delete a country
- `GET /status` — Total countries and last refresh timestamp
- `GET /countries/image` — Serve summary image

## Setup

```bash
git clone https://github.com/Mattrump2020/stage2-countryCurrenccyAndExchangeRate
cd country-currency-api
cp .env
npm install
npm run dev
