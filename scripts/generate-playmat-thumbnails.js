const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const PLAYMATS_DIR = path.resolve(__dirname, '../public/playmats');
const THUMBNAILS_DIR = path.join(PLAYMATS_DIR, 'thumbnails');
const THUMBNAIL_WIDTH = 320;

async function generatePlaymatThumbnails() {
  await fs.mkdir(THUMBNAILS_DIR, { recursive: true });

  const entries = await fs.readdir(PLAYMATS_DIR, { withFileTypes: true });
  const playmats = entries
    .filter(
      (entry) =>
        entry.isFile() && path.extname(entry.name).toLowerCase() === '.webp'
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const playmat of playmats) {
    const source = path.join(PLAYMATS_DIR, playmat.name);
    const destination = path.join(THUMBNAILS_DIR, playmat.name);

    await sharp(source)
      .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(destination);
  }

  console.log(
    `Generated ${playmats.length} playmat thumbnails in ${THUMBNAILS_DIR}`
  );
}

generatePlaymatThumbnails().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
