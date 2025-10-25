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
  const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE"; // Replace with your deployed contract address
  
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
          return txResponse.returnValue;
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
  // Contract Functions
  // ============================================
  
  /**
   * Create a new ad placement
   * @param {string} caller - Wallet address of the caller
   * @param {string} slotId - Ad slot identifier
   * @param {string} advertiser - Advertiser's wallet address
   * @param {string} publisher - Publisher's wallet address
   * @param {number} price - Price in stroops (1 XLM = 10,000,000 stroops)
   * @param {number} bidAmount - Bid amount in stroops
   * @param {number} durationMinutes - Duration in minutes
   * @param {string} contentHash - IPFS or content hash
   * @param {string} clickUrl - URL for ad clicks
   * @param {string} description - Ad description
   * @returns {Object} - Placement details including ID
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
      const result = await contractInt(caller, "create_ad_placement", values);
      const placementData = parseMapResult(result);
      
      console.log("✅ Ad Placement Created:", placementData);
      return placementData;
    } catch (error) {
      console.error("❌ Failed to create ad placement:", error);
      throw error;
    }
  }
  
  /**
   * Record an ad view
   * @param {string} caller - Wallet address of the caller
   * @param {string} placementId - Placement ID
   * @param {string} viewer - Viewer's wallet address
   * @param {string} sessionId - Session identifier
   * @param {number} viewDuration - View duration in seconds
   * @param {string|null} metadata1 - Optional metadata
   * @param {string|null} metadata2 - Optional metadata
   * @returns {number} - Credits earned in stroops
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
      const result = await contractInt(caller, "record_ad_view", values);
      const creditsEarned = Number(result?._value);
      
      console.log(`✅ Ad View Recorded. Credits Earned: ${creditsEarned} stroops`);
      return creditsEarned;
    } catch (error) {
      console.error("❌ Failed to record ad view:", error);
      throw error;
    }
  }
  
  /**
   * Process payment for an ad placement
   * @param {string} caller - Wallet address of the caller
   * @param {string} placementId - Placement ID
   * @param {string} advertiser - Advertiser's wallet address
   * @param {string} publisher - Publisher's wallet address
   * @param {number} amount - Payment amount in stroops
   * @param {string} transactionHash - Transaction hash
   * @returns {Object} - Payment details with status
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
      const result = await contractInt(caller, "process_payment", values);
      const paymentData = parseMapResult(result);
      
      console.log("✅ Payment Processed:", paymentData);
      return paymentData;
    } catch (error) {
      console.error("❌ Failed to process payment:", error);
      throw error;
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
    return Math.floor(xlm * 10_000_000);
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
    createAdPlacement,
    recordAdView,
    processPayment,
    xlmToStroops,
    stroopsToXlm,
    CONTRACT_ADDRESS,
  };