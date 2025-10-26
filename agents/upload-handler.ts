// agents/upload-handler.ts
// Handles the upload page interactions for ad image submission

import { Page } from 'puppeteer';

export interface UploadConfig {
  slotId: string;
  bidAmount: string;
  transactionHash: string;
  walletAddress: string;
  adImagePath: string;
  websiteBaseUrl: string;
  useTestnet: boolean;
}

export class UploadHandler {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the upload page with all required parameters
   */
  async navigateToUploadPage(config: UploadConfig): Promise<string> {
    console.log('\n🔄 Step 8: Navigating to upload page...');

    const uploadUrl = `${config.websiteBaseUrl}/upload?` + 
      `slotId=${encodeURIComponent(config.slotId)}&` +
      `price=${encodeURIComponent(config.bidAmount)}&` +
      `bidAmount=${encodeURIComponent(config.bidAmount)}&` +
      `size=300x250&` +
      `category=general&` +
      `transactionHash=${encodeURIComponent(config.transactionHash)}&` +
      `walletAddress=${encodeURIComponent(config.walletAddress)}&` +
      `network=${config.useTestnet ? 'testnet' : 'mainnet'}`;

    console.log('   📍 URL:', uploadUrl);
    
    await this.page.goto(uploadUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('   ✅ Upload page loaded');
    
    // Wait for page to be fully interactive
    await this.delay(3000);
    
    return uploadUrl;
  }

  /**
   * Wait for the payment confirmation box to appear on upload page
   */
  async waitForPaymentConfirmation(): Promise<boolean> {
    console.log('\n⏳ Step 9: Waiting for payment confirmation...');

    try {
      // Look for payment confirmation indicators
      const confirmationSelectors = [
        'text/Payment Confirmed',
        'text/payment has been processed',
        '[class*="payment"]',
        '[class*="confirmed"]',
        '.bg-green-50' // Your payment confirmed card
      ];

      for (const selector of confirmationSelectors) {
        try {
          const element = await this.page.waitForSelector(selector, { timeout: 5000 });
          if (element) {
            console.log('   ✅ Payment confirmation found');
            return true;
          }
        } catch (e) {
          continue;
        }
      }

      // Check page content
      const pageContent = await this.page.content();
      if (pageContent.includes('Payment Confirmed') || pageContent.includes('payment has been processed')) {
        console.log('   ✅ Payment confirmation detected in page');
        return true;
      }

      console.log('   ⚠️  Payment confirmation not found, but continuing...');
      return false;

    } catch (error) {
      console.log('   ⚠️  Could not verify payment confirmation');
      return false;
    }
  }

  /**
   * Find and interact with the file input
   */
  async selectFile(imagePath: string): Promise<void> {
    console.log('\n🖼️  Step 10: Uploading ad image...');

    try {
      // Wait for file input to be available
      await this.page.waitForSelector('input[type="file"]', { timeout: 10000 });
      console.log('   📋 File input found');

      // Get the file input element
      const fileInput = await this.page.$('input[type="file"]');
      
      if (!fileInput) {
        throw new Error('File input element not found');
      }

      // Upload the file
      await fileInput.uploadFile(imagePath);
      console.log('   ✅ File selected:', imagePath);
      
      // Wait for preview to load
      await this.delay(2000);
      
      // Check if preview appeared
      const hasPreview = await this.page.evaluate(() => {
        const preview = document.querySelector('img[alt="Preview"]');
        return !!preview;
      });

      if (hasPreview) {
        console.log('   ✅ Image preview loaded');
      }

    } catch (error) {
      console.error('   ❌ Error selecting file:', error);
      throw error;
    }
  }

  /**
   * Click the "Upload to IPFS" button
   */
  async clickUploadButton(): Promise<void> {
    console.log('\n🚀 Step 11: Clicking upload button...');

    try {
      // Multiple possible button selectors
      const buttonSelectors = [
        'button:has-text("Upload to IPFS")',
        'button:has-text("Upload")',
        'text/Upload to IPFS',
        'button.bg-black', // Your upload button class
        'button[type="button"]'
      ];

      let clicked = false;

      for (const selector of buttonSelectors) {
        try {
          // Wait for the button
          await this.page.waitForSelector(selector, { timeout: 3000 });
          
          // Get button text to verify
          const button = await this.page.$(selector);
          if (button) {
            const buttonText = await this.page.evaluate(el => el?.textContent, button);
            
            // Only click if it contains "Upload"
            if (buttonText && buttonText.toLowerCase().includes('upload')) {
              await button.click();
              console.log(`   ✅ Clicked button: "${buttonText.trim()}"`);
              clicked = true;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (!clicked) {
        // Fallback: try to find any button with "Upload" text using evaluate
        const foundAndClicked = await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const uploadBtn = buttons.find(btn => 
            btn.textContent?.toLowerCase().includes('upload')
          );
          
          if (uploadBtn) {
            (uploadBtn as HTMLButtonElement).click();
            return true;
          }
          return false;
        });

        if (foundAndClicked) {
          console.log('   ✅ Clicked upload button (fallback method)');
          clicked = true;
        }
      }

      if (!clicked) {
        throw new Error('Upload button not found');
      }

      // Wait for upload to start
      await this.delay(2000);

    } catch (error) {
      console.error('   ❌ Error clicking upload button:', error);
      throw error;
    }
  }

  /**
   * Wait for upload to complete and check for success
   */
  async waitForUploadComplete(): Promise<boolean> {
    console.log('\n⏳ Step 12: Waiting for upload to complete...');

    try {
      // Wait for upload progress indicators
      await this.delay(3000);

      // Check for success indicators
      const successSelectors = [
        'text/success',
        'text/uploaded',
        'text/complete',
        'text/IPFS Hash',
        '.bg-green-50',
        '[class*="success"]'
      ];

      let foundSuccess = false;

      // Try each selector
      for (const selector of successSelectors) {
        try {
          const element = await this.page.waitForSelector(selector, { timeout: 10000 });
          if (element) {
            console.log('   ✅ Upload success indicator found');
            foundSuccess = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // If no selector worked, check page content
      if (!foundSuccess) {
        await this.delay(5000); // Give more time for upload
        
        const pageContent = await this.page.content();
        const successKeywords = ['success', 'uploaded', 'complete', 'ipfs hash', 'lighthouse'];
        
        foundSuccess = successKeywords.some(keyword => 
          pageContent.toLowerCase().includes(keyword)
        );

        if (foundSuccess) {
          console.log('   ✅ Upload success detected in page content');
        }
      }

      // Try to extract IPFS hash if available
      if (foundSuccess) {
        const ipfsHash = await this.extractIPFSHash();
        if (ipfsHash) {
          console.log('   📝 IPFS Hash:', ipfsHash);
        }
      }

      return foundSuccess;

    } catch (error) {
      console.log('   ⚠️  Could not confirm upload completion');
      return false;
    }
  }

  /**
   * Extract IPFS hash from the page if available
   */
  private async extractIPFSHash(): Promise<string | null> {
    try {
      const hash = await this.page.evaluate(() => {
        // Look for IPFS hash in various places
        const hashElement = document.querySelector('[class*="break-all"]');
        if (hashElement && hashElement.textContent) {
          const text = hashElement.textContent.trim();
          // IPFS hash is typically 46 characters starting with Qm or ba
          if (text.length > 40 && (text.startsWith('Qm') || text.startsWith('ba'))) {
            return text;
          }
        }

        // Try localStorage
        const storedHash = localStorage.getItem('ipfs_hash') || 
                          localStorage.getItem('lighthouse_hash');
        if (storedHash) return storedHash;

        return null;
      });

      return hash;
    } catch (error) {
      return null;
    }
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(filename: string): Promise<void> {
    await this.page.screenshot({ 
      path: `./agent-logs/${filename}`,
      fullPage: true 
    });
  }

  /**
   * Check if there are any error messages on the page
   */
  async checkForErrors(): Promise<string | null> {
    try {
      const errorText = await this.page.evaluate(() => {
        const errorSelectors = [
          '[class*="error"]',
          '[class*="failed"]',
          '.text-red-600',
          '.bg-red-50'
        ];

        for (const selector of errorSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            return element.textContent.trim();
          }
        }

        return null;
      });

      if (errorText) {
        console.log('   ⚠️  Error detected:', errorText);
      }

      return errorText;
    } catch (error) {
      return null;
    }
  }

  /**
   * Complete upload flow - orchestrates all upload steps
   */
  async completeUploadFlow(config: UploadConfig): Promise<boolean> {
    try {
      // Step 8: Navigate to upload page
      await this.navigateToUploadPage(config);
      await this.takeScreenshot('04-upload-page.png');

      // Step 9: Wait for payment confirmation
      await this.waitForPaymentConfirmation();

      // Step 10: Select and upload file
      await this.selectFile(config.adImagePath);
      await this.takeScreenshot('05-file-selected.png');

      // Check for errors before proceeding
      const error = await this.checkForErrors();
      if (error) {
        throw new Error(`Upload page error: ${error}`);
      }

      // Step 11: Click upload button
      await this.clickUploadButton();
      
      // Wait a bit for upload to start
      await this.delay(3000);
      await this.takeScreenshot('06-upload-in-progress.png');

      // Step 12: Wait for upload to complete
      const uploadSuccess = await this.waitForUploadComplete();
      await this.takeScreenshot('07-upload-complete.png');

      if (!uploadSuccess) {
        console.log('   ⚠️  Upload completion could not be verified');
        console.log('   💡 Check screenshots to verify manually');
      }

      console.log('\n✅ Upload flow completed');
      return uploadSuccess;

    } catch (error) {
      console.error('\n❌ Upload flow failed:', error);
      await this.takeScreenshot('error-upload.png');
      throw error;
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}