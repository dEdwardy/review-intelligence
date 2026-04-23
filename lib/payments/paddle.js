const DEFAULT_SUPPORT_EMAIL = 'reviewtool.support@gmail.com';

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
  };
}

export function isPaddleCheckoutReady() {
  return Boolean(getPaddleConfig().checkoutUrl);
}
