// pages/checkout/index.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as StellarSdk from 'stellar-sdk';
import { getAddress, signTransaction, isConnected, setAllowed } from '@stellar/freighter-api';

const WalletIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

interface ConnectionStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

interface PaymentInfo {
  slotId: string;
  price: string;
  size: string;
  durations: string[];
  category: string;
}

interface QueueInfo {
  slotId: string;
  position: number;
  totalInQueue: number;
  nextActivation?: string;
  isAvailable: boolean;
}

// Stellar configuration
const STELLAR_RECIPIENT = 'GD3CBC4DDBHVP2W67P3I67SORRCWMNZAGGEGXON3JX25WPU7Q2OUH4LN'; // CHANGE THIS
const STELLAR_NETWORK = 'TESTNET'; // or 'MAINNET'

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ type: 'idle', message: '' });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isBidding, setIsBidding] = useState<boolean>(false);
  const [stellarAddress, setStellarAddress] = useState<string>('');
  const [isStellarConnected, setIsStellarConnected] = useState(false);

  // Parse payment information from URL parameters
  useEffect(() => {
    const slotId = searchParams.get('slotId');
    const price = searchParams.get('price');
    const size = searchParams.get('size');
    const durations = searchParams.get('durations')?.split(',') || [];
    const category = searchParams.get('category') || 'general';

    if (slotId && price && size) {
      setPaymentInfo({
        slotId,
        price,
        size,
        durations,
        category
      });
      
      setBidAmount(price);
      fetchQueueInfo(slotId);
    }
  }, [searchParams]);

  // Check if Freighter is installed on mount
  useEffect(() => {
    checkFreighterInstalled();
  }, []);

  const checkFreighterInstalled = async () => {
    try {
      const result = await isConnected();
      console.log('Freighter check:', result);
    } catch (error) {
      console.error('Freighter not found:', error);
      setConnectionStatus({ 
        type: 'error', 
        message: 'Please install Freighter wallet extension' 
      });
    }
  };

  const fetchQueueInfo = async (slotId: string) => {
    try {
      const response = await fetch(`/api/queue-info/${slotId}`);
      if (response.ok) {
        const queueData = await response.json();
        setQueueInfo(queueData);
        setIsBidding(!queueData.isAvailable);
      }
    } catch (error) {
      console.error('Error fetching queue info:', error);
    }
  };

  const handleDisconnect = () => {
    setIsStellarConnected(false);
    setStellarAddress('');
    setConnectionStatus({ type: 'idle', message: '' });
  };

  const connectStellar = async () => {
    try {
      console.log('Attempting to connect to Freighter...');
      setConnectionStatus({ type: 'loading', message: 'Connecting to Freighter...' });
      
      await setAllowed();
      console.log('Permission granted');
      
      const result = await getAddress();
      console.log('Address result:', result);
      
      if (result && result.address) {
        setStellarAddress(result.address);
        setIsStellarConnected(true);
        setConnectionStatus({ type: 'success', message: 'Connected successfully!' });
        setTimeout(() => setConnectionStatus({ type: 'idle', message: '' }), 2000);
      } else {
        throw new Error('No address returned from Freighter');
      }
    } catch (error: any) {
      console.error('Stellar connection error:', error);
      setConnectionStatus({ 
        type: 'error', 
        message: error.message || 'Failed to connect Freighter wallet. Make sure it is installed and unlocked.' 
      });
    }
  };

  // Stellar payment handler with redirect to /upload
  const handleStellarPayment = async () => {
    if (!stellarAddress || !paymentInfo) return;
    
    try {
      setConnectionStatus({ type: 'loading', message: 'Preparing Stellar payment...' });
      
      const finalAmount = isBidding ? bidAmount : paymentInfo.price;
      const server = new StellarSdk.Horizon.Server(
        STELLAR_NETWORK === 'TESTNET' 
          ? 'https://horizon-testnet.stellar.org' 
          : 'https://horizon.stellar.org'
      );
      
      console.log('Loading account:', stellarAddress);
      const account = await server.loadAccount(stellarAddress);
      
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: STELLAR_NETWORK === 'TESTNET' 
          ? StellarSdk.Networks.TESTNET 
          : StellarSdk.Networks.PUBLIC
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: STELLAR_RECIPIENT,
            asset: StellarSdk.Asset.native(), // XLM
            amount: finalAmount
          })
        )
        .addMemo(StellarSdk.Memo.text(`Ad402:${paymentInfo.slotId}`))
        .setTimeout(180)
        .build();
      
      setConnectionStatus({ type: 'loading', message: 'Please sign in Freighter...' });
      
      console.log('Requesting signature...');
      const signResult = await signTransaction(transaction.toXDR(), {
        networkPassphrase: STELLAR_NETWORK === 'TESTNET' 
          ? StellarSdk.Networks.TESTNET 
          : StellarSdk.Networks.PUBLIC
      });
      
      console.log('Sign result:', signResult);
      
      if (signResult && signResult.signedTxXdr) {
        setConnectionStatus({ type: 'loading', message: 'Submitting transaction...' });
        
        const signedTx = StellarSdk.TransactionBuilder.fromXDR(
          signResult.signedTxXdr,
          STELLAR_NETWORK === 'TESTNET' ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC
        ) as StellarSdk.Transaction;
        
        console.log('Submitting to Horizon...');
        const result = await server.submitTransaction(signedTx);
        console.log('Transaction result:', result);
        
        // Record payment in backend
        try {
          await fetch('/api/record-stellar-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transactionHash: result.hash,
              slotId: paymentInfo.slotId,
              amount: finalAmount,
              asset: 'XLM',
              network: STELLAR_NETWORK.toLowerCase(),
              from: stellarAddress,
              to: STELLAR_RECIPIENT,
              memo: `Ad402:${paymentInfo.slotId}`,
              ledger: result.ledger,
              timestamp: new Date().toISOString(),
              isBid: isBidding
            })
          });
        } catch (apiError) {
          console.error('Failed to record payment:', apiError);
        }
        
        setConnectionStatus({ 
          type: 'success', 
          message: 'Payment successful! Redirecting to upload...' 
        });
        
        // Prepare payment data for upload page
        const paymentData = {
          index: paymentInfo.slotId,
          validUpto: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
          txHash: result.hash,
          AmountPaid: finalAmount,
          bidAmount: finalAmount,
          payerAddress: stellarAddress,
          recieverAddress: STELLAR_RECIPIENT
        };

        // Store payment data in session storage
        sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
        sessionStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
        
        // Redirect to upload page with parameters
        setTimeout(() => {
          const uploadParams = new URLSearchParams({
            slotId: paymentInfo.slotId,
            price: paymentInfo.price,
            bidAmount: finalAmount,
            size: paymentInfo.size,
            category: paymentInfo.category,
            transactionHash: result.hash,
            walletAddress: stellarAddress,
            network: `Stellar ${STELLAR_NETWORK}`
          });
          router.push(`/upload?${uploadParams.toString()}`);
        }, 2000);
        
      } else {
        throw new Error('Transaction signing failed or was cancelled');
      }
    } catch (error: any) {
      console.error('Stellar payment error:', error);
      
      let errorMessage = 'Payment failed';
      
      if (error.response?.data) {
        console.error('Horizon error details:', error.response.data);
        const horizonError = error.response.data;
        
        if (horizonError.extras?.result_codes) {
          const codes = horizonError.extras.result_codes;
          console.error('Transaction result codes:', codes);
          
          if (codes.transaction === 'tx_bad_seq') {
            errorMessage = 'Sequence number error. Please refresh and try again.';
          } else if (codes.transaction === 'tx_insufficient_balance') {
            errorMessage = 'Insufficient XLM balance for transaction + fees.';
          } else if (codes.operations && codes.operations[0] === 'op_no_destination') {
            errorMessage = 'Recipient account not found. Please contact support.';
          } else if (codes.operations) {
            errorMessage = `Operation failed: ${codes.operations.join(', ')}`;
          } else {
            errorMessage = `Transaction failed: ${codes.transaction}`;
          }
        } else if (horizonError.title) {
          errorMessage = horizonError.title;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setConnectionStatus({ 
        type: 'error', 
        message: errorMessage 
      });
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const renderConnectionStatus = () => {
    if (connectionStatus.type === 'idle') return null;

    return (
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {connectionStatus.type === 'loading' && (
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent"></div>
            )}
            {connectionStatus.type === 'success' && (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
            {connectionStatus.type === 'error' && (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            )}
            <p className="text-sm font-mono">{connectionStatus.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4 font-mono text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold font-mono text-foreground mb-2">
            Checkout
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Pay with Stellar (XLM)
          </p>
        </div>

        {paymentInfo && (
          <Card className="mb-6 border-border bg-card">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-mono font-bold text-foreground mb-1">
                  {paymentInfo.price} XLM
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  {paymentInfo.slotId} • {paymentInfo.size}
                </div>
              </div>
              
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slot:</span>
                  <span className="text-foreground">{paymentInfo.slotId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="text-foreground">{paymentInfo.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="text-foreground">Stellar {STELLAR_NETWORK}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {queueInfo && (
          <Card className="mb-6 border-border bg-card">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="font-mono font-semibold text-foreground text-sm mb-2">
                  {queueInfo.isAvailable ? 'Slot Available' : 'Slot Occupied'}
                </h3>
                {!queueInfo.isAvailable && (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Queue Position:</span>
                      <span className="text-foreground">{queueInfo.position + 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total in Queue:</span>
                      <span className="text-foreground">{queueInfo.totalInQueue}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {paymentInfo && (
          <Card className="mb-6 border-border bg-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-mono font-semibold text-foreground text-sm mb-2">
                    {isBidding ? 'Bid Amount' : 'Purchase Amount'}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {isBidding 
                      ? 'Higher bids get priority in the queue' 
                      : 'Slot is available for immediate purchase'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bidAmount" className="text-sm font-mono text-foreground">
                    Amount (XLM)
                  </Label>
                  <div className="relative">
                    <Input
                      id="bidAmount"
                      type="number"
                      step="0.01"
                      min={paymentInfo.price}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="font-mono pr-12"
                      placeholder={paymentInfo.price}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      XLM
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    Minimum: {paymentInfo.price} XLM
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            {!isStellarConnected ? (
              <div className="text-center">
                <WalletIcon className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4 font-mono text-sm">
                  Connect your Freighter wallet to continue
                </p>
                <Button 
                  onClick={connectStellar} 
                  className="font-mono"
                  disabled={connectionStatus.type === 'loading'}
                >
                  {connectionStatus.type === 'loading' ? 'Connecting...' : 'Connect Stellar Wallet'}
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Don't have Freighter? <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Install it here</a>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary border border-border">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-foreground" />
                    <div>
                      <p className="font-mono font-medium text-foreground text-sm">Freighter Connected</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatAddress(stellarAddress)}
                      </p>
                    </div>
                  </div>
                </div>

                {paymentInfo && (
                  <div className="space-y-4">
                    <Button
                      onClick={handleStellarPayment}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono h-12"
                      disabled={connectionStatus.type === 'loading'}
                    >
                      {connectionStatus.type === 'loading' 
                        ? 'Processing...' 
                        : isBidding 
                          ? `Bid ${bidAmount} XLM` 
                          : `Pay ${bidAmount} XLM`
                      }
                    </Button>
                    
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      className="w-full font-mono"
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {renderConnectionStatus()}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground font-mono">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}