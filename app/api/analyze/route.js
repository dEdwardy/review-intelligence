import { NextResponse } from 'next/server';
import { runAnalysis } from '../../../lib/analysis/index.js';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const analysis = await runAnalysis({
      appUrl: body.appUrl || '',
      competitorUrls: Array.isArray(body.competitorUrls) ? body.competitorUrls : [],
      timeRangeDays: Number(body.timeRangeDays) || 30,
      ratingFilter: body.ratingFilter || 'all',
      versionFilter: body.versionFilter || 'all',
    });

    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed.' },
      { status: 400 }
    );
  }
}
