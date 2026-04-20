import AnalysisDashboard from '../../components/analysis-dashboard.jsx';
import { runAnalysis } from '../../lib/analysis/index.js';
import { redirect } from 'next/navigation';

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
  const appUrl = asString(searchParams?.app).trim();
  if (!appUrl) {
    redirect('/');
  }
  const competitorUrls = parseCompetitors(searchParams?.competitors);
  const timeRangeDays = Number(asString(searchParams?.days)) || 30;
  const ratingFilter = asString(searchParams?.ratings) || 'all';
  const versionFilter = asString(searchParams?.version) || 'all';

  const analysis = await runAnalysis({
    appUrl,
    competitorUrls,
    timeRangeDays,
    ratingFilter,
    versionFilter,
  });

  return <AnalysisDashboard analysis={analysis} />;
}
