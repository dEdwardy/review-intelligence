import { redirect } from 'next/navigation';
import AuthForm from '../../components/auth-form.jsx';
import { getSupabaseServerClient } from '../../lib/supabase/server.js';

function asString(value) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function AuthPage({ searchParams }) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
    const nextPath = asString(resolvedSearchParams.next) || '/';
    redirect(nextPath);
  }

  return <AuthForm />;
}
