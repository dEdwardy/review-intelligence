import AnalysisDashboard from '../../components/analysis-dashboard.jsx';
import { runAnalysis } from '../../lib/analysis/index.js';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '../../lib/supabase/server.js';

function buildNextPath(searchParams) {
  const params = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item == null) return;
        params.append(key, String(item));
      });
      return;
    }
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `/analysis?${query}` : '/analysis';
}

function asString(value) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parseCompetitors(value) {
  const raw = asString(value);
  if (!raw.trim()) return [];
  return raw
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export default async function AnalysisPage({ searchParams }) {
  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const nextPath = buildNextPath(resolvedSearchParams);
  if (!userData?.user) {
    redirect(`/auth?next=${encodeURIComponent(nextPath)}`);
  }

  const appUrl = asString(resolvedSearchParams.app).trim();
  if (!appUrl) {
    redirect('/');
  }
  const competitorUrls = parseCompetitors(resolvedSearchParams.competitors);
  const timeRangeDays = Number(asString(resolvedSearchParams.days)) || 30;
  const ratingFilter = asString(resolvedSearchParams.ratings) || 'all';
  const versionFilter = asString(resolvedSearchParams.version) || 'all';
  const { data: quotaData, error: quotaError } = await supabase.rpc('consume_analysis_quota', {
    p_user_id: userData.user.id,
  });
  if (quotaError) {
    throw new Error(quotaError.message);
  }
  const quotaRow = Array.isArray(quotaData) ? quotaData[0] : quotaData;
  if (!quotaRow?.allowed) {
    redirect(
      `/pricing?upgrade=1&reason=quota_exhausted&remaining=${encodeURIComponent(
        String(quotaRow?.remaining ?? 0)
      )}&next=${encodeURIComponent(nextPath)}`
    );
  }

  const analysis = await runAnalysis({
    appUrl,
    competitorUrls,
    timeRangeDays,
    ratingFilter,
    versionFilter,
  });

  await supabase.rpc('record_analysis_run', {
    p_user_id: userData.user.id,
    p_app_url: appUrl,
    p_competitor_urls: competitorUrls,
    p_time_range_days: timeRangeDays,
    p_rating_filter: ratingFilter,
    p_version_filter: versionFilter,
    p_request_payload: { appUrl, competitorUrls, timeRangeDays, ratingFilter, versionFilter },
    p_response_payload: analysis,
    p_is_paid: quotaRow.plan_status === 'premium',
    p_fee_required: quotaRow.plan_status !== 'premium' && quotaRow.remaining <= 0,
    p_status: 'completed',
  });

  return (
    <AnalysisDashboard
      analysis={analysis}
      viewer={{
        email: userData.user.email ?? '',
        planStatus: quotaRow.plan_status ?? 'free',
        freeRemaining: quotaRow.remaining ?? 0,
      }}
    />
  );
}
