export function parseAppStoreUrl(input) {
  const value = String(input || '').trim();
  if (!value) {
    throw new Error('App Store URL is required.');
  }

  if (/^\d+$/.test(value)) {
    return {
      appStoreId: value,
      country: 'us',
      slug: '',
    };
  }

  const idMatch = value.match(/id(\d{6,})/i);
  const urlMatch = value.match(
    /https?:\/\/(?:apps|itunes)\.apple\.com\/([^/]+)\/app\/([^/]+)\/id(\d{6,})/i
  );

  if (urlMatch) {
    return {
      country: urlMatch[1].toLowerCase(),
      slug: urlMatch[2],
      appStoreId: urlMatch[3],
    };
  }

  if (idMatch) {
    const parsed = new URL(value);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const country = segments[0] && segments[0].length === 2 ? segments[0].toLowerCase() : 'us';
    return {
      appStoreId: idMatch[1],
      country,
      slug: segments[2] || '',
    };
  }

  throw new Error('Invalid App Store URL. Expected a URL that contains an app id.');
}

export function buildAppStoreUrl({ country = 'us', appStoreId }) {
  return `https://apps.apple.com/${country}/app/id${appStoreId}`;
}
