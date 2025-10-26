// agents/run-stellar-agent.ts
// Enhanced agent runner with full Stellar testnet/mainnet support

import { StellarPaymentAgent } from './stellar-payment-agent';
import * as path from 'path';
import * as fs from 'fs';
import * as StellarSdk from 'stellar-sdk';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

async function setupTestWallet(): Promise<{ publicKey: string; secret: string }> {
  console.log('🔐 Generating new test wallet...\n');
  
  const keypair = StellarSdk.Keypair.random();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 NEW TEST WALLET CREATED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Public Key:');
  console.log(`  ${keypair.publicKey()}`);
  console.log('');
  console.log('Secret Key (SAVE THIS SECURELY):');
  console.log(`  ${keypair.secret()}`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('💡 IMPORTANT: To use this wallet, you must fund it first!\n');
  console.log('For TESTNET:');
  console.log(`  1. Visit: https://laboratory.stellar.org/#account-creator?network=test`);
  console.log(`  2. Or run: curl "https://friendbot.stellar.org?addr=${keypair.publicKey()}"`);
  console.log('');
  console.log('For MAINNET:');
  console.log('  1. Buy XLM on an exchange');
  console.log('  2. Send at least 2 XLM to the public key above');
  console.log('');
  console.log('After funding, add to your .env file:');
  console.log(`  STELLAR_SECRET_KEY=${keypair.secret()}`);
  console.log('');
  
  return {
    publicKey: keypair.publicKey(),
    secret: keypair.secret()
  };
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 STELLAR AD PLACEMENT AGENT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check for wallet secret
  let walletSecret = process.env.STELLAR_SECRET_KEY;
  
  if (!walletSecret) {
    console.log('⚠️  No STELLAR_SECRET_KEY found in environment\n');
    
    const answer = await new Promise<string>((resolve) => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Generate a new test wallet? (y/n): ', (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase());
      });
    });
    
    if (answer === 'y' || answer === 'yes') {
      const wallet = await setupTestWallet();
      walletSecret = wallet.secret;
      
      console.log('⏳ Attempting to fund account with Friendbot...\n');
      
      try {
        const agent = new StellarPaymentAgent(true); // Use testnet
        await agent.fundTestnetAccount(wallet.publicKey);
        console.log('✅ Account funded successfully!\n');
      } catch (error) {
        console.log('⚠️  Auto-funding failed. Please fund manually.\n');
      }
    } else {
      console.log('❌ Cannot proceed without a wallet. Exiting...\n');
      process.exit(1);
    }
  }

  // Determine network
  const useTestnet = process.env.USE_MAINNET !== 'true';
  
  // Configuration
  const config = {
    websiteUrl: process.env.WEBSITE_URL || 'http://localhost:3000/blog',
    slotId: process.env.AD_SLOT_ID || 'mid-article',
    bidAmount: process.env.BID_AMOUNT || '0.15',
    duration: '1h',
    adImagePath: path.join(process.cwd(), './images/test-ad.png'),
    clickUrl: process.env.CLICK_URL || 'https://example.com',
    walletSecret: walletSecret!,
    destinationAddress: process.env.DESTINATION_ADDRESS || 
      'GBPF3SYKLCBE3IYXPWL2XWH5LRBHGLNQ6HGAPVFLG5U6HHRN42NNG4XZ' // Default testnet
  };

  // Create directories
  const logsDir = path.join(process.cwd(), 'agent-logs');
  const imagesDir = path.join(process.cwd(), 'images');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 Created agent-logs directory');
  }
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('📁 Created images directory');
  }

  // Create test image if needed
  if (!fs.existsSync(config.adImagePath)) {
    console.log('🎨 Creating test ad image...');
    
    // Create a simple 1x1 transparent PNG as placeholder
    const placeholderImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    fs.writeFileSync(config.adImagePath, placeholderImage);
    console.log('✅ Placeholder image created');
    console.log('💡 Replace ./images/test-ad.png with your actual ad image\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CONFIGURATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Network:     ${useTestnet ? 'TESTNET' : 'MAINNET'}`);
  console.log(`🌐 Website:     ${config.websiteUrl}`);
  console.log(`🎯 Target Slot: ${config.slotId}`);
  console.log(`💰 Bid Amount:  ${config.bidAmount} XLM`);
  console.log(`⏰ Duration:    ${config.duration}`);
  console.log(`🖼️  Ad Image:    ${config.adImagePath}`);
  console.log(`🔗 Click URL:   ${config.clickUrl}`);
  console.log(`📬 Destination: ${config.destinationAddress.substring(0, 8)}...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const agent = new StellarPaymentAgent(useTestnet);

  try {
    // Initialize browser
    await agent.initialize();

    console.log('⏳ Starting automated ad placement with Stellar payment...\n');

    // Place the ad
    const result = await agent.placeAd(config);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Results:');
    console.log(`   ${result.message}`);
    
    if (result.publicKey) {
      console.log(`\n🔑 Wallet:`);
      console.log(`   ${result.publicKey}`);
    }
    
    if (result.transactionHash) {
      console.log(`\n💳 Transaction:`);
      console.log(`   Hash: ${result.transactionHash}`);
      console.log(`   Explorer: https://stellar.expert/explorer/${useTestnet ? 'testnet' : 'public'}/tx/${result.transactionHash}`);
    }
    
    console.log(`\n📸 Screenshots:`);
    result.screenshots.forEach((screenshot: string) => {
      console.log(`   ${screenshot}`);
    });
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Verify transaction on Stellar network');
    console.log('   2. Check that ad appears on your website');
    console.log('   3. Monitor ad performance');
    console.log('');

  } catch (error: any) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ FAILED!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.error('Error:', error.message);
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    console.error('\n💡 Troubleshooting Tips:');
    console.error('');
    console.error('1. Website Issues:');
    console.error('   - Ensure Next.js dev server is running: npm run dev');
    console.error('   - Verify blog loads at:', config.websiteUrl);
    console.error('   - Check ad slots are visible on the page');
    console.error('');
    console.error('2. Wallet Issues:');
    console.error('   - Verify STELLAR_SECRET_KEY is correct');
    console.error('   - Check wallet has sufficient XLM balance');
    console.error('   - For testnet, fund at: https://laboratory.stellar.org/');
    console.error('');
    console.error('3. Network Issues:');
    console.error('   - Confirm you\'re using correct network (testnet/mainnet)');
    console.error('   - Check Stellar Horizon status');
    console.error('');
    console.error('4. Debug:');
    console.error('   - Check error screenshot: ./agent-logs/error.png');
    console.error('   - Review browser console logs above');
    console.error('');
    
  } finally {
    // Option to keep browser open for debugging
    const keepOpen = process.env.KEEP_BROWSER_OPEN === 'true';
    
    if (!keepOpen) {
      await agent.close();
    } else {
      console.log('🔍 Browser kept open for debugging');
      console.log('   Press Ctrl+C to exit\n');
      // Keep process running
      await new Promise(() => {});
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Agent execution complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Received interrupt signal. Shutting down...\n');
  process.exit(0);
});

// Run the agent
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});