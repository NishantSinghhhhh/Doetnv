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
      console.log('ℹ️ No credit account found, returning 0 credits');
      return NextResponse.json({
        walletAddress,
        credits: '0',
        totalEarned: '0',
        totalSpent: '0',
        hasCredits: false
      });
    }

    console.log(`✅ Found ${adCredit.credits.toString()} XLM in credits`);

    return NextResponse.json({
      walletAddress,
      credits: adCredit.credits.toString(),
      totalEarned: adCredit.totalEarned.toString(),
      totalSpent: adCredit.totalSpent.toString(),
      hasCredits: parseFloat(adCredit.credits.toString()) > 0
    });

  } catch (error) {
    console.error('❌ Error fetching credits:', error);
    
    // Return 0 credits instead of error
    return NextResponse.json({
      walletAddress: '',
      credits: '0',
      totalEarned: '0',
      totalSpent: '0',
      hasCredits: false,
      error: 'Failed to fetch credits'
    });
  }
}