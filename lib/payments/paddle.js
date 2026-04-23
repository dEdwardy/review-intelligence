const DEFAULT_SUPPORT_EMAIL = 'reviewtool.support@gmail.com';
const PADDLE_TRANSACTION_ID_PATTERN = /^txn_[a-z0-9]+$/i;

export function getPaddleConfig() {
  return {
    provider: 'paddle',
    paymentMode: 'one_time',
    productName: 'Review Intelligence Pro',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL,
    currencySymbol: '$',
    currencyCode: 'USD',
    oneTimeAmount: '9',
    pricingLabel: 'early access',
    purchaseLabel: 'one-time',
    oneTimePriceId: 'pri_01kpws1kpjy14d24stc3mqpes3',
    monthlyPriceId: '',
    yearlyPriceId: '',
    checkoutUrl: process.env.NEXT_PUBLIC_PADDLE_CHECKOUT_URL?.trim() || '',
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim() || '',
  };
}

export function isPaddleCheckoutReady() {
  const { clientToken, checkoutUrl } = getPaddleConfig();
  return Boolean(clientToken || checkoutUrl);
}

export function hasPaddleJsCheckout() {
  return Boolean(getPaddleConfig().clientToken);
}

export function getPaddleApiKey() {
  return process.env.PADDLE_API_KEY?.trim() || '';
}

export function getPaddleWebhookSecret() {
  return process.env.PADDLE_WEBHOOK_SECRET?.trim() || '';
}

export function isValidPaddleTransactionId(transactionId) {
  return (
    typeof transactionId === 'string' &&
    transactionId.length <= 64 &&
    PADDLE_TRANSACTION_ID_PATTERN.test(transactionId)
  );
}

export function validatePaddleTransaction(transaction) {
  const config = getPaddleConfig();
  const items = Array.isArray(transaction?.items) ? transaction.items : [];
  const hasExpectedPrice = items.some((item) => {
    const priceId = item?.price?.id ?? item?.price_id ?? '';
    return priceId === config.oneTimePriceId;
  });

  if (!hasExpectedPrice) {
    throw new Error('Paddle transaction does not match the active Pro price.');
  }

  const currency = transaction?.details?.totals?.currency_code ?? '';
  if (currency && currency !== config.currencyCode) {
    throw new Error('Paddle transaction currency does not match the active price.');
  }
}
