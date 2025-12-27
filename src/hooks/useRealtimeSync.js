import { useEffect, useCallback } from 'react';
import realtimeSyncService from '../services/realtimeSync';

/**
 * Custom hook for subscribing to real-time data synchronization
 * @param {string} entity - Entity type to subscribe to (patients, estimates, etc.)
 * @param {Function} callback - Callback function to execute on sync events
 * @param {Array} dependencies - Dependencies array for callback
 */
export function useRealtimeSync(entity, callback, dependencies = []) {
  const memoizedCallback = useCallback(callback, dependencies);

  useEffect(() => {
    console.log(`🔄 [useRealtimeSync] Subscribing to ${entity}`);
    
    const unsubscribe = realtimeSyncService?.subscribe(entity, (event) => {
      console.log(`📡 [useRealtimeSync] ${entity} event:`, event);
      memoizedCallback(event);
    });

    return () => {
      console.log(`🗑️ [useRealtimeSync] Unsubscribing from ${entity}`);
      unsubscribe();
    };
  }, [entity, memoizedCallback]);
}

/**
 * Custom hook for subscribing to multiple entities
 * @param {Array<{entity: string, callback: Function}>} subscriptions
 */
export function useMultipleRealtimeSync(subscriptions) {
  useEffect(() => {
    console.log('🔄 [useMultipleRealtimeSync] Setting up multiple subscriptions');
    
    const unsubscribeFunctions = subscriptions?.map(({ entity, callback }) => {
      return realtimeSyncService?.subscribe(entity, (event) => {
        console.log(`📡 [useMultipleRealtimeSync] ${entity} event:`, event);
        callback(event);
      });
    });

    return () => {
      console.log('🗑️ [useMultipleRealtimeSync] Cleaning up all subscriptions');
      unsubscribeFunctions?.forEach(unsubscribe => unsubscribe());
    };
  }, [subscriptions]);
}

/**
 * Custom hook for automatic data refresh on entity changes
 * @param {string} entity - Entity type to watch
 * @param {Function} refreshFunction - Function to call for refresh
 * @param {Array} dependencies - Dependencies for refresh function
 */
export function useAutoRefresh(entity, refreshFunction, dependencies = []) {
  const memoizedRefresh = useCallback(refreshFunction, dependencies);

  useRealtimeSync(
    entity,
    (event) => {
      console.log(`🔄 [useAutoRefresh] Auto-refreshing for ${entity}.${event?.action}`);
      memoizedRefresh();
    },
    [memoizedRefresh]
  );
}

export default useRealtimeSync;