import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Handle OPTIONS request for CORS
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

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload-ad API called');

    const body = await request.json();
    console.log('📦 Request body received:', JSON.stringify(body, null, 2));
    
    const { 
      slotId, 
      mediaHash, 
      paymentData, 
      paymentInfo 
    } = body;

    // Validate required fields
    if (!slotId || !mediaHash || !paymentData || !paymentInfo) {
      console.error('❌ Missing required fields:', { slotId, mediaHash, paymentData, paymentInfo });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('✅ All required fields present');
    console.log('📍 Slot ID:', slotId);
    console.log('🔗 Media hash:', mediaHash);
    console.log('💰 Payment data:', JSON.stringify(paymentData, null, 2));

    // Calculate duration (default 1 hour)
    const durationMinutes = 60;
    const startsAt = new Date();
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    // Get bid amount (from bidAmount or fallback to AmountPaid)
    const bidAmount = paymentData.bidAmount || paymentData.AmountPaid;
    const discountApplied = paymentData.discountApplied || '0';

    console.log('⏰ Duration calculated:', durationMinutes, 'minutes');
    console.log('💰 Bid amount:', bidAmount, 'XLM');
    console.log('💰 Discount applied:', discountApplied, 'XLM');
    console.log('📅 Initial starts at:', startsAt.toISOString());
    console.log('📅 Initial expires at:', expiresAt.toISOString());

    const contentUrl = `https://gateway.lighthouse.storage/ipfs/${mediaHash}`;

    // 🚀 SAVE TO DATABASE WITH PRISMA
    try {
      console.log('=' .repeat(80));
      console.log('💾 STARTING DATABASE OPERATIONS');
      console.log('=' .repeat(80));

      // Check database connection
      console.log('🔌 Checking database connection...');
      console.log('📊 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
      
      try {
        await prisma.$connect();
        console.log('✅ Database connection successful!');
      } catch (connError) {
        console.error('❌ Database connection FAILED:', connError);
        throw connError;
      }

      // 1. Find or create publisher
      console.log('\n🔍 STEP 1: Finding/Creating Publisher');
      console.log('👤 Looking for wallet address:', paymentData.payerAddress);
      
      let publisher;
      try {
        publisher = await prisma.publisher.findUnique({
          where: { walletAddress: paymentData.payerAddress }
        });
        
        if (publisher) {
          console.log('✅ Publisher found!');
          console.log('   ID:', publisher.id);
          console.log('   Wallet:', publisher.walletAddress);
        } else {
          console.log('❌ Publisher not found, creating new one...');
          publisher = await prisma.publisher.create({
            data: {
              walletAddress: paymentData.payerAddress,
              verified: false,
            }
          });
          console.log('✅ Publisher created successfully!');
          console.log('   New ID:', publisher.id);
        }
      } catch (publisherError) {
        console.error('❌ Error with publisher:', publisherError);
        throw publisherError;
      }

      // 2. Find or create ad slot
      console.log('\n🔍 STEP 2: Finding/Creating Ad Slot');
      console.log('🎯 Looking for slot identifier:', slotId);
      
      let adSlot;
      try {
        adSlot = await prisma.adSlot.findFirst({
          where: { slotIdentifier: slotId }
        });
        
        if (adSlot) {
          console.log('✅ Ad slot found!');
          console.log('   ID:', adSlot.id);
          console.log('   Identifier:', adSlot.slotIdentifier);
          console.log('   Size:', adSlot.size);
        } else {
          console.log('❌ Ad slot not found, creating new one...');
          adSlot = await prisma.adSlot.create({
            data: {
              publisherId: publisher.id,
              slotIdentifier: slotId,
              size: paymentInfo.size || 'banner',
              width: 728,
              height: 90,
              basePrice: paymentInfo.price || '0.25',
              currency: 'XLM',
              network: 'stellar',
              durationOptions: ['1h'],
              category: paymentInfo.category || 'general',
              active: true,
              websiteUrl: 'https://example.com',
            }
          });
          console.log('✅ Ad slot created successfully!');
          console.log('   New ID:', adSlot.id);
        }
      } catch (slotError) {
        console.error('❌ Error with ad slot:', slotError);
        throw slotError;
      }

      // 3. Check if slot is occupied (BIDDING LOGIC STARTS HERE)
      console.log('\n🔍 STEP 3: Checking Slot Availability & Queue');
      
      const activePlacement = await prisma.adPlacement.findFirst({
        where: {
          slotId: adSlot.id,
          status: 'active',
          expiresAt: { gt: new Date() }
        }
      });

      let placementStatus: 'active' | 'queued' = 'active';
      let actualStartsAt = startsAt;
      let actualExpiresAt = expiresAt;
      let queuePosition: number | null = null;

      if (activePlacement) {
        console.log('🚦 SLOT IS OCCUPIED!');
        console.log('   Current ad expires:', activePlacement.expiresAt.toISOString());
        console.log('   Adding to QUEUE with bidding system...');
        
        placementStatus = 'queued';
        actualStartsAt = activePlacement.expiresAt;
        actualExpiresAt = new Date(activePlacement.expiresAt.getTime() + durationMinutes * 60 * 1000);

        // Calculate queue position based on bid amount (HIGHER BIDS GET PRIORITY!)
        const higherBids = await prisma.adPlacement.count({
          where: {
            slotId: adSlot.id,
            status: 'queued',
            bidAmount: {
              gt: parseFloat(bidAmount)
            }
          }
        });

        queuePosition = higherBids + 1; // Position starts at 1
        console.log(`📊 Queue position calculated: #${queuePosition} (based on bid: ${bidAmount} XLM)`);
        console.log(`   ${higherBids} ads have higher bids`);
      } else {
        console.log('✅ SLOT IS AVAILABLE!');
        console.log('   Ad will go LIVE immediately');
      }

      // 4. Create ad placement with bid amount
      console.log('\n📝 STEP 4: Creating Ad Placement');
      console.log('   Slot ID:', adSlot.id);
      console.log('   Publisher ID:', publisher.id);
      console.log('   Advertiser:', paymentData.payerAddress);
      console.log('   Content URL:', contentUrl);
      console.log('   Status:', placementStatus);
      console.log('   Bid Amount:', bidAmount, 'XLM');
      console.log('   Queue Position:', queuePosition);
      console.log('   Starts at:', actualStartsAt.toISOString());
      console.log('   Expires at:', actualExpiresAt.toISOString());
      
      let adPlacement;
      try {
        adPlacement = await prisma.adPlacement.create({
          data: {
            slotId: adSlot.id,
            publisherId: publisher.id,
            advertiserWallet: paymentData.payerAddress,
            contentType: 'image',
            contentUrl: contentUrl,
            clickUrl: 'https://example.com',
            description: `Ad for slot ${slotId}`,
            price: paymentData.AmountPaid,
            bidAmount: parseFloat(bidAmount), // 🎯 STORE BID AMOUNT FOR PRIORITY
            currency: 'XLM',
            durationMinutes: durationMinutes,
            startsAt: actualStartsAt,
            expiresAt: actualExpiresAt,
            status: placementStatus,
            queuePosition: queuePosition, // 🎯 STORE QUEUE POSITION
            moderationStatus: 'approved',
          }
        });

        console.log('✅ Ad placement created successfully!');
        console.log('   Placement ID:', adPlacement.id);
        console.log('   Status:', adPlacement.status);
        console.log('   Queue Position:', adPlacement.queuePosition);
      } catch (createError) {
        console.error('❌ Error creating ad placement:', createError);
        throw createError;
      }

      // 5. If queued, REORDER QUEUE by bid amount (PRIORITY BIDDING!)
      if (placementStatus === 'queued') {
        console.log('\n🔄 STEP 5: Reordering Queue by Bid Amount (Higher Bids First!)');
        
        // Get all queued ads sorted by bid amount (descending)
        const queuedAds = await prisma.adPlacement.findMany({
          where: {
            slotId: adSlot.id,
            status: 'queued'
          },
          orderBy: [
            { bidAmount: 'desc' },  // 🎯 HIGHEST BIDS FIRST
            { createdAt: 'asc' }     // Earlier bids break ties
          ]
        });

        console.log(`   Found ${queuedAds.length} ads in queue`);
        console.log('   Sorted by bid amount (highest first):');
        queuedAds.forEach((ad, i) => {
          console.log(`     #${i + 1}: ${ad.bidAmount} XLM (ID: ${ad.id})`);
        });

        // Update queue positions based on bid priority
        console.log('   Updating queue positions...');
        for (let i = 0; i < queuedAds.length; i++) {
          await prisma.adPlacement.update({
            where: { id: queuedAds[i].id },
            data: { queuePosition: i + 1 }
          });
        }

        // Recalculate start/expire times based on new queue order
        console.log('   Recalculating activation times...');
        let currentExpiry = activePlacement!.expiresAt;
        
        for (const ad of queuedAds) {
          const newStartsAt = currentExpiry;
          const newExpiresAt = new Date(currentExpiry.getTime() + ad.durationMinutes * 60 * 1000);
          
          await prisma.adPlacement.update({
            where: { id: ad.id },
            data: {
              startsAt: newStartsAt,
              expiresAt: newExpiresAt
            }
          });

          console.log(`     Position #${ad.queuePosition}: Starts ${newStartsAt.toISOString()}`);
          currentExpiry = newExpiresAt;
        }

        console.log('✅ Queue reordered successfully!');
        console.log('   Higher bids now have priority activation times');

        // Get updated placement info
        const updatedPlacement = await prisma.adPlacement.findUnique({
          where: { id: adPlacement.id }
        });
        
        if (updatedPlacement) {
          adPlacement = updatedPlacement;
        }
      }

      // 6. Create payment record
      console.log('\n💰 STEP 6: Creating Payment Record');
      console.log('   Placement ID:', adPlacement.id);
      console.log('   Transaction Hash:', paymentData.txHash);
      console.log('   Amount:', paymentData.AmountPaid, 'XLM');
      
      let payment;
      try {
        payment = await prisma.payment.create({
          data: {
            placementId: adPlacement.id,
            publisherId: publisher.id,
            transactionHash: paymentData.txHash,
            amount: paymentData.AmountPaid,
            currency: 'XLM',
            network: 'stellar',
            platformFee: '0',
            publisherRevenue: paymentData.AmountPaid,
            status: 'completed',
            verifiedAt: new Date(),
          }
        });

        console.log('✅ Payment record created successfully!');
        console.log('   Payment ID:', payment.id);
      } catch (createError) {
        console.error('❌ Error creating payment:', createError);
        throw createError;
      }

      // 🎯 STEP 7: DEDUCT USED CREDITS (NEW!)
      if (discountApplied && parseFloat(discountApplied) > 0) {
        console.log('\n💳 STEP 7: Deducting View-to-Earn Credits');
        console.log('   Wallet:', paymentData.payerAddress);
        console.log('   Credits to deduct:', discountApplied, 'XLM');
        
        try {
          const existingCredit = await prisma.adCredit.findUnique({
            where: { walletAddress: paymentData.payerAddress }
          });

          if (existingCredit) {
            await prisma.adCredit.update({
              where: { walletAddress: paymentData.payerAddress },
              data: {
                credits: { decrement: parseFloat(discountApplied) },
                totalSpent: { increment: parseFloat(discountApplied) }
              }
            });
            console.log(`✅ Deducted ${discountApplied} XLM credits from ${paymentData.payerAddress}`);
            console.log(`   Remaining credits: ${(parseFloat(existingCredit.credits.toString()) - parseFloat(discountApplied)).toFixed(2)} XLM`);
          } else {
            console.log('⚠️ No credit account found for wallet, skipping deduction');
          }
        } catch (creditError) {
          console.error('❌ Failed to deduct credits:', creditError);
          // Don't fail the entire upload if credit deduction fails
          console.log('⚠️ Continuing despite credit deduction error...');
        }
      } else {
        console.log('\n💳 STEP 7: No credits to deduct (discount: 0 XLM)');
      }

      // Get final queue stats
      const finalQueuePosition = adPlacement.queuePosition || 0;
      const totalInQueue = await prisma.adPlacement.count({
        where: {
          slotId: adSlot.id,
          status: 'queued'
        }
      });

      console.log('\n' + '='.repeat(80));
      console.log('🎉 ALL DATABASE OPERATIONS COMPLETED SUCCESSFULLY!');
      console.log('='.repeat(80));
      console.log('📊 FINAL STATS:');
      console.log('   Status:', adPlacement.status);
      console.log('   Bid Amount:', bidAmount, 'XLM');
      console.log('   Amount Paid:', paymentData.AmountPaid, 'XLM');
      console.log('   Discount Applied:', discountApplied, 'XLM');
      console.log('   Queue Position:', finalQueuePosition);
      console.log('   Total in Queue:', totalInQueue);
      console.log('   Activation Time:', adPlacement.startsAt.toISOString());
      console.log('='.repeat(80));

      return NextResponse.json({
        success: true,
        placement: {
          id: adPlacement.id,
          contentUrl: adPlacement.contentUrl,
          startsAt: adPlacement.startsAt.toISOString(),
          expiresAt: adPlacement.expiresAt.toISOString(),
          slotId: adSlot.slotIdentifier,
          status: adPlacement.status,
          bidAmount: bidAmount,
          amountPaid: paymentData.AmountPaid,
          discountApplied: discountApplied,
          queuePosition: finalQueuePosition,
          totalInQueue: totalInQueue,
          transactionHash: paymentData.txHash,
        },
        message: placementStatus === 'queued' 
          ? `🎯 Ad added to queue at position #${finalQueuePosition} with bid ${bidAmount} XLM! Higher bids get priority.`
          : `🚀 Ad is now LIVE! Expires at ${adPlacement.expiresAt.toISOString()}`
      });

    } catch (dbError) {
      console.error('\n' + '='.repeat(80));
      console.error('❌ DATABASE ERROR OCCURRED');
      console.error('='.repeat(80));
      console.error('Error type:', dbError instanceof Error ? dbError.constructor.name : typeof dbError);
      console.error('Error message:', dbError instanceof Error ? dbError.message : String(dbError));
      console.error('Full error:', dbError);
      console.error('='.repeat(80));
      
      return NextResponse.json(
        { 
          error: 'Failed to save to database',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ GENERAL ERROR OCCURRED');
    console.error('='.repeat(80));
    console.error('Error creating ad placement:', error);
    console.error('='.repeat(80));
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Fallback handler for any other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload ads.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload ads.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload ads.' },
    { status: 405 }
  );
}