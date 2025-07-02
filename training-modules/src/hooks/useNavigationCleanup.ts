import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to handle session cleanup when navigating away from module pages
 * This ensures sessions are properly ended when users navigate to different routes
 */
export const useNavigationCleanup = (
  endSessionCallback: () => void,
  isModulePage: boolean = true
) => {
  const location = useLocation();

  useEffect(() => {
    if (!isModulePage) return;

    // Return cleanup function that runs when location changes or component unmounts
    return () => {
      // Only end session if we're navigating away from a module page
      const isStillOnModulePage = location.pathname.startsWith('/module/');
      if (!isStillOnModulePage) {
        console.log('🚪 Navigating away from module, ending session');
        endSessionCallback();
      }
    };
  }, [location.pathname, endSessionCallback, isModulePage]);

  // Also cleanup on window beforeunload (page refresh/close)
  useEffect(() => {
    if (!isModulePage) return;

    const handleBeforeUnload = () => {
      // Note: This won't work reliably in all browsers for session cleanup
      // but we'll keep page refresh working via the session restoration logic
      console.log('🔄 Page unloading, session will be restored on reload');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isModulePage]);
};