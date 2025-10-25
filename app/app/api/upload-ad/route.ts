import { NextRequest, NextResponse } from 'next/server';

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
    console.log('Upload-ad API called');

    const body = await request.json();
    console.log('Request body received:', body);
    
    const { 
      slotId, 
      mediaHash, 
      paymentData, 
      paymentInfo 
    } = body;

    // Validate required fields
    if (!slotId || !mediaHash || !paymentData || !paymentInfo) {
      console.error('Missing required fields:', { slotId, mediaHash, paymentData, paymentInfo });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating ad placement for slot:', slotId);
    console.log('Media hash:', mediaHash);
    console.log('Payment data:', paymentData);

    // Calculate duration (default 1 hour)
    const durationMinutes = 60;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

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

    console.log('Ad placement created:', {
      hash: placementHash,
      slotId,
      expiresAt: expiresAt.toISOString()
    });

    // In production, you would:
    // 1. Store this in your database
    // 2. Upload placement data to IPFS/Lighthouse
    // 3. Update slot availability
    // 4. Send notifications

    // For now, just log it
    console.log('Full placement record:', placementRecord);

    return NextResponse.json({
      success: true,
      placement: {
        hash: placementHash,
        contentUrl: placementRecord.contentUrl,
        expiresAt: placementRecord.expiresAt,
        slotId: placementRecord.slotId,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error creating ad placement:', error);
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