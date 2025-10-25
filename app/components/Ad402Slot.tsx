'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // 🎯 ADDED TOAST

interface Ad402SlotProps {
  slotId: string;
  size?: 'banner' | 'square' | 'sidebar' | 'leaderboard' | 'mobile' | 'card';
  price?: string;
  durations?: string[];
  category?: string;
  className?: string;
  clickable?: boolean;
}

export const Ad402Slot: React.FC<Ad402SlotProps> = ({
  slotId,
  size = 'banner',
  price = '0.10',
  durations = ['30m', '1h', '6h', '24h'],
  category = 'general',
  className = '',
  clickable = true
}) => {
  const slotRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [adContent, setAdContent] = useState<string | null>(null);
  const [adPlacementId, setAdPlacementId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAd, setHasAd] = useState(false);
  const [queueInfo, setQueueInfo] = useState<{
    position: number;
    totalInQueue: number;
    nextActivation?: string;
    isAvailable: boolean;
  } | null>(null);

  // 🎯 VIEW TRACKING STATE
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [totalViewTime, setTotalViewTime] = useState(0);
  const [hasShownToast, setHasShownToast] = useState(false); // 🎯 ADDED: Prevent duplicate toasts
  const [sessionId] = useState(() => {
    // Generate or get session ID from localStorage
    if (typeof window !== 'undefined') {
      let sid = localStorage.getItem('ad_session_id');
      if (!sid) {
        sid = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('ad_session_id', sid);
      }
      return sid;
    }
    return `sess_${Date.now()}`;
  });

  // Function to fetch ad content
  const fetchAdContent = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Fetching ad for slot:', slotId);
      const response = await fetch(`/api/ads/${slotId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Ad data:', data);
        
        if (data.hasAd && data.contentUrl) {
          setAdContent(data.contentUrl);
          setAdPlacementId(data.placementId || null);
          setHasAd(true);
        } else {
          setHasAd(false);
        }
      } else {
        console.log('❌ No ad found for slot:', slotId);
        setHasAd(false);
      }
    } catch (error) {
      console.error('❌ Error fetching ad content:', error);
      setHasAd(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch queue information
  const fetchQueueInfo = async () => {
    try {
      const response = await fetch(`/api/queue-info/${slotId}`);
      if (response.ok) {
        const queueData = await response.json();
        setQueueInfo(queueData);
      }
    } catch (error) {
      console.error('Error fetching queue info:', error);
    }
  };

  // 🎯 INTERSECTION OBSERVER for view tracking
  useEffect(() => {
    if (!slotRef.current || !hasAd || !adPlacementId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Ad entered viewport
            setIsInView(true);
            setViewStartTime(Date.now());
            console.log('👁️ Ad entered view:', slotId);
          } else {
            // Ad left viewport
            if (viewStartTime) {
              const duration = Math.floor((Date.now() - viewStartTime) / 1000);
              setTotalViewTime(prev => prev + duration);
              console.log(`👁️ Ad left view. Duration: ${duration}s, Total: ${totalViewTime + duration}s`);
            }
            setIsInView(false);
            setViewStartTime(null);
          }
        });
      },
      {
        threshold: 0.5 // At least 50% visible
      }
    );

    observer.observe(slotRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasAd, adPlacementId, slotId, viewStartTime, totalViewTime]);

  // 🎯 TRACK VIEW TIME and send to API
  useEffect(() => {
    if (!hasAd || !adPlacementId) return;

    // Send view tracking every 10 seconds while in view
    const interval = setInterval(() => {
      if (isInView && viewStartTime) {
        const currentDuration = Math.floor((Date.now() - viewStartTime) / 1000);
        const totalDuration = totalViewTime + currentDuration;
        
        if (totalDuration >= 10) { // Only track views >= 10 seconds
          console.log(`📊 Tracking view: ${totalDuration}s for placement ${adPlacementId}`);
          
          // 🎯 GET WALLET ADDRESS FROM LOCALSTORAGE
          const walletAddress = typeof window !== 'undefined' 
            ? localStorage.getItem('stellar_wallet_address') 
            : null;
          
          fetch('/api/track-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              placementId: adPlacementId,
              sessionId: sessionId,
              viewDuration: totalDuration,
              slotId: slotId,
              walletAddress: walletAddress // 🎯 SEND WALLET ADDRESS
            })
          })
          .then(res => res.json())
          .then(data => {
            // 🎉 SHOW TOAST IF CREDITS EARNED (only once per session per ad)
            if (data.creditsEarned > 0 && !hasShownToast) {
              toast.success('🎉 Credits Earned!', {
                description: `+${data.creditsEarned} XLM for viewing this ad!`,
                duration: 3000,
              });
              setHasShownToast(true);
            }
          })
          .catch(err => console.error('Failed to track view:', err));
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [hasAd, adPlacementId, isInView, viewStartTime, totalViewTime, sessionId, slotId, hasShownToast]);

  // 🎯 SEND FINAL VIEW TIME on unmount
  useEffect(() => {
    return () => {
      if (adPlacementId && totalViewTime > 0) {
        const finalDuration = viewStartTime 
          ? totalViewTime + Math.floor((Date.now() - viewStartTime) / 1000)
          : totalViewTime;
        
        if (finalDuration >= 10) {
          console.log(`📊 Final view time: ${finalDuration}s`);
          
          // 🎯 GET WALLET ADDRESS
          const walletAddress = typeof window !== 'undefined' 
            ? localStorage.getItem('stellar_wallet_address') 
            : null;
          
          // Use sendBeacon for reliable sending on page unload
          if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify({
              placementId: adPlacementId,
              sessionId: sessionId,
              viewDuration: finalDuration,
              slotId: slotId,
              walletAddress: walletAddress // 🎯 SEND WALLET ADDRESS
            })], { type: 'application/json' });
            navigator.sendBeacon('/api/track-view', blob);
          }
        }
      }
    };
  }, [adPlacementId, totalViewTime, viewStartTime, sessionId, slotId]);

  useEffect(() => {
    if (slotRef.current) {
      slotRef.current.setAttribute('data-slot-id', slotId);
      slotRef.current.setAttribute('data-size', size);
      slotRef.current.setAttribute('data-price', price);
      slotRef.current.setAttribute('data-durations', durations.join(','));
      slotRef.current.setAttribute('data-category', category);
    }
    
    fetchAdContent();
    fetchQueueInfo();
  }, [slotId, size, price, durations, category]);

  const handleSlotClick = () => {
    if (clickable) {
      const params = new URLSearchParams({
        slotId,
        price,
        size,
        durations: durations.join(','),
        category
      });
      router.push(`/checkout?${params.toString()}`);
    }
  };

  const dimensions = getDimensions(size);
  const fontSizes = getOptimalFontSizes(dimensions);

  // If loading, show loading state
  if (isLoading) {
    return (
      <div
        ref={slotRef}
        className={`ad402-slot ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: '100%',
          maxHeight: '100%',
          border: '2px dashed hsl(var(--border))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'hsl(var(--background))',
          padding: '4px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
          margin: '0 auto'
        }}
      >
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent"></div>
      </div>
    );
  }

  // If ad exists, show the ad with "Book Next Slot" button
  if (hasAd && adContent) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div
          ref={slotRef}
          className={`ad402-slot ${className}`}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: '100%',
            maxHeight: '100%',
            border: '2px solid hsl(var(--border))',
            backgroundColor: 'hsl(var(--background))',
            boxSizing: 'border-box',
            overflow: 'hidden',
            position: 'relative',
            margin: '0 auto'
          }}
        >
          <img
            src={adContent}
            alt="Advertisement"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer'
            }}
            onClick={() => {
              console.log(`Ad clicked: ${slotId}`);
            }}
            onError={() => {
              setHasAd(false);
              setAdContent(null);
            }}
          />
        </div>
        
        {/* Book Next Slot Button */}
        {clickable && (
          <button
            onClick={handleSlotClick}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              minWidth: '24px',
              height: '24px',
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              border: 'none',
              borderRadius: '0',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'JetBrains Mono, monospace',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              zIndex: 10,
              padding: queueInfo && queueInfo.totalInQueue > 0 ? '0 6px' : '0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.9)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--primary))';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={queueInfo && queueInfo.totalInQueue > 0 
              ? `Book next slot (${queueInfo.totalInQueue} in queue)` 
              : "Book next slot"
            }
          >
            {queueInfo && queueInfo.totalInQueue > 0 ? queueInfo.totalInQueue : '+'}
          </button>
        )}
      </div>
    );
  }

  // Show placeholder slot for purchase
  return (
    <div
      ref={slotRef}
      className={`ad402-slot ${className} ${clickable ? 'cursor-pointer hover:bg-secondary transition-colors' : ''}`}
      onClick={handleSlotClick}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: '100%',
        maxHeight: '100%',
        border: '2px dashed hsl(var(--border))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'hsl(var(--background))',
        padding: '4px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        margin: '0 auto'
      }}
    >
      <div 
        style={{ 
          textAlign: 'center', 
          color: 'hsl(var(--foreground))',
          fontFamily: 'JetBrains Mono, monospace',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <div style={{ fontSize: fontSizes.icon, marginBottom: '2px', lineHeight: '1' }}>💳</div>
        <div style={{ fontSize: fontSizes.title, fontWeight: '600', marginBottom: '1px', lineHeight: '1.1' }}>
          Ad Slot: {slotId}
        </div>
        <div style={{ fontSize: fontSizes.subtitle, marginBottom: '1px', lineHeight: '1.1', color: 'hsl(var(--muted-foreground))' }}>
          {price} XLM • {size}
        </div>
        {queueInfo && !queueInfo.isAvailable && (
          <div style={{ fontSize: fontSizes.small, marginBottom: '1px', lineHeight: '1.1', color: 'hsl(var(--primary))', fontWeight: 'bold' }}>
            {queueInfo.totalInQueue} in queue
          </div>
        )}
        <div style={{ fontSize: fontSizes.small, marginBottom: '1px', lineHeight: '1.1', color: 'hsl(var(--muted-foreground))' }}>
          Stellar XLM
        </div>
        {clickable && (
          <div style={{ fontSize: fontSizes.small, lineHeight: '1.1', color: 'hsl(var(--muted-foreground))' }}>
            {queueInfo && !queueInfo.isAvailable ? 'Click to bid' : 'Click to purchase'}
          </div>
        )}
      </div>
    </div>
  );
};

function getDimensions(size: string) {
  const dimensions = {
    banner: { width: 728, height: 90 },
    leaderboard: { width: 728, height: 90 },
    square: { width: 300, height: 250 },
    sidebar: { width: 160, height: 600 },
    mobile: { width: 320, height: 60 },
    card: { width: 300, height: 220 }
  };
  return dimensions[size as keyof typeof dimensions] || dimensions.banner;
}

function getOptimalFontSizes(dimensions: { width: number; height: number }) {
  const { width, height } = dimensions;
  const baseSize = Math.min(width, height) * 0.08;
  
  return {
    icon: `${Math.max(12, Math.min(24, baseSize * 1.5))}px`,
    title: `${Math.max(8, Math.min(14, baseSize))}px`,
    subtitle: `${Math.max(7, Math.min(12, baseSize * 0.8))}px`,
    small: `${Math.max(6, Math.min(10, baseSize * 0.7))}px`
  };
}