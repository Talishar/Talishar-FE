interface Env {
  ASSETS: { fetch: (input: URL | Request) => Promise<Response> };
  PREVIEW_BACKEND_URL?: string;
}

interface SharedReplayPreview {
  p1HeroName?: string;
  p2HeroName?: string;
  format?: string;
}

const DEFAULT_BACKEND_URL = 'https://api.talishar.net/game/';
const TOKEN_PATTERN = /^[0-9a-f]{64}$/i;

const fetchPreview = async (
  backendUrl: string,
  token: string
): Promise<SharedReplayPreview | null> => {
  try {
    const response = await fetch(
      `${backendUrl}APIs/GetSharedReplayPreview.php?token=${token}`,
      {
        headers: { 'User-Agent': 'Talishar-Preview/1.0' },
        signal: AbortSignal.timeout(2000)
      }
    );
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
};

export const onRequest = async ({
  request,
  env
}: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const backendUrl = env.PREVIEW_BACKEND_URL ?? DEFAULT_BACKEND_URL;
  const preview = TOKEN_PATTERN.test(token)
    ? await fetchPreview(backendUrl, token)
    : null;
  const page = await env.ASSETS.fetch(new URL('/', url));
  if (!preview?.p1HeroName || !preview.p2HeroName) return page;

  const title = `${preview.p1HeroName} vs ${preview.p2HeroName}`;
  const description = `${
    preview.format || 'Flesh and Blood'
  } replay. Watch the full game on Talishar.`;
  const image = `${backendUrl}APIs/GetSharedReplayImage.php?token=${token}`;
  const content = new Map([
    ['og:url', url.href],
    ['twitter:url', url.href],
    ['og:title', title],
    ['twitter:title', title],
    ['og:description', description],
    ['twitter:description', description],
    ['description', description],
    ['og:image', image],
    ['twitter:image', image],
    ['image', image]
  ]);

  const response = new HTMLRewriter()
    .on('meta', {
      element(element) {
        const value = content.get(
          element.getAttribute('property') ?? element.getAttribute('name') ?? ''
        );
        if (value !== undefined) element.setAttribute('content', value);
      }
    })
    .on('link[rel="canonical"]', {
      element(element) {
        element.setAttribute('href', url.href);
      }
    })
    .on('title', {
      element(element) {
        element.setInnerContent(`${title} | Talishar`);
      }
    })
    .on('head', {
      element(element) {
        element.append(
          '<meta property="og:site_name" content="Talishar" />' +
            '<meta property="og:image:width" content="600" />' +
            '<meta property="og:image:height" content="315" />',
          { html: true }
        );
      }
    })
    .transform(page);

  const headers = new Headers(response.headers);
  headers.delete('etag');
  headers.set('cache-control', 'no-cache');
  return new Response(response.body, { status: response.status, headers });
};
