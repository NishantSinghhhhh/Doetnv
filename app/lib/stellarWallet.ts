import {
  isConnected,
  getAddress,
  signTransaction,
  setAllowed,
  getNetwork,
  getNetworkDetails,
} from "@stellar/freighter-api";

/**
 * Check if Freighter wallet is installed in the browser
 */
export const isFreighterInstalled = async (): Promise<boolean> => {
  try {
    const result = await isConnected();
    // isConnected returns an object with { isConnected: boolean, error?: any }
    return result.isConnected;
  } catch (error) {
    console.error("Error checking Freighter installation:", error);
    return false;
  }
};

/**
 * Connect to Freighter wallet and request permission
 */
export const connectFreighter = async (): Promise<{
  success: boolean;
  publicKey?: string;
  error?: string;
}> => {
  try {
    // Check if Freighter is installed
    const installed = await isFreighterInstalled();
    if (!installed) {
      return {
        success: false,
        error: "Freighter wallet is not installed. Please install it from https://www.freighter.app/",
      };
    }

    // Request permission to connect
    await setAllowed();

    // Get the address after permission is granted
    // getAddress returns an object with { address: string, error?: any }
    const result = await getAddress();
    
    if (result.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      publicKey: result.address, // Using 'address' field from the result
    };
  } catch (error) {
    console.error("Error connecting to Freighter:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect to Freighter wallet",
    };
  }
};

/**
 * Get the connected Stellar public key/address
 */
export const getStellarPublicKey = async (): Promise<string | null> => {
  try {
    const result = await getAddress();
    
    if (result.error) {
      console.error("Error getting address:", result.error);
      return null;
    }
    
    return result.address || null;
  } catch (error) {
    console.error("Error getting address:", error);
    return null;
  }
};

/**
 * Get the network that Freighter is currently connected to
 */
export const getFreighterNetwork = async (): Promise<string> => {
  try {
    const result = await getNetwork();
    
    if (result.error) {
      console.error("Error getting network:", result.error);
      return "TESTNET";
    }
    
    // Returns network name like "TESTNET" or "PUBLIC"
    return result.network || "TESTNET";
  } catch (error) {
    console.error("Error getting network:", error);
    return "TESTNET";
  }
};

/**
 * Get detailed network information including passphrase
 */
export const getFreighterNetworkDetails = async (): Promise<{
  network: string;
  networkPassphrase: string;
  networkUrl: string;
} | null> => {
  try {
    const result = await getNetworkDetails();
    
    if (result.error) {
      console.error("Error getting network details:", result.error);
      return null;
    }
    
    return {
      network: result.network,
      networkPassphrase: result.networkPassphrase,
      networkUrl: result.networkUrl,
    };
  } catch (error) {
    console.error("Error getting network details:", error);
    return null;
  }
};

/**
 * Disconnect from Freighter wallet (clear local state)
 */
export const disconnectFreighter = (): void => {
  // Freighter doesn't have a built-in disconnect function
  // You'll need to manage the connection state in your app
  console.log("Disconnected from Freighter wallet");
};

/**
 * Sign a transaction with Freighter
 * @param xdr - Transaction XDR string to sign
 * @param network - Optional network ("TESTNET" or "PUBLIC")
 */
export const signTransactionWithFreighter = async (
  xdr: string,
  network?: string
): Promise<{
  success: boolean;
  signedXDR?: string;
  error?: string;
}> => {
  try {
    // Map common network identifiers to actual Stellar network passphrases
    const networkPassphrase =
      network === "PUBLIC"
        ? "Public Global Stellar Network ; September 2015"
        : network === "TESTNET"
        ? "Test SDF Network ; September 2015"
        : undefined;

    // signTransaction expects options like { networkPassphrase?: string; address?: string }
    const result = await signTransaction(xdr, {
      networkPassphrase: networkPassphrase,
      address: undefined, // Use the currently selected account in Freighter
    });

    if (result.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      signedXDR: result.signedTxXdr ?? (result as any).signedTransaction,
    };
  } catch (error) {
    console.error("Error signing transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign transaction",
    };
  }
};