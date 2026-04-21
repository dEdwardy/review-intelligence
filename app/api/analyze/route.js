import { NextResponse } from 'next/server';
import { runAnalysis } from '../../../lib/analysis/index.js';
import { getSupabaseServerClient } from '../../../lib/supabase/server.js';

export async function POST(request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return NextResponse.json(
        {
          error: 'Sign in required.',
          code: 'unauthenticated',
          actionUrl: '/auth?next=/analysis',
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { data: quotaData, error: quotaError } = await supabase.rpc('consume_analysis_quota', {
      p_user_id: user.id,
    });
    if (quotaError) {
      return NextResponse.json({ error: quotaError.message }, { status: 400 });
    }

    const quotaRow = Array.isArray(quotaData) ? quotaData[0] : quotaData;
    if (!quotaRow?.allowed) {
      return NextResponse.json(
        {
          error: 'Free quota exhausted (3 runs). Upgrade to continue.',
          code: 'quota_exhausted',
          remaining: quotaRow?.remaining ?? 0,
          actionUrl: '/pricing?upgrade=1',
        },
        { status: 402 }
      );
    }

    const analysis = await runAnalysis({
      appUrl: body.appUrl || '',
      competitorUrls: Array.isArray(body.competitorUrls) ? body.competitorUrls : [],
      timeRangeDays: Number(body.timeRangeDays) || 30,
      ratingFilter: body.ratingFilter || 'all',
      versionFilter: body.versionFilter || 'all',
    });

    await supabase.rpc('record_analysis_run', {
      p_user_id: user.id,
      p_app_url: body.appUrl || '',
      p_competitor_urls: Array.isArray(body.competitorUrls) ? body.competitorUrls : [],
      p_time_range_days: Number(body.timeRangeDays) || 30,
      p_rating_filter: body.ratingFilter || 'all',
      p_version_filter: body.versionFilter || 'all',
      p_request_payload: body,
      p_response_payload: analysis,
      p_is_paid: quotaRow.plan_status === 'premium',
      p_fee_required: quotaRow.plan_status !== 'premium' && quotaRow.remaining <= 0,
      p_status: 'completed',
    });

    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed.' },
      { status: 400 }
    );
  }
}
