import React, { useState, useEffect, useRef } from 'react';
import './PullToRefresh.css';

const PullToRefresh = ({ onRefresh, children, threshold = 80, disabled = false }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(true);
  
  const containerRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e) => {
      // Only allow pull if at the top of the scrollable area
      if (container.scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
        currentYRef.current = startYRef.current;
        isDraggingRef.current = true;
        setCanPull(true);
      } else {
        setCanPull(false);
      }
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || !canPull) return;

      currentYRef.current = e.touches[0].clientY;
      const distance = currentYRef.current - startYRef.current;

      if (distance > 0 && container.scrollTop <= 0) {
        e.preventDefault(); // Prevent default scroll
        const pullDistance = Math.min(distance * 0.5, threshold * 1.5); // Damping factor
        setPullDistance(pullDistance);
        setIsPulling(pullDistance > 10);

        if (pullDistance >= threshold) {
          setIsPulling(true);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isDraggingRef.current) return;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setIsPulling(false);
        
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Spring back
        setPullDistance(0);
        setIsPulling(false);
      }

      isDraggingRef.current = false;
      startYRef.current = 0;
      currentYRef.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [pullDistance, threshold, canPull, isRefreshing, disabled, onRefresh]);

  const pullPercentage = Math.min((pullDistance / threshold) * 100, 100);
  const shouldShowIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div 
      ref={containerRef}
      className="pull-to-refresh-container"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling && !isRefreshing ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {shouldShowIndicator && (
        <div className="pull-to-refresh-indicator">
          {isRefreshing ? (
            <>
              <div className="spinner-border spinner-border-sm text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Refreshing...</span>
            </>
          ) : (
            <>
              <div 
                className="pull-to-refresh-icon"
                style={{
                  transform: `rotate(${pullPercentage * 3.6}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
              >
                ↓
              </div>
              <span className="ms-2">
                {pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      )}
      <div className="pull-to-refresh-content">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;

