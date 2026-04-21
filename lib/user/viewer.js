import { getSupabaseServerClient } from '../supabase/server.js';

export async function getViewer() {
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    return {
      user: null,
      email: '',
      planStatus: 'free',
      freeRemaining: 3,
      totalAnalyses: 0,
    };
  }

  const { data: viewerRow } = await supabase
    .schema('review_copilot')
    .from('rc_project_users')
    .select('plan_status, free_analyses_remaining, total_analyses')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    user,
    email: user.email ?? '',
    planStatus: viewerRow?.plan_status ?? 'free',
    freeRemaining: Number(viewerRow?.free_analyses_remaining ?? 3),
    totalAnalyses: Number(viewerRow?.total_analyses ?? 0),
  };
}
