export async function recordPaddlePayment(supabase, transaction, fallbackEmail = '') {
  const transactionId = transaction?.id ?? '';
  if (!transactionId) return;

  const totals = transaction?.details?.totals ?? {};
  const customerEmail =
    transaction?.customer?.email ??
    transaction?.custom_data?.supabase_email ??
    (fallbackEmail || null);
  const userId = transaction?.custom_data?.supabase_user_id ?? null;
  const amount = totals?.total ? (Number(totals.total) / 100).toFixed(2) : '9.00';
  const captureId = transaction?.details?.payment?.id ?? null;
  const normalizedStatus = (() => {
    switch (transaction?.status) {
      case 'completed':
        return 'captured';
      case 'ready':
        return 'approved';
      case 'draft':
      case 'billed':
        return 'created';
      case 'canceled':
      case 'past_due':
        return 'failed';
      default:
        return 'captured';
    }
  })();

  try {
    const insertResult = await supabase
      .schema('review_copilot')
      .from('rc_payments')
      .insert({
        user_id: userId,
        paypal_order_id: transactionId,
        paypal_capture_id: captureId,
        amount,
        currency: totals?.currency_code ?? 'USD',
        status: normalizedStatus,
        payer_email: customerEmail,
        raw_payload: transaction,
      });

    if (insertResult?.error) {
      throw new Error(insertResult.error.message || 'Unable to store Paddle payment.');
    }

    if (userId && customerEmail) {
      const updateResult = await supabase
        .schema('review_copilot')
        .from('rc_project_users')
        .update({ paypal_email: customerEmail })
        .eq('user_id', userId);

      if (updateResult?.error) {
        throw new Error(updateResult.error.message || 'Unable to update payer email.');
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const isDuplicate =
      message.includes('duplicate') ||
      message.includes('already exists') ||
      message.includes('unique');

    if (!isDuplicate) {
      throw error;
    }
  }
}
