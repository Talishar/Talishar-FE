import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const deploymentUrl = process.argv[2];

if (!deploymentUrl) {
  console.error('Usage: npm run verify:deployment -- https://talishar.net');
  process.exit(2);
}

const assetsDirectory = fileURLToPath(
  new URL('../build/assets/', import.meta.url)
);
const assetNames = (await readdir(assetsDirectory)).filter(
  (assetName) => assetName.endsWith('.js') || assetName.endsWith('.css')
);
const baseUrl = new URL(
  deploymentUrl.endsWith('/') ? deploymentUrl : `${deploymentUrl}/`
);

const expectedContentType = (assetName) =>
  assetName.endsWith('.js') ? /javascript|ecmascript/i : /^text\/css/i;

const verifyAsset = async (assetName) => {
  const url = new URL(`assets/${assetName}`, baseUrl);

  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    const contentType = response.headers.get('content-type') ?? '';

    if (!response.ok) return `${assetName}: HTTP ${response.status}`;
    if (!expectedContentType(assetName).test(contentType)) {
      return `${assetName}: received ${contentType || 'no Content-Type'}`;
    }
    return null;
  } catch (error) {
    return `${assetName}: ${error instanceof Error ? error.message : String(error)}`;
  }
};

const failures = [];
const pending = [...assetNames];
const workerCount = Math.min(10, pending.length);

await Promise.all(
  Array.from({ length: workerCount }, async () => {
    while (pending.length > 0) {
      const assetName = pending.shift();
      if (!assetName) return;
      const failure = await verifyAsset(assetName);
      if (failure) failures.push(failure);
    }
  })
);

if (failures.length > 0) {
  console.error(
    `Deployment verification failed: ${failures.length} of ${assetNames.length} build assets are unavailable.`
  );
  failures.slice(0, 25).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 25) {
    console.error(`- ...and ${failures.length - 25} more`);
  }
  process.exit(1);
}

console.log(
  `Deployment verification passed: ${assetNames.length} build assets are available from ${baseUrl.origin}.`
);
