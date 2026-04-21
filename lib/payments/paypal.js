const SANDBOX_BASE_URL = 'https://api-m.sandbox.paypal.com';
const LIVE_BASE_URL = 'https://api-m.paypal.com';

export function getPayPalConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? '';
  const environment = process.env.PAYPAL_ENVIRONMENT === 'live' ? 'live' : 'sandbox';
  const currency = process.env.PAYPAL_CURRENCY ?? 'USD';
  const amount = process.env.PAYPAL_AMOUNT ?? '19.00';
  const productName = process.env.PAYPAL_PRODUCT_NAME ?? 'Review Copilot Pro';
  const returnUrl = process.env.PAYPAL_RETURN_URL ?? '/billing/success';
  const cancelUrl = process.env.PAYPAL_CANCEL_URL ?? '/pricing';

  return {
    clientId,
    clientSecret,
    environment,
    currency,
    amount,
    productName,
    returnUrl,
    cancelUrl,
  };
}

export function getPayPalApiBaseUrl(environment) {
  return environment === 'live' ? LIVE_BASE_URL : SANDBOX_BASE_URL;
}

export function isPayPalConfigured() {
  const { clientId, clientSecret } = getPayPalConfig();
  return Boolean(clientId && clientSecret);
}
