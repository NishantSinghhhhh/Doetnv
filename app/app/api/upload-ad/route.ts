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

    console.log('⏰ Duration calculated:', durationMinutes, 'minutes');
    console.log('📅 Starts at:', startsAt.toISOString());
    console.log('📅 Expires at:', expiresAt.toISOString());

    // Create ad placement record
    const placementRecord = {
      slotId,
      advertiserAddress: paymentData.payerAddress,
      mediaHash,
      contentUrl: `https://gateway.lighthouse.storage/ipfs/${mediaHash}`,
      amountPaid: paymentData.AmountPaid,
      bidAmount: paymentData.bidAmount || paymentData.AmountPaid,
      transactionHash: paymentData.txHash,
      duration: durationMinutes,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      category: paymentInfo.category || 'general',
      size: paymentInfo.size
    };

    // Generate placement hash (mock IPFS hash for now)
    const placementHash = `Qm${Math.random().toString(36).substring(2, 15)}${Date.now()}`;

    console.log('🎫 Placement hash generated:', placementHash);
    console.log('📋 Full placement record:', JSON.stringify(placementRecord, null, 2));

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
          console.log('   Verified:', publisher.verified);
        } else {
          console.log('❌ Publisher not found, creating new one...');
        }
      } catch (findError) {
        console.error('❌ Error finding publisher:', findError);
        throw findError;
      }

      if (!publisher) {
        try {
          console.log('📝 Creating new publisher with wallet:', paymentData.payerAddress);
          publisher = await prisma.publisher.create({
            data: {
              walletAddress: paymentData.payerAddress,
              verified: false,
            }
          });
          console.log('✅ Publisher created successfully!');
          console.log('   New ID:', publisher.id);
        } catch (createError) {
          console.error('❌ Error creating publisher:', createError);
          throw createError;
        }
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
        }
      } catch (findError) {
        console.error('❌ Error finding ad slot:', findError);
        throw findError;
      }

      if (!adSlot) {
        try {
          console.log('📝 Creating new ad slot...');
          console.log('   Publisher ID:', publisher.id);
          console.log('   Slot Identifier:', slotId);
          console.log('   Size:', paymentInfo.size);
          
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
        } catch (createError) {
          console.error('❌ Error creating ad slot:', createError);
          throw createError;
        }
      }

      // 3. Create ad placement
      console.log('\n📝 STEP 3: Creating Ad Placement');
      console.log('   Slot ID:', adSlot.id);
      console.log('   Publisher ID:', publisher.id);
      console.log('   Advertiser:', paymentData.payerAddress);
      console.log('   Content URL:', placementRecord.contentUrl);
      
      let adPlacement;
      try {
        adPlacement = await prisma.adPlacement.create({
          data: {
            slotId: adSlot.id,
            publisherId: publisher.id,
            advertiserWallet: paymentData.payerAddress,
            contentType: 'image',
            contentUrl: placementRecord.contentUrl,
            clickUrl: 'https://example.com',
            description: `Ad for slot ${slotId}`,
            price: paymentData.AmountPaid,
            currency: 'XLM',
            durationMinutes: durationMinutes,
            startsAt: startsAt,
            expiresAt: expiresAt,
            status: 'active',
            moderationStatus: 'approved',
          }
        });

        console.log('✅ Ad placement created successfully!');
        console.log('   Placement ID:', adPlacement.id);
        console.log('   Status:', adPlacement.status);
        console.log('   Expires:', adPlacement.expiresAt.toISOString());
      } catch (createError) {
        console.error('❌ Error creating ad placement:', createError);
        throw createError;
      }

      // 4. Create payment record
      console.log('\n💰 STEP 4: Creating Payment Record');
      console.log('   Placement ID:', adPlacement.id);
      console.log('   Transaction Hash:', paymentData.txHash);
      console.log('   Amount:', paymentData.AmountPaid);
      
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
        console.log('   Status:', payment.status);
      } catch (createError) {
        console.error('❌ Error creating payment:', createError);
        throw createError;
      }

      console.log('\n' + '='.repeat(80));
      console.log('🎉 ALL DATABASE OPERATIONS COMPLETED SUCCESSFULLY!');
      console.log('='.repeat(80));

      return NextResponse.json({
        success: true,
        placement: {
          id: adPlacement.id,
          hash: placementHash,
          contentUrl: adPlacement.contentUrl,
          expiresAt: adPlacement.expiresAt.toISOString(),
          slotId: adSlot.slotIdentifier,
          status: adPlacement.status,
          transactionHash: paymentData.txHash,
        }
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