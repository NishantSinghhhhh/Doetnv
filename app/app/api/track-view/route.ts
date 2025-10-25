import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placementId, sessionId, viewDuration, slotId, walletAddress } = body;

    console.log('📊 View tracking request:', { placementId, sessionId, viewDuration, walletAddress });

    if (!placementId || !sessionId || !viewDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate credits earned based on view duration
    let creditsEarned = 0;
    if (viewDuration >= 60) {
      creditsEarned = 0.10; // 1 minute = 0.10 XLM
    } else if (viewDuration >= 30) {
      creditsEarned = 0.05; // 30 seconds = 0.05 XLM
    } else if (viewDuration >= 10) {
      creditsEarned = 0.01; // 10 seconds = 0.01 XLM
    }

    console.log(`💰 Credits earned: ${creditsEarned} XLM for ${viewDuration}s view`);

    // Check if this session already tracked this ad
    const existingView = await prisma.adView.findFirst({
      where: {
        placementId,
        sessionId
      }
    });

    if (existingView) {
      // Update existing view if duration increased
      if (viewDuration > existingView.viewDuration) {
        await prisma.adView.update({
          where: { id: existingView.id },
          data: {
            viewDuration,
            creditsEarned: creditsEarned > existingView.creditsEarned.toNumber() 
              ? creditsEarned 
              : existingView.creditsEarned.toNumber(),
            earnedAt: creditsEarned > 0 && !existingView.earnedAt ? new Date() : existingView.earnedAt,
            walletAddress: walletAddress || existingView.walletAddress
          }
        });

        console.log('✅ Updated existing view');
      }
    } else {
      // Create new view record
      await prisma.adView.create({
        data: {
          placementId,
          sessionId,
          viewDuration,
          creditsEarned,
          earnedAt: creditsEarned > 0 ? new Date() : null,
          walletAddress: walletAddress || null,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null
        }
      });

      console.log('✅ Created new view record');

      // Increment view count on placement
      await prisma.adPlacement.update({
        where: { id: placementId },
        data: {
          viewCount: { increment: 1 }
        }
      });
    }

    // If wallet is connected and credits were earned, update AdCredit
    if (walletAddress && creditsEarned > 0) {
      const existingCredit = await prisma.adCredit.findUnique({
        where: { walletAddress }
      });

      if (existingCredit) {
        // Add credits to existing account
        await prisma.adCredit.update({
          where: { walletAddress },
          data: {
            credits: { increment: creditsEarned },
            totalEarned: { increment: creditsEarned }
          }
        });
        console.log(`✅ Added ${creditsEarned} XLM to wallet ${walletAddress}`);
      } else {
        // Create new credit account
        await prisma.adCredit.create({
          data: {
            walletAddress,
            credits: creditsEarned,
            totalEarned: creditsEarned,
            totalSpent: 0
          }
        });
        console.log(`✅ Created credit account for ${walletAddress} with ${creditsEarned} XLM`);
      }
    }

    return NextResponse.json({
      success: true,
      viewDuration,
      creditsEarned,
      message: creditsEarned > 0 
        ? `🎉 Earned ${creditsEarned} XLM for watching ad!`
        : `👁️ View tracked (${viewDuration}s)`
    });

  } catch (error) {
    console.error('❌ Error tracking view:', error);
    return NextResponse.json(
      { 
        error: 'Failed to track view',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}