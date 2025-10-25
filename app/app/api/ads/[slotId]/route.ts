import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;

    console.log('🔍 Fetching ad for slot:', slotId);

    // Find the ad slot by slotIdentifier
    const adSlot = await prisma.adSlot.findFirst({
      where: {
        slotIdentifier: slotId,
        active: true
      }
    });

    if (!adSlot) {
      console.log('❌ Ad slot not found:', slotId);
      return NextResponse.json({
        hasAd: false,
        message: 'Slot not found'
      });
    }

    console.log('✅ Ad slot found:', adSlot.id);

    // Find active ad placements for this slot
    const activePlacements = await prisma.adPlacement.findMany({
      where: {
        slotId: adSlot.id,
        status: 'active',
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    });

    if (activePlacements.length === 0) {
      console.log('📭 No active ads for slot:', slotId);
      return NextResponse.json({
        hasAd: false,
        slotId: slotId
      });
    }

    const placement = activePlacements[0];

    // Increment view count
    await prisma.adPlacement.update({
      where: { id: placement.id },
      data: {
        viewCount: { increment: 1 }
      }
    });

    console.log('✅ Returning active ad:', placement.id);

    return NextResponse.json({
      hasAd: true,
      placementId: placement.id, // 🎯 ADDED - This is critical for view tracking!
      contentUrl: placement.contentUrl,
      clickUrl: placement.clickUrl,
      description: placement.description,
      expiresAt: placement.expiresAt,
      advertiserWallet: placement.advertiserWallet
    });

  } catch (error) {
    console.error('❌ Error fetching ad:', error);
    return NextResponse.json(
      {
        hasAd: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}