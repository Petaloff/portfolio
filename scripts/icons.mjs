// Renders the favicon and app icons from public/logo.svg. Run with `npm run icons`
// (sharp comes with Next.js)
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile("public/logo.svg");
// At favicon sizes the gaps between voxels only blur, so tiny icons close them up
// and every voxel lands on whole pixels
const solid = Buffer.from(svg.toString().replaceAll('"3.4"', '"4"').replace('"7.4"', '"8"'));
const png = (size) =>
  sharp(size <= 48 ? solid : svg, { density: 72 * (size / 32) * 2 })
    .resize(size, size)
    .png()
    .toBuffer();

// ICO with embedded PNGs, supported by every current browser
async function ico(sizes) {
  const images = await Promise.all(sizes.map(png));
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((img, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(sizes[i] % 256, entry);
    header.writeUInt8(sizes[i] % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(img.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += img.length;
  });
  return Buffer.concat([header, ...images]);
}

await writeFile("src/app/favicon.ico", await ico([16, 32, 48]));
await writeFile("src/app/icon.svg", svg);
await writeFile("src/app/apple-icon.png", await png(180));
await writeFile("public/icon-192.png", await png(192));
await writeFile("public/icon-512.png", await png(512));
