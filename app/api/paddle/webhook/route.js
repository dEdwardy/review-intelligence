import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getPaddleWebhookSecret } from '../../../../lib/payments/paddle.js';
import { getSupabaseServerClient } from '../../../../lib/supabase/server.js';

function parseSignature(signatureHeader) {
  const values = Object.fromEntries(
    signatureHeader
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key, value]) => key && value)
  );

  return {
    timestamp: values.ts ?? '',
    hash: values.h1 ?? '',
  };
}

function verifySignature(rawBody, signatureHeader, secret) {
  const { timestamp, hash } = parseSignature(signatureHeader);
  if (!timestamp || !hash) return false;

  const signedPayload = `${timestamp}:${rawBody}`;
  const digest = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

  const left = Buffer.from(digest, 'hex');
  const right = Buffer.from(hash, 'hex');
  if (left.length !== right.length) return false;

  return timingSafeEqual(left, right);
}

export async function POST(request) {
  const secret = getPaddleWebhookSecret();
  if (!secret) {
    return NextResponse.json(
      { error: 'PADDLE_WEBHOOK_SECRET is not configured.' },
      { status: 500 }
    );
  }

  const signatureHeader = request.headers.get('paddle-signature') ?? '';
  const rawBody = await request.text();

  if (!verifySignature(rawBody, signatureHeader, secret)) {
    return NextResponse.json({ error: 'Invalid Paddle signature.' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event?.event_type !== 'transaction.completed') {
    return NextResponse.json({ received: true });
  }

  const userId = event?.data?.custom_data?.supabase_user_id ?? '';
  if (!userId) {
    return NextResponse.json({ received: true, skipped: 'missing_user_id' });
  }

  const supabase = await getSupabaseServerClient();
  await supabase.rpc('record_paid_analysis', { p_user_id: userId });

  return NextResponse.json({ received: true, upgraded: true });
}
