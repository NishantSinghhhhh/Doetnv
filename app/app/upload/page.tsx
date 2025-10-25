// pages/upload/index.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Simple SVG icons
const CloudUploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface UploadStatus {
  type: 'idle' | 'uploading' | 'storing' | 'success' | 'error';
  message: string;
  progress?: number;
}

interface PaymentInfo {
  slotId: string;
  price: string;
  size: string;
  durations: string[];
  category: string;
}

interface PaymentData {
  index: string;
  validUpto: number;
  txHash: string;
  AmountPaid: string;
  bidAmount?: string;
  payerAddress: string;
  recieverAddress: string;
}

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: 'idle', message: '' });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lighthouseHash, setLighthouseHash] = useState<string | null>(null);

  // Load payment data from URL parameters or session storage
  useEffect(() => {
    // First try to get from URL parameters (from checkout redirect)
    const slotId = searchParams.get('slotId');
    const price = searchParams.get('price');
    const bidAmount = searchParams.get('bidAmount');
    const size = searchParams.get('size');
    const category = searchParams.get('category');
    const transactionHash = searchParams.get('transactionHash');
    const walletAddress = searchParams.get('walletAddress');
    const network = searchParams.get('network');

    if (slotId && price && size && walletAddress) {
      // Create payment data from URL parameters
      const validUpto = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      setPaymentData({
        index: `${slotId}-${Date.now()}`,
        validUpto,
        txHash: transactionHash || `pending-${Date.now()}`,
        AmountPaid: bidAmount || price,
        bidAmount: bidAmount || undefined,
        payerAddress: walletAddress,
        recieverAddress: 'GD3CBC4DDBHVP2W67P3I67SORRCWMNZAGGEGXON3JX25WPU7Q2OUH4LN' // Your recipient address
      });

      setPaymentInfo({
        slotId,
        price,
        size,
        durations: ['1h'],
        category: category || 'general'
      });

      console.log('Payment data loaded from URL:', {
        slotId,
        price,
        bidAmount,
        walletAddress,
        transactionHash
      });
    } else {
      // Fall back to session storage
      const storedPaymentData = sessionStorage.getItem('paymentData');
      const storedPaymentInfo = sessionStorage.getItem('paymentInfo');

      if (storedPaymentData && storedPaymentInfo) {
        setPaymentData(JSON.parse(storedPaymentData));
        setPaymentInfo(JSON.parse(storedPaymentInfo));
        console.log('Payment data loaded from session storage');
      } else {
        console.warn('No payment data found. Redirecting to home...');
        setTimeout(() => router.push('/'), 3000);
      }
    }
  }, [router, searchParams]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadStatus({ type: 'error', message: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({ type: 'error', message: 'File size must be less than 5MB' });
      return;
    }

    setSelectedFile(file);
    setUploadStatus({ type: 'idle', message: '' });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  // Upload via backend API (fixed version)
  const uploadViaBackend = async (file: File): Promise<string> => {
    if (!paymentData || !paymentInfo) {
      throw new Error('Payment data not available');
    }

    const formData = new FormData();
    formData.append('slotId', paymentInfo.slotId);
    formData.append('advertiserWallet', paymentData.payerAddress);
    formData.append('contentType', 'image');
    formData.append('clickUrl', 'https://example.com');
    formData.append('description', `Ad for slot ${paymentInfo.slotId}`);
    formData.append('duration', '1h');
    formData.append('price', paymentInfo.price);
    formData.append('paymentHash', paymentData.txHash);
    formData.append('adFile', file);

    console.log('Uploading via backend API...');
    
    const response = await fetch('/api/ad-submissions', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    console.log('Backend upload result:', result);
    
    // Return the IPFS hash
    return result.submission.fileUpload.hash;
    
  };
  // Navigate to /blog after successful storage


  // Store ad record in database
  const storeAdRecord = async (mediaHash: string): Promise<void> => {
    if (!paymentData || !paymentInfo) throw new Error('Payment data not available');

    const adRecord = {
      slotId: paymentInfo.slotId,
      mediaHash: mediaHash,
      paymentData: paymentData,
      paymentInfo: paymentInfo
    };

    console.log('Storing ad record:', adRecord);

    const response = await fetch('/api/upload-ad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adRecord)
    });

    if (!response.ok) {
      const errorResult = await response.json();
      throw new Error(errorResult.error || 'Failed to store ad record');
    }

    return response.json();
  };
  
  // Handle complete upload process
  const handleUpload = async () => {
    if (!selectedFile || !paymentData) return;

    try {
      setUploadStatus({ type: 'uploading', message: 'Uploading your ad to IPFS...', progress: 25 });

      // Upload via backend (which handles Lighthouse)
      const mediaHash = await uploadViaBackend(selectedFile);
      setLighthouseHash(mediaHash);
      
      setUploadStatus({ type: 'uploading', message: 'Processing your ad...', progress: 60 });

      // Store in database
      setUploadStatus({ type: 'storing', message: 'Finalizing...', progress: 80 });
      await storeAdRecord(mediaHash);

      setUploadStatus({ type: 'success', message: 'Ad uploaded successfully!', progress: 100 });

      // Clean up session storage
      sessionStorage.removeItem('paymentData');
      sessionStorage.removeItem('paymentInfo');

    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadStatus({ 
        type: 'error', 
        message: error.message || 'Upload failed. Please try again.' 
      });
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } } as any;
      handleFileSelect(event);
    }
  };

  const renderUploadStatus = () => {
    if (uploadStatus.type === 'idle') return null;

    const statusConfig = {
      uploading: { icon: CloudUploadIcon, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
      storing: { icon: CloudUploadIcon, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
      success: { icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
      error: { icon: ExclamationTriangleIcon, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' }
    };

    const config = statusConfig[uploadStatus.type];
    const Icon = config.icon;

    return (
      <Card className={`border ${config.border} ${config.bg}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <p className="text-sm font-mono font-medium">{uploadStatus.message}</p>
          </div>
          {uploadStatus.progress !== undefined && (
            <Progress value={uploadStatus.progress} className="h-2" />
          )}
          {uploadStatus.type === 'success' && lighthouseHash && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-mono text-muted-foreground">IPFS Hash:</p>
              <p className="text-xs font-mono break-all text-foreground">{lighthouseHash}</p>
              <a
                href={`https://gateway.lighthouse.storage/ipfs/${lighthouseHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 font-mono"
              >
                View on IPFS Gateway →
              </a>
            </div>
          )}
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
            Upload Your Ad
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            Upload your advertisement image to IPFS
          </p>
        </div>

        {paymentInfo && paymentData && (
          <Card className="mb-6 border-border bg-card">
            <CardHeader>
              <CardTitle className="font-mono text-lg">Payment Confirmed</CardTitle>
              <CardDescription className="font-mono">
                Your payment has been processed. Upload your ad to complete.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slot:</span>
                  <span className="text-foreground">{paymentInfo.slotId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <Badge variant="outline">{paymentInfo.size}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="text-foreground">{paymentData.AmountPaid} XLM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TX Hash:</span>
                  <span className="text-foreground text-xs">{paymentData.txHash.slice(0, 16)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer p-8 text-center"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <CloudUploadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-mono text-sm mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
                    Image files only (max 5MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover border border-border"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between p-4 bg-secondary border border-border">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-foreground" />
                    <div>
                      <p className="font-mono text-sm text-foreground">{selectedFile.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setUploadStatus({ type: 'idle', message: '' });
                    }}
                    variant="outline"
                    size="sm"
                    className="font-mono"
                  >
                    Remove
                  </Button>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploadStatus.type === 'uploading' || uploadStatus.type === 'storing' || !paymentData}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono h-12"
                >
                  {uploadStatus.type === 'uploading' || uploadStatus.type === 'storing'
                    ? 'Uploading...'
                    : 'Upload to IPFS'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {renderUploadStatus()}
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground font-mono">Loading upload page...</p>
        </div>
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  );
}