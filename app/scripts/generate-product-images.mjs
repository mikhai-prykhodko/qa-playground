// Generates the product "photos" in public/images/products/*.svg from Material icon paths.
// Run once after changing the catalog:  node app/scripts/generate-product-images.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const iconsDir = join(appDir, '..', 'node_modules', '@mui', 'icons-material');
const outDir = join(appDir, 'public', 'images', 'products');
mkdirSync(outDir, { recursive: true });

// products.json "icon" key → Material icon module
const ICONS = {
  backpack: 'BackpackOutlined',
  bottle: 'LocalDrinkOutlined',
  tool: 'HandymanOutlined',
  gift: 'CardGiftcardOutlined',
  bakery: 'BakeryDiningOutlined',
  tea: 'EmojiFoodBeverageOutlined',
  apparel: 'CheckroomOutlined',
  hiking: 'HikingOutlined',
  coffee: 'CoffeeOutlined',
  winter: 'AcUnitOutlined',
  lantern: 'FlashlightOnOutlined',
  fondue: 'SoupKitchenOutlined',
};

// background gradient per category
const COLORS = {
  bags: ['#dbeafe', '#eff6ff', '#1e3a8a'],
  drinkware: ['#ccfbf1', '#f0fdfa', '#115e59'],
  outdoor: ['#dcfce7', '#f0fdf4', '#166534'],
  food: ['#fef3c7', '#fffbeb', '#92400e'],
  apparel: ['#fce7f3', '#fdf2f8', '#9d174d'],
  home: ['#ede9fe', '#f5f3ff', '#5b21b6'],
};

const products = JSON.parse(readFileSync(join(appDir, 'public', 'api', 'products.json'), 'utf8'));

for (const p of products) {
  const source = readFileSync(join(iconsDir, `${ICONS[p.icon]}.js`), 'utf8');
  const paths = [...source.matchAll(/d: "([^"]+)"/g)].map((m) => m[1]);
  const [from, to, ink] = COLORS[p.category];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-label="${p.name.en}">
  <title>${p.name.en}</title>
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#g)"/>
  <circle cx="320" cy="60" r="90" fill="#ffffff" opacity="0.35"/>
  <ellipse cx="200" cy="250" rx="90" ry="12" fill="${ink}" opacity="0.12"/>
  <g transform="translate(116 58) scale(7)" fill="${ink}">${paths.map((d) => `<path d="${d}"/>`).join('')}</g>
</svg>
`;
  writeFileSync(join(outDir, `${p.id}.svg`), svg);
  console.log(`✓ ${p.id}.svg (${p.icon} → ${ICONS[p.icon]}, ${paths.length} path)`);
}
