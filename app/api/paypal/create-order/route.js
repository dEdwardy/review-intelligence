import { NextResponse } from 'next/server';
import {
  getPayPalApiBaseUrl,
  getPayPalConfig,
  isPayPalConfigured,
} from '../../../../lib/payments/paypal.js';
import { getSupabaseServerClient } from '../../../../lib/supabase/server.js';

async function getAccessToken() {
  const { clientId, clientSecret, environment } = getPayPalConfig();
  const baseUrl = getPayPalApiBaseUrl(environment);
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Unable to authenticate with PayPal.');
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ error: 'PayPal is not configured yet.' }, { status: 400 });
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return NextResponse.json({ error: 'Please sign in before purchasing.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { amount, currency, returnUrl, cancelUrl, productName, email } = body;
    const { environment } = getPayPalConfig();
    const baseUrl = getPayPalApiBaseUrl(environment);
    const accessToken = await getAccessToken();

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency || 'USD',
              value: amount || '19.00',
            },
            description: productName || 'Review Copilot Pro',
          },
        ],
        application_context: {
          return_url: `${request.nextUrl.origin}${returnUrl || '/billing/success'}${
            email ? `?email=${encodeURIComponent(email)}` : ''
          }`,
          cancel_url: `${request.nextUrl.origin}${cancelUrl || '/pricing'}`,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || 'Unable to create PayPal order.' },
        { status: 400 }
      );
    }

    const approvalUrl = data.links?.find(
      (link) => link.rel === 'approve' || link.rel === 'payer-action'
    )?.href;
    return NextResponse.json({
      orderId: data.id,
      approvalUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PayPal order creation failed.' },
      { status: 400 }
    );
  }
}
