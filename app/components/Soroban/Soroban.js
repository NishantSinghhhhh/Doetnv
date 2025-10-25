import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Address,
  xdr,
} from "@stellar/stellar-sdk";
import { userSignTransaction } from "./Freighter";

const RPC_URL = "https://soroban-testnet.stellar.org";
const CONTRACT_ADDRESS = "d7b6f0b98318db681b5ad9cb7ccaf3ba6f1bbdcc9ccd51bbf6b139bbdd065c91"; // Replace with your deployed contract

const NETWORK_PASSPHRASE = Networks.TESTNET;

const params = {
  fee: BASE_FEE,
  networkPassphrase: NETWORK_PASSPHRASE,
};

// ============================================
// Utility Functions for ScVal Conversion
// ============================================

const accountToScVal = (account) => new Address(account).toScVal();

const stringToScVal = (value) => nativeToScVal(value, { type: "string" });

const numberToI128 = (value) => nativeToScVal(value, { type: "i128" });

const numberToU64 = (value) => nativeToScVal(value, { type: "u64" });

// ============================================
// Core Contract Interaction Function
// ============================================

async function contractInt(caller, functionName, values) {
  const provider = new SorobanRpc.Server(RPC_URL, { allowHttp: true });
  const sourceAccount = await provider.getAccount(caller);
  const contract = new Contract(CONTRACT_ADDRESS);
  
  let buildTx;

  if (values == null) {
    buildTx = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functionName))
      .setTimeout(30)
      .build();
  } else if (Array.isArray(values)) {
    buildTx = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functionName, ...values))
      .setTimeout(30)
      .build();
  } else {
    buildTx = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functionName, values))
      .setTimeout(30)
      .build();
  }

  const preparedTx = await provider.prepareTransaction(buildTx);
  const prepareTxXDR = preparedTx.toXDR();

  const signedTx = await userSignTransaction(prepareTxXDR, "TESTNET", caller);
  const tx = TransactionBuilder.fromXDR(signedTx, NETWORK_PASSPHRASE);

  try {
    const sendTx = await provider.sendTransaction(tx);
    
    if (sendTx.errorResult) {
      throw new Error("Unable to submit transaction");
    }
    
    if (sendTx.status === "PENDING") {
      let txResponse = await provider.getTransaction(sendTx.hash);
      
      // Poll for transaction confirmation
      while (txResponse.status === "NOT_FOUND") {
        txResponse = await provider.getTransaction(sendTx.hash);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      if (txResponse.status === "SUCCESS") {
        return {
          result: txResponse.returnValue,
          txHash: sendTx.hash
        };
      } else {
        throw new Error(`Transaction failed with status: ${txResponse.status}`);
      }
    }
  } catch (err) {
    console.error("Contract interaction error:", err);
    throw err;
  }
}

// ============================================
// Helper Function to Parse Map Results
// ============================================

function parseMapResult(result) {
  const map = {};
  
  if (result && result._value) {
    const entries = result._value;
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const key = entry._attributes?.key?._value?.toString() || "";
      const value = entry._attributes?.val?._value?.toString() || "";
      map[key] = value;
    }
  }
  
  return map;
}

// ============================================
// IPFS Upload Functions
// ============================================

/**
 * Upload file to IPFS via Lighthouse
 * @param {File} file - File to upload
 * @param {string} apiKey - Lighthouse API key
 * @returns {Promise<Object>} - Upload result with hash and gateway URL
 */
async function uploadToIPFS(file, apiKey) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('IPFS upload failed');
    }

    const data = await response.json();
    return {
      hash: data.Hash,
      name: data.Name,
      size: data.Size,
      gatewayUrl: `https://gateway.lighthouse.storage/ipfs/${data.Hash}`
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}

/**
 * Upload file via backend API (recommended for production)
 * @param {File} file - File to upload
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<string>} - IPFS hash
 */
async function uploadViaBackend(file, metadata) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add metadata
  Object.keys(metadata).forEach(key => {
    formData.append(key, metadata[key]);
  });

  const response = await fetch('/api/ipfs-upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Backend upload failed');
  }

  const data = await response.json();
  return data.hash;
}

// ============================================
// Contract Functions
// ============================================

/**
 * Create a new ad placement on blockchain
 * @param {string} caller - Wallet address of the caller
 * @param {string} slotId - Ad slot identifier
 * @param {string} advertiser - Advertiser's wallet address
 * @param {string} publisher - Publisher's wallet address
 * @param {number} price - Price in stroops (1 XLM = 10,000,000 stroops)
 * @param {number} bidAmount - Bid amount in stroops
 * @param {number} durationMinutes - Duration in minutes
 * @param {string} contentHash - IPFS hash of the ad content
 * @param {string} clickUrl - URL for ad clicks
 * @param {string} description - Ad description
 * @returns {Promise<Object>} - Placement details including ID and transaction hash
 */
async function createAdPlacement(
  caller,
  slotId,
  advertiser,
  publisher,
  price,
  bidAmount,
  durationMinutes,
  contentHash,
  clickUrl,
  description
) {
  const values = [
    stringToScVal(slotId),
    accountToScVal(advertiser),
    accountToScVal(publisher),
    numberToI128(price),
    numberToI128(bidAmount),
    numberToU64(durationMinutes),
    stringToScVal(contentHash),
    stringToScVal(clickUrl),
    stringToScVal(description),
  ];

  try {
    const { result, txHash } = await contractInt(caller, "create_ad_placement", values);
    const placementData = parseMapResult(result);
    
    console.log("✅ Ad Placement Created:", placementData);
    console.log("📝 Transaction Hash:", txHash);
    
    return {
      ...placementData,
      txHash
    };
  } catch (error) {
    console.error("❌ Failed to create ad placement:", error);
    throw error;
  }
}

/**
 * Record an ad view on blockchain
 * @param {string} caller - Wallet address of the caller
 * @param {string} placementId - Placement ID
 * @param {string} viewer - Viewer's wallet address
 * @param {string} sessionId - Session identifier
 * @param {number} viewDuration - View duration in seconds
 * @param {string|null} metadata1 - Optional metadata
 * @param {string|null} metadata2 - Optional metadata
 * @returns {Promise<Object>} - Credits earned and transaction hash
 */
async function recordAdView(
  caller,
  placementId,
  viewer,
  sessionId,
  viewDuration,
  metadata1 = null,
  metadata2 = null
) {
  const values = [
    stringToScVal(placementId),
    accountToScVal(viewer),
    stringToScVal(sessionId),
    numberToU64(viewDuration),
    metadata1 ? stringToScVal(metadata1) : nativeToScVal(null),
    metadata2 ? stringToScVal(metadata2) : nativeToScVal(null),
  ];

  try {
    const { result, txHash } = await contractInt(caller, "record_ad_view", values);
    const creditsEarned = Number(result?._value);
    
    console.log(`✅ Ad View Recorded. Credits Earned: ${creditsEarned} stroops`);
    console.log("📝 Transaction Hash:", txHash);
    
    return {
      creditsEarned,
      txHash
    };
  } catch (error) {
    console.error("❌ Failed to record ad view:", error);
    throw error;
  }
}

/**
 * Process payment for an ad placement on blockchain
 * @param {string} caller - Wallet address of the caller
 * @param {string} placementId - Placement ID
 * @param {string} advertiser - Advertiser's wallet address
 * @param {string} publisher - Publisher's wallet address
 * @param {number} amount - Payment amount in stroops
 * @param {string} transactionHash - Payment transaction hash
 * @returns {Promise<Object>} - Payment details with status and blockchain tx hash
 */
async function processPayment(
  caller,
  placementId,
  advertiser,
  publisher,
  amount,
  transactionHash
) {
  const values = [
    stringToScVal(placementId),
    accountToScVal(advertiser),
    accountToScVal(publisher),
    numberToI128(amount),
    stringToScVal(transactionHash),
  ];

  try {
    const { result, txHash } = await contractInt(caller, "process_payment", values);
    const paymentData = parseMapResult(result);
    
    console.log("✅ Payment Processed:", paymentData);
    console.log("📝 Transaction Hash:", txHash);
    
    return {
      ...paymentData,
      blockchainTxHash: txHash
    };
  } catch (error) {
    console.error("❌ Failed to process payment:", error);
    throw error;
  }
}

// ============================================
// Complete Upload + Blockchain Flow
// ============================================

/**
 * Complete flow: Upload to IPFS and store on blockchain
 * @param {Object} params - Upload parameters
 * @returns {Promise<Object>} - Complete result with IPFS hash and blockchain transaction
 */
async function uploadAndStoreAd({
  file,
  walletAddress,
  slotId,
  publisherAddress,
  price,
  bidAmount,
  durationMinutes = 60,
  clickUrl,
  description,
  useBackend = true,
  lighthouseApiKey = null
}) {
  try {
    console.log("🚀 Starting IPFS upload...");
    
    // Step 1: Upload to IPFS
    let ipfsHash;
    if (useBackend) {
      ipfsHash = await uploadViaBackend(file, {
        slotId,
        advertiser: walletAddress,
        clickUrl,
        description
      });
    } else {
      if (!lighthouseApiKey) {
        throw new Error("Lighthouse API key required for direct upload");
      }
      const uploadResult = await uploadToIPFS(file, lighthouseApiKey);
      ipfsHash = uploadResult.hash;
    }
    
    console.log("✅ IPFS Upload Complete. Hash:", ipfsHash);
    
    // Step 2: Store on blockchain
    console.log("🚀 Storing on blockchain...");
    
    const placementResult = await createAdPlacement(
      walletAddress,
      slotId,
      walletAddress, // advertiser
      publisherAddress,
      xlmToStroops(price),
      xlmToStroops(bidAmount),
      durationMinutes,
      ipfsHash, // content_hash
      clickUrl,
      description
    );
    
    console.log("✅ Blockchain Storage Complete");
    
    return {
      success: true,
      ipfsHash,
      gatewayUrl: `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`,
      placement: placementResult,
      blockchainTxHash: placementResult.txHash
    };
    
  } catch (error) {
    console.error("❌ Upload and store failed:", error);
    throw error;
  }
}

/**
 * Complete flow: Upload to IPFS (Lighthouse), store on blockchain, and save to database
 * This is the main function to call when clicking "Upload to IPFS"
 * @param {Object} params - Complete upload parameters
 * @returns {Promise<Object>} - Complete result with all storage confirmations
 */
async function uploadToIPFSBlockchainAndDatabase({
  file,
  walletAddress,
  slotId,
  publisherAddress,
  price,
  bidAmount,
  durationMinutes = 60,
  clickUrl,
  description,
  lighthouseApiKey,
  // Additional metadata for database
  adTitle,
  adType,
  targetAudience,
  category,
  tags = []
}) {
  try {
    console.log("🚀 Step 1/3: Uploading to IPFS via Lighthouse...");
    
    // Step 1: Upload to IPFS via Lighthouse
    if (!lighthouseApiKey) {
      throw new Error("Lighthouse API key is required");
    }
    
    const ipfsResult = await uploadToIPFS(file, lighthouseApiKey);
    const ipfsHash = ipfsResult.hash;
    const gatewayUrl = ipfsResult.gatewayUrl;
    
    console.log("✅ IPFS Upload Complete");
    console.log("📦 IPFS Hash:", ipfsHash);
    console.log("🔗 Gateway URL:", gatewayUrl);
    
    // Step 2: Store on Stellar Blockchain
    console.log("🚀 Step 2/3: Storing on Stellar Blockchain...");
    
    const blockchainResult = await createAdPlacement(
      walletAddress,
      slotId,
      walletAddress, // advertiser
      publisherAddress,
      xlmToStroops(price),
      xlmToStroops(bidAmount),
      durationMinutes,
      ipfsHash, // content_hash
      clickUrl,
      description
    );
    
    console.log("✅ Blockchain Storage Complete");
    console.log("📝 Transaction Hash:", blockchainResult.txHash);
    console.log("🆔 Placement ID:", blockchainResult.placement_id);
    
    // Step 3: Save to Database
    console.log("🚀 Step 3/3: Saving to Database...");
    
    const databasePayload = {
      placementId: blockchainResult.placement_id,
      slotId: slotId,
      advertiserAddress: walletAddress,
      publisherAddress: publisherAddress,
      price: price,
      bidAmount: bidAmount,
      durationMinutes: durationMinutes,
      ipfsHash: ipfsHash,
      gatewayUrl: gatewayUrl,
      clickUrl: clickUrl,
      description: description,
      blockchainTxHash: blockchainResult.txHash,
      // Additional metadata
      adTitle: adTitle,
      adType: adType,
      targetAudience: targetAudience,
      category: category,
      tags: tags,
      fileSize: ipfsResult.size,
      fileName: ipfsResult.name,
      status: 'active',
      createdAt: new Date().toISOString(),
      lighthouseStorage: true
    };
    
    const dbResponse = await fetch('/api/ad-placements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(databasePayload)
    });
    
    if (!dbResponse.ok) {
      const errorData = await dbResponse.json();
      throw new Error(`Database save failed: ${errorData.message || 'Unknown error'}`);
    }
    
    const dbResult = await dbResponse.json();
    
    console.log("✅ Database Save Complete");
    console.log("🗄️ Database Record ID:", dbResult.id);
    
    // Return complete result
    return {
      success: true,
      message: "Ad successfully uploaded to IPFS, stored on blockchain, and saved to database",
      ipfs: {
        hash: ipfsHash,
        gatewayUrl: gatewayUrl,
        size: ipfsResult.size,
        name: ipfsResult.name
      },
      blockchain: {
        placementId: blockchainResult.placement_id,
        transactionHash: blockchainResult.txHash,
        network: "Stellar Testnet",
        ...blockchainResult
      },
      database: {
        recordId: dbResult.id,
        ...dbResult
      },
      summary: {
        ipfsHash: ipfsHash,
        placementId: blockchainResult.placement_id,
        blockchainTx: blockchainResult.txHash,
        databaseId: dbResult.id,
        gatewayUrl: gatewayUrl
      }
    };
    
  } catch (error) {
    console.error("❌ Upload process failed:", error);
    
    // Return detailed error information
    return {
      success: false,
      error: error.message,
      errorDetails: error,
      failedAt: error.message.includes('IPFS') ? 'ipfs' : 
                error.message.includes('blockchain') ? 'blockchain' : 
                error.message.includes('Database') ? 'database' : 'unknown'
    };
  }
}

// ============================================
// Utility Conversion Functions
// ============================================

/**
 * Convert XLM to stroops
 * @param {number} xlm - Amount in XLM
 * @returns {number} - Amount in stroops
 */
function xlmToStroops(xlm) {
  return Math.floor(parseFloat(xlm) * 10_000_000);
}

/**
 * Convert stroops to XLM
 * @param {number} stroops - Amount in stroops
 * @returns {number} - Amount in XLM
 */
function stroopsToXlm(stroops) {
  return stroops / 10_000_000;
}

// ============================================
// Exports
// ============================================

export {
  // Main functions
  createAdPlacement,
  recordAdView,
  processPayment,
  
  // IPFS functions
  uploadToIPFS,
  uploadViaBackend,
  
  // Complete flow
  uploadAndStoreAd,
  uploadToIPFSBlockchainAndDatabase,
  
  // Utilities
  xlmToStroops,
  stroopsToXlm,
  
  // Constants
  CONTRACT_ADDRESS,
  RPC_URL,
};