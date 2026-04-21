const DEFAULT_PROJECT_DISPLAY_NAME = 'Review Copilot';
const DEFAULT_SITE_URL = 'http://localhost:3000';

export function getProjectDisplayName() {
  return process.env.RC_PROJECT_DISPLAY_NAME?.trim() || DEFAULT_PROJECT_DISPLAY_NAME;
}

export function getStoragePrefix() {
  return 'review-copilot';
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
}
