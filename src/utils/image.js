import PImage from 'pureimage';
import fs from 'fs';
import path from 'path';

export const generateSummaryImage = async ({ total, top5, last_refreshed_at }) => {
  const width = 800;
  const height = 600;
  const img = PImage.make(width, height);
  const ctx = img.getContext('2d');

  // Register and load font
  const fontPath = path.resolve('src/utils/fonts/OpenSans-Regular.ttf');
  const font = PImage.registerFont(fontPath, 'OpenSans');
  await font.load();

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#000000';
  ctx.font = '24pt OpenSans';
  ctx.fillText('Country Cache Summary', 20, 40);

  // Metadata
  ctx.font = '14pt OpenSans';
  ctx.fillText(`Total countries: ${total}`, 20, 80);
  ctx.fillText(`Last refreshed: ${last_refreshed_at.toISOString()}`, 20, 110);
  ctx.fillText('Top 5 countries by estimated GDP:', 20, 150);

  // Top 5 list
  ctx.font = '12pt OpenSans';
  let y = 180;
  if (top5?.length > 0) {
    top5.forEach((c, i) => {
      ctx.fillText(`${i + 1}. ${c.name} — ${c.estimated_gdp?.toFixed(2) ?? 'N/A'}`, 30, y);
      y += 30;
    });
  } else {
    ctx.fillText('No GDP data available', 30, y);
  }

  // Save image
  const cacheDir = path.resolve('cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const outPath = path.join(cacheDir, 'summary.png');
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(outPath);
    PImage.encodePNGToStream(img, out).then(resolve).catch(reject);
  });
};
