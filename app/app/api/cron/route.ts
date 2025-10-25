import { NextRequest, NextResponse } from 'next/server';

// This endpoint should be called every minute by a cron job
// You can use Vercel Cron, GitHub Actions, or a service like cron-job.org
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log('⚠️ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Cron job triggered at:', new Date().toISOString());

    // Call the queue processor
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/process-queue`, {
      method: 'POST'
    });

    const data = await response.json();
    console.log('✅ Queue processing result:', data);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: data
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    );
  }
}