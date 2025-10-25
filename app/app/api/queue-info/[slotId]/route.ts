import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const { slotId } = await params;
    
    console.log('🔍 Fetching queue info for slot:', slotId);

    // Find the ad slot
    const adSlot = await prisma.adSlot.findFirst({
      where: {
        slotIdentifier: slotId,
        active: true
      }
    });

    if (!adSlot) {
      console.log('❌ Ad slot not found:', slotId);
      return NextResponse.json({
        slotId,
        position: 0,
        totalInQueue: 0,
        isAvailable: true
      });
    }

    // Check if there's an active ad
    const activePlacement = await prisma.adPlacement.findFirst({
      where: {
        slotId: adSlot.id,
        status: 'active',
        expiresAt: {
          gt: new Date()
        }
      }
    });

    // Count queued ads
    const queuedCount = await prisma.adPlacement.count({
      where: {
        slotId: adSlot.id,
        status: 'queued'
      }
    });

    // If no active ad, slot is available
    if (!activePlacement) {
      console.log('✅ Slot is available (no active ad)');
      return NextResponse.json({
        slotId,
        position: 0,
        totalInQueue: queuedCount,
        isAvailable: true
      });
    }

    // Slot is occupied
    console.log(`📊 Slot occupied, ${queuedCount} in queue`);
    return NextResponse.json({
      slotId,
      position: queuedCount, // Next position in queue
      totalInQueue: queuedCount,
      nextActivation: activePlacement.expiresAt.toISOString(),
      isAvailable: false
    });

  } catch (error) {
    console.error('❌ Error getting queue info:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}