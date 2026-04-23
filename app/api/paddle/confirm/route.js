import { NextResponse } from 'next/server';
import { getPaddleApiKey } from '../../../../lib/payments/paddle.js';
import { recordPaddlePayment } from '../../../../lib/payments/paddle-record.js';
import { getSupabaseServerClient } from '../../../../lib/supabase/server.js';

async function fetchTransaction(transactionId) {
  const apiKey = getPaddleApiKey();
  if (!apiKey) {
    throw new Error('PADDLE_API_KEY is not configured.');
  }

  const response = await fetch(`https://api.paddle.com/transactions/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.detail || 'Unable to fetch Paddle transaction.');
  }

  return payload?.data;
}

async function upgradePaidAccess(supabase, userId) {
  const result = await supabase.rpc('record_paid_analysis', { p_user_id: userId });
  if (result?.error) {
    throw new Error(result.error.message || 'Unable to unlock paid access.');
  }
}

export async function POST(request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const transactionId = body.transactionId || '';
    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId.' }, { status: 400 });
    }

    const transaction = await fetchTransaction(transactionId);
    const customUserId = transaction?.custom_data?.supabase_user_id ?? '';
    const customerEmail = transaction?.customer_id
      ? body.email || user.email || ''
      : user.email || '';

    if (customUserId && customUserId !== user.id) {
      return NextResponse.json(
        { error: 'Transaction does not belong to this user.' },
        { status: 403 }
      );
    }

    if (transaction?.status !== 'completed') {
      return NextResponse.json({ status: transaction?.status || 'pending' });
    }

    await recordPaddlePayment(supabase, transaction, customerEmail);
    await upgradePaidAccess(supabase, user.id);

    return NextResponse.json({
      status: 'completed',
      transactionId,
      customerEmail,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to confirm Paddle payment.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
