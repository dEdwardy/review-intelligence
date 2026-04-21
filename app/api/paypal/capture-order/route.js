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
      return NextResponse.json(
        { error: 'Please sign in before capturing payment.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const orderId = body.orderId || '';
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId.' }, { status: 400 });
    }

    const { environment } = getPayPalConfig();
    const baseUrl = getPayPalApiBaseUrl(environment);
    const accessToken = await getAccessToken();

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || 'Unable to capture PayPal order.' },
        { status: 400 }
      );
    }

    const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? '';
    await supabase.rpc('record_paypal_payment', {
      p_user_id: user.id,
      p_paypal_order_id: data.id,
      p_paypal_capture_id: captureId || null,
      p_amount: body.amount || '19.00',
      p_currency: body.currency || 'USD',
      p_status: 'captured',
      p_payer_email: body.email || user.email || null,
      p_raw_payload: data,
    });
    await supabase.rpc('record_paid_analysis', { p_user_id: user.id });

    return NextResponse.json({
      status: data.status,
      orderId: data.id,
      captureId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PayPal capture failed.' },
      { status: 400 }
    );
  }
}
