import { useState, useEffect, useRef, useCallback } from 'react';

interface TimeSegment {
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface UseActiveTimeTrackerProps {
  isActive: boolean; // Whether the module/quiz is currently active
  onTimeUpdate?: (activeSeconds: number) => void;
  updateInterval?: number; // How often to call onTimeUpdate (ms)
}

export const useActiveTimeTracker = ({
  isActive,
  onTimeUpdate,
  updateInterval = 5000 // Default: update every 5 seconds
}: UseActiveTimeTrackerProps) => {
  const [totalActiveTime, setTotalActiveTime] = useState(0);
  const [isCurrentlyTracking, setIsCurrentlyTracking] = useState(false);
  
  // Refs to track current segment and intervals
  const currentSegmentStart = useRef<number | null>(null);
  const timeSegments = useRef<TimeSegment[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lastOnTimeUpdateCall = useRef<number>(0); // 🔥 FIX: Track when we last called onTimeUpdate

  // Calculate total active time from all segments plus current segment
  const calculateTotalActiveTime = useCallback(() => {
    const completedTime = timeSegments.current.reduce(
      (sum, segment) => sum + (segment.duration || 0), 
      0
    );
    
    const currentTime = currentSegmentStart.current 
      ? Math.floor((Date.now() - currentSegmentStart.current) / 1000)
      : 0;
    
    return completedTime + currentTime;
  }, []);

  // Start tracking a new time segment
  const startTracking = useCallback(() => {
    if (currentSegmentStart.current) {
      console.log('⚠️ Already tracking, not starting new segment');
      return; // Already tracking
    }
    
    console.log('📍 Starting active time tracking');
    currentSegmentStart.current = Date.now();
    setIsCurrentlyTracking(true);
  }, []);

  // End current tracking segment and save it
  const stopTracking = useCallback(() => {
    if (!currentSegmentStart.current) {
      console.log('⚠️ Not tracking, nothing to stop');
      return; // Not tracking
    }
    
    const endTime = Date.now();
    const duration = Math.floor((endTime - currentSegmentStart.current) / 1000);
    
    console.log(`⏹️ Stopping active time tracking. Segment duration: ${duration}s`);
    
    // 🔥 FIX: Only save meaningful segments (at least 3 seconds)
    if (duration >= 3) {
      timeSegments.current.push({
        startTime: currentSegmentStart.current,
        endTime,
        duration
      });
      console.log(`💾 Saved time segment: ${duration}s`);
    } else {
      console.log(`⏭️ Skipped short segment: ${duration}s`);
    }
    
    currentSegmentStart.current = null;
    setIsCurrentlyTracking(false);
    
    // Update total time
    const newTotal = calculateTotalActiveTime();
    setTotalActiveTime(newTotal);
    
    return duration;
  }, [calculateTotalActiveTime]);

  // Handle visibility change (page hidden/visible)
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    
    console.log(`👁️ Page visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
    
    if (isActive) {
      if (isVisible && !isCurrentlyTracking) {
        startTracking();
      } else if (!isVisible && isCurrentlyTracking) {
        stopTracking();
      }
    }
  }, [isActive, isCurrentlyTracking, startTracking, stopTracking]);

  // Handle window focus/blur
  const handleFocusChange = useCallback(() => {
    const isFocused = document.hasFocus();
    
    console.log(`🎯 Window focus changed: ${isFocused ? 'focused' : 'blurred'}`);
    
    if (isActive) {
      if (isFocused && !isCurrentlyTracking) {
        startTracking();
      } else if (!isFocused && isCurrentlyTracking) {
        stopTracking();
      }
    }
  }, [isActive, isCurrentlyTracking, startTracking, stopTracking]);

  // Start/stop tracking based on isActive prop
  useEffect(() => {
    if (isActive && !isCurrentlyTracking && !document.hidden && document.hasFocus()) {
      startTracking();
    } else if (!isActive && isCurrentlyTracking) {
      stopTracking();
    }
  }, [isActive, isCurrentlyTracking, startTracking, stopTracking]);

  // Set up event listeners for visibility and focus
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocusChange);
    window.addEventListener('blur', handleFocusChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocusChange);
      window.removeEventListener('blur', handleFocusChange);
    };
  }, [handleVisibilityChange, handleFocusChange]);

  // 🔥 FIX: Set up periodic updates WITHOUT creating new segments
  useEffect(() => {
    if (onTimeUpdate && isCurrentlyTracking) {
      updateIntervalRef.current = setInterval(() => {
        const currentTotal = calculateTotalActiveTime();
        
        // 🔥 FIX: Only call onTimeUpdate if enough time has passed since last call
        const now = Date.now();
        if (now - lastOnTimeUpdateCall.current >= updateInterval) {
          console.log(`⏱️ Periodic update: ${currentTotal}s total active time`);
          onTimeUpdate(currentTotal);
          lastOnTimeUpdateCall.current = now;
          setTotalActiveTime(currentTotal);
        }
      }, Math.min(updateInterval, 3000)); // Update at most every 3 seconds
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isCurrentlyTracking, onTimeUpdate, updateInterval, calculateTotalActiveTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isCurrentlyTracking) {
        stopTracking();
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isCurrentlyTracking, stopTracking]);

  // Public methods for manual control
  const forceUpdate = useCallback(() => {
    const currentTotal = calculateTotalActiveTime();
    setTotalActiveTime(currentTotal);
    if (onTimeUpdate) {
      onTimeUpdate(currentTotal);
      lastOnTimeUpdateCall.current = Date.now();
    }
    return currentTotal;
  }, [calculateTotalActiveTime, onTimeUpdate]);

  const reset = useCallback(() => {
    console.log('🔄 Resetting active time tracker');
    if (isCurrentlyTracking) {
      stopTracking();
    }
    timeSegments.current = [];
    setTotalActiveTime(0);
    lastUpdateRef.current = 0;
    lastOnTimeUpdateCall.current = 0;
  }, [isCurrentlyTracking, stopTracking]);

  const getDetailedStats = useCallback(() => {
    return {
      totalActiveTime: calculateTotalActiveTime(),
      segmentCount: timeSegments.current.length,
      isCurrentlyTracking,
      currentSegmentDuration: currentSegmentStart.current 
        ? Math.floor((Date.now() - currentSegmentStart.current) / 1000)
        : 0,
      segments: timeSegments.current.map(segment => ({
        duration: segment.duration || 0,
        startTime: new Date(segment.startTime).toISOString(),
        endTime: segment.endTime ? new Date(segment.endTime).toISOString() : null
      }))
    };
  }, [calculateTotalActiveTime, isCurrentlyTracking]);

  return {
    // Current state
    totalActiveTime,
    isCurrentlyTracking,
    
    // Manual controls
    startTracking,
    stopTracking,
    forceUpdate,
    reset,
    
    // Debug/stats
    getDetailedStats
  };
};