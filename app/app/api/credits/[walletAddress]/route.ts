import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;

    console.log('💰 Fetching credits for wallet:', walletAddress);

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    // Get user credits
    const adCredit = await prisma.adCredit.findUnique({
      where: { walletAddress }
    });

    if (!adCredit) {
      console.log('❌ No credits found for wallet');
      return NextResponse.json({
        walletAddress,
        credits: '0',
        totalEarned: '0',
        totalSpent: '0',
        hasCredits: false
      });
    }

    // Get recent views that earned credits
    const recentViews = await prisma.adView.findMany({
      where: {
        walletAddress,
        creditsEarned: { gt: 0 }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        viewDuration: true,
        creditsEarned: true,
        earnedAt: true,
        placement: {
          select: {
            slot: {
              select: {
                slotIdentifier: true
              }
            }
          }
        }
      }
    });

    console.log(`✅ Found ${adCredit.credits.toString()} XLM in credits`);

    return NextResponse.json({
      walletAddress,
      credits: adCredit.credits.toString(),
      totalEarned: adCredit.totalEarned.toString(),
      totalSpent: adCredit.totalSpent.toString(),
      hasCredits: parseFloat(adCredit.credits.toString()) > 0,
      recentViews: recentViews.map(v => ({
        duration: v.viewDuration,
        earned: v.creditsEarned.toString(),
        earnedAt: v.earnedAt?.toISOString(),
        slotId: v.placement.slot.slotIdentifier
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching credits:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch credits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}