import { parseAppStoreUrl } from './url.js';

export async function fetchAppMetadata(appUrl, { defaultName = 'Unnamed App' } = {}) {
  const { appStoreId, country } = parseAppStoreUrl(appUrl);
  const endpoint = new URL('https://itunes.apple.com/lookup');
  endpoint.searchParams.set('id', appStoreId);
  endpoint.searchParams.set('country', country);
  endpoint.searchParams.set('entity', 'software');

  const response = await fetch(endpoint, {
    headers: {
      'User-Agent': 'Review Copilot/0.1',
    },
  });

  if (!response.ok) {
    throw new Error(`iTunes lookup failed with ${response.status}.`);
  }

  const data = await response.json();
  const item = data?.results?.[0];

  if (!item) {
    return {
      appStoreId,
      country,
      name: defaultName,
      bundleId: '',
      iconUrl: '',
      sellerName: '',
      currentVersion: '',
      averageRating: 0,
      ratingCount: 0,
      appUrl,
    };
  }

  return {
    appStoreId,
    country,
    name: item.trackName || item.collectionName || defaultName,
    bundleId: item.bundleId || '',
    iconUrl: item.artworkUrl100 || item.artworkUrl512 || '',
    sellerName: item.sellerName || '',
    currentVersion: item.version || '',
    averageRating: Number(item.averageUserRating) || 0,
    ratingCount: Number(item.userRatingCount) || 0,
    appUrl: item.trackViewUrl || appUrl,
    genre: item.genres?.[0] || '',
  };
}
