import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'PayPal capture is deprecated for this project. Use the Paddle one-time checkout.',
      code: 'payment_provider_disabled',
    },
    { status: 410 }
  );
}
