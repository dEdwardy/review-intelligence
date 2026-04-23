const DEFAULT_PROJECT_DISPLAY_NAME = 'Review Copilot';

export function getProjectDisplayName() {
  return process.env.RC_PROJECT_DISPLAY_NAME?.trim() || DEFAULT_PROJECT_DISPLAY_NAME;
}

export function getStoragePrefix() {
  return 'review-copilot';
}
