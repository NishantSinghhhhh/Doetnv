import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This API processes the queue and activates next ads when current ones expire
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting queue processing...');

    // Find all slots that have queued ads
    const slotsWithQueue = await prisma.adSlot.findMany({
      where: {
        active: true,
        placements: {
          some: {
            status: 'queued'
          }
        }
      },
      select: {
        id: true,
        slotIdentifier: true
      }
    });

    console.log(`📊 Found ${slotsWithQueue.length} slots with queued ads`);

    let activatedCount = 0;
    let expiredCount = 0;

    for (const slot of slotsWithQueue) {
      // Check if current active ad has expired
      const currentAd = await prisma.adPlacement.findFirst({
        where: {
          slotId: slot.id,
          status: 'active',
          expiresAt: { lte: new Date() } // Expired
        }
      });

      if (currentAd) {
        console.log(`⏰ Ad expired for slot ${slot.slotIdentifier}:`, currentAd.id);
        
        // Mark as expired
        await prisma.adPlacement.update({
          where: { id: currentAd.id },
          data: { status: 'expired' }
        });
        expiredCount++;

        // Get next queued ad (highest bid)
        const nextAd = await prisma.adPlacement.findFirst({
          where: {
            slotId: slot.id,
            status: 'queued'
          },
          orderBy: [
            { bidAmount: 'desc' },
            { createdAt: 'asc' }
          ]
        });

        if (nextAd) {
          console.log(`🚀 Activating next ad for slot ${slot.slotIdentifier}:`, nextAd.id);
          
          // Activate the next ad
          const now = new Date();
          const newExpiresAt = new Date(now.getTime() + nextAd.durationMinutes * 60 * 1000);
          
          await prisma.adPlacement.update({
            where: { id: nextAd.id },
            data: {
              status: 'active',
              startsAt: now,
              expiresAt: newExpiresAt,
              queuePosition: null
            }
          });
          activatedCount++;

          // Recalculate queue positions and times
          await recalculateQueue(slot.id, newExpiresAt);
        }
      }
    }

    console.log(`✅ Queue processing complete: ${expiredCount} expired, ${activatedCount} activated`);

    return NextResponse.json({
      success: true,
      expiredCount,
      activatedCount,
      message: `Processed ${slotsWithQueue.length} slots`
    });

  } catch (error) {
    console.error('❌ Error processing queue:', error);
    return NextResponse.json(
      { success: false, error: 'Queue processing failed' },
      { status: 500 }
    );
  }
}

// Recalculate queue positions and start/expire times
async function recalculateQueue(slotId: string, currentExpiresAt: Date) {
  const queuedAds = await prisma.adPlacement.findMany({
    where: {
      slotId: slotId,
      status: 'queued'
    },
    orderBy: [
      { bidAmount: 'desc' },
      { createdAt: 'asc' }
    ]
  });

  let currentExpiry = currentExpiresAt;
  
  for (let i = 0; i < queuedAds.length; i++) {
    const ad = queuedAds[i];
    const newStartsAt = currentExpiry;
    const newExpiresAt = new Date(currentExpiry.getTime() + ad.durationMinutes * 60 * 1000);
    
    await prisma.adPlacement.update({
      where: { id: ad.id },
      data: {
        queuePosition: i + 1,
        startsAt: newStartsAt,
        expiresAt: newExpiresAt
      }
    });

    currentExpiry = newExpiresAt;
  }

  console.log(`📊 Recalculated ${queuedAds.length} queued ads for slot`);
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST to process queue' },
    { status: 405 }
  );
}