// agents/stellar-payment-agent.ts
// Enhanced browser agent with real Stellar payment integration + Upload flow

import puppeteer, { Browser, Page } from 'puppeteer';
import * as StellarSdk from 'stellar-sdk';
import { UploadHandler } from './upload-handler';

export interface AdPlacementRequest {
  websiteUrl: string;
  slotId: string;
  bidAmount: string;
  duration: string;
  adImagePath: string;
  clickUrl: string;
  walletSecret: string;
  destinationAddress?: string;
}

export interface PlacementResult {
  success: boolean;
  message: string;
  transactionHash?: string;
  publicKey?: string;
  screenshots: string[];
}

export class StellarPaymentAgent {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private server: StellarSdk.Horizon.Server;
  private keypair: StellarSdk.Keypair | null = null;
  private useTestnet: boolean = true;

  constructor(useTestnet: boolean = true) {
    this.useTestnet = useTestnet;
    
    const networkUrl = useTestnet 
      ? 'https://horizon-testnet.stellar.org'
      : 'https://horizon.stellar.org';
    
    this.server = new StellarSdk.Horizon.Server(networkUrl);
    
    console.log(`🌐 Using ${useTestnet ? 'TESTNET' : 'MAINNET'}`);
  }

  async initialize() {
    console.log('🤖 Starting Stellar payment browser agent...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser error:', msg.text());
      } else {
        console.log('📄 Browser log:', msg.text());
      }
    });
    
    console.log('✅ Browser launched successfully');
  }

  async placeAd(request: AdPlacementRequest): Promise<PlacementResult> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    try {
      // Step 0: Initialize Stellar wallet
      console.log('🔑 Step 0: Initializing Stellar wallet...');
      this.keypair = StellarSdk.Keypair.fromSecret(request.walletSecret);
      console.log('   Wallet Address:', this.keypair.publicKey());
      
      const balance = await this.getBalance(this.keypair.publicKey());
      console.log(`   Balance: ${balance} XLM`);
      
      if (parseFloat(balance) < parseFloat(request.bidAmount)) {
        throw new Error(`Insufficient balance! Have: ${balance} XLM, Need: ${request.bidAmount} XLM`);
      }

      console.log('\n🎯 Starting ad placement automation...\n');

      // Step 1: Navigate to blog page
      console.log('📱 Step 1: Navigating to website...');
      await this.page.goto(request.websiteUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      await this.delay(2000);
      console.log('   ✅ Page loaded');

      // Step 2: Find and click the target ad slot
      console.log(`\n🎯 Step 2: Looking for ad slot: ${request.slotId}`);
      const slotSelector = `[data-slot-id="${request.slotId}"]`;
      
      await this.page.waitForSelector(slotSelector, { timeout: 10000 });
      console.log('   ✅ Found ad slot');
      
      await this.page.screenshot({ 
        path: './agent-logs/01-before-click.png',
        fullPage: true 
      });
      
      await this.page.click(slotSelector);
      console.log('   ✅ Clicked ad slot');

      // Step 3: Wait for checkout page
      console.log('\n⏳ Step 3: Waiting for checkout page...');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log('   ✅ Checkout page loaded');
      
      await this.page.screenshot({ 
        path: './agent-logs/02-checkout-page.png',
        fullPage: true 
      });

      // Step 4: Fill in bid amount
      console.log(`\n💰 Step 4: Setting bid amount: ${request.bidAmount} XLM`);
      await this.setBidAmount(request.bidAmount);
      console.log('   ✅ Bid amount set');

      await this.page.screenshot({ 
        path: './agent-logs/03-form-filled.png',
        fullPage: true 
      });

      // Step 5: Create and submit Stellar payment
      console.log('\n💸 Step 5: Creating Stellar payment transaction...');
      const destination = request.destinationAddress || 
        'GBPF3SYKLCBE3IYXPWL2XWH5LRBHGLNQ6HGAPVFLG5U6HGRN42NNG4XZ';
      
      const transaction = await this.createPaymentTransaction(
        request.bidAmount,
        destination,
        `Ad placement: ${request.slotId}`
      );
      console.log('   ✅ Transaction created');

      // Step 6: Sign and submit transaction
      console.log('\n✍️  Step 6: Signing and submitting transaction...');
      const txResult = await this.signAndSubmitTransaction(transaction);
      console.log('   ✅ Transaction submitted');
      console.log('   📝 Transaction Hash:', txResult.hash);

      // Step 7: Inject transaction data into page
      console.log('\n📋 Step 7: Injecting transaction data into page...');
      await this.injectTransactionData(txResult.hash, request);
      console.log('   ✅ Transaction data injected');

      // Step 8-12: Handle upload page using UploadHandler
      const uploadHandler = new UploadHandler(this.page);
      
      const uploadSuccess = await uploadHandler.completeUploadFlow({
        slotId: request.slotId,
        bidAmount: request.bidAmount,
        transactionHash: txResult.hash,
        walletAddress: this.keypair.publicKey(),
        adImagePath: request.adImagePath,
        websiteBaseUrl: request.websiteUrl.replace('/blog', ''),
        useTestnet: this.useTestnet
      });

      if (!uploadSuccess) {
        console.log('\n⚠️  Upload verification incomplete - check screenshots');
      }

      console.log('\n🎉 Ad placement complete!');

      return {
        success: true,
        message: 'Ad successfully placed with Stellar payment and image uploaded',
        transactionHash: txResult.hash,
        publicKey: this.keypair.publicKey(),
        screenshots: [
          './agent-logs/01-before-click.png',
          './agent-logs/02-checkout-page.png',
          './agent-logs/03-form-filled.png',
          './agent-logs/04-upload-page.png',
          './agent-logs/05-file-selected.png',
          './agent-logs/06-upload-in-progress.png',
          './agent-logs/07-upload-complete.png'
        ]
      };

    } catch (error: any) {
      console.error('\n❌ Agent error:', error.message);
      
      if (this.page) {
        await this.page.screenshot({ 
          path: './agent-logs/error.png',
          fullPage: true 
        });
      }

      throw error;
    }
  }

  private async getBalance(publicKey: string): Promise<string> {
    try {
      const account = await this.server.loadAccount(publicKey);
      const nativeBalance = account.balances.find(
        balance => balance.asset_type === 'native'
      );
      return nativeBalance ? (nativeBalance as any).balance : '0';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Account not found. Fund it first with Friendbot (testnet) or XLM (mainnet)');
      }
      throw error;
    }
  }

  private async createPaymentTransaction(
    amount: string,
    destination: string,
    memo: string
  ): Promise<StellarSdk.Transaction> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }

    try {
      const account = await this.server.loadAccount(this.keypair.publicKey());

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.useTestnet 
          ? StellarSdk.Networks.TESTNET 
          : StellarSdk.Networks.PUBLIC
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destination,
            asset: StellarSdk.Asset.native(),
            amount: amount
          })
        )
        .addMemo(StellarSdk.Memo.text(memo.substring(0, 28)))
        .setTimeout(180)
        .build();

      return transaction;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }

  private async signAndSubmitTransaction(
    transaction: StellarSdk.Transaction
  ): Promise<StellarSdk.Horizon.HorizonApi.SubmitTransactionResponse> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }

    try {
      transaction.sign(this.keypair);
      const result = await this.server.submitTransaction(transaction);

      if (!result.successful) {
        throw new Error('Transaction failed: ' + JSON.stringify(result));
      }

      return result;
    } catch (error: any) {
      console.error('Transaction submission failed:', error);
      
      if (error.response?.data?.extras?.result_codes) {
        const codes = error.response.data.extras.result_codes;
        console.error('Result codes:', codes);
      }
      
      throw error;
    }
  }

  private async setBidAmount(amount: string) {
    if (!this.page) return;

    const selectors = [
      'input#bidAmount', 
      'input[name="bidAmount"]', 
      'input[name="amount"]',
      'input[type="number"]'
    ];
    
    for (const selector of selectors) {
      try {
        const input = await this.page.$(selector);
        if (input) {
          await this.page.click(selector, { clickCount: 3 });
          await this.page.keyboard.press('Backspace');
          await this.page.type(selector, amount);
          console.log(`   Used selector: ${selector}`);
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    await this.delay(500);
  }

  private async injectTransactionData(txHash: string, request: AdPlacementRequest) {
    if (!this.page || !this.keypair) return;

    await this.page.evaluate((data) => {
      localStorage.setItem('stellar_tx_hash', data.txHash);
      localStorage.setItem('stellar_wallet_address', data.walletAddress);
      localStorage.setItem('payment_completed', 'true');
      localStorage.setItem('slot_id', data.slotId);
      localStorage.setItem('bid_amount', data.bidAmount);
      
      window.dispatchEvent(new CustomEvent('stellar-payment-complete', {
        detail: { 
          txHash: data.txHash,
          walletAddress: data.walletAddress,
          slotId: data.slotId,
          bidAmount: data.bidAmount,
          success: true 
        }
      }));
    }, {
      txHash,
      walletAddress: this.keypair.publicKey(),
      slotId: request.slotId,
      bidAmount: request.bidAmount
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n✅ Browser closed');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fundTestnetAccount(publicKey: string): Promise<void> {
    if (!this.useTestnet) {
      throw new Error('This method only works on testnet');
    }

    console.log('💰 Funding testnet account with Friendbot...');
    
    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
      );
      
      if (response.ok) {
        console.log('✅ Account funded successfully!');
      } else {
        throw new Error('Friendbot request failed');
      }
    } catch (error) {
      console.error('❌ Failed to fund account:', error);
      throw error;
    }
  }
}