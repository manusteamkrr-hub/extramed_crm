/**
 * Enterprise-Grade Real-Time Synchronization Service with Supabase
 * Replaces BroadcastChannel with native Supabase real-time subscriptions
 * Features: Built-in conflict resolution, automatic offline handling, enterprise reliability
 */

import { supabase } from '../lib/supabase';

class RealtimeSyncService {
  constructor() {
    this.listeners = new Map();
    this.syncCallbacks = new Map();
    this.isInitialized = false;
    this.debugMode = true;
    
    // Supabase real-time channels
    this.realtimeChannels = new Map();
    this.subscriptions = new Map();
    
    // Offline operation queue (fallback for when Supabase is unavailable)
    this.operationQueue = [];
    this.maxQueueSize = 100;
    this.isOnline = navigator?.onLine || true;
    this.supabaseConnected = false;
    
    // Retry configuration with exponential backoff
    this.retryConfig = {
      maxRetries: 5,
      initialDelay: 1000,
      maxDelay: 32000,
      backoffMultiplier: 2
    };
    
    // Active retry operations
    this.activeRetries = new Map();
    
    // Conflict resolution strategy
    this.conflictStrategy = 'last-write-wins';
    
    // Sync state tracking
    this.syncState = {
      lastSuccessfulSync: null,
      failedSyncs: 0,
      queuedOperations: 0,
      inProgress: false,
      supabaseStatus: 'disconnected'
    };

    // Entity to table mapping
    this.entityTableMap = {
      'patients': 'patients',
      'estimates': 'estimates',
      'inpatient_records': 'inpatient_records',
      'staff': 'staff',
      'notifications': 'notifications',
      'medical_history': 'medical_history',
      'documents': 'documents'
    };
  }

  /**
   * Initialize Supabase real-time synchronization system
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('🔄 RealtimeSync already initialized');
      return;
    }

    this.log('🚀 Initializing Supabase Real-Time Sync Service');
    
    // Set up network state monitoring
    this.setupNetworkMonitoring();
    
    // Test Supabase connection
    await this.testSupabaseConnection();
    
    // Set up Supabase real-time channels if connected
    if (this.supabaseConnected) {
      await this.setupSupabaseRealtimeChannels();
    } else {
      this.log('⚠️ Supabase not configured - using fallback mode');
      this.setupFallbackSync();
    }
    
    // Load queued operations from storage
    this.loadQueuedOperations();
    
    // Set up periodic sync check
    this.setupPeriodicSync();
    
    this.isInitialized = true;
    this.log('✅ Real-Time Sync Service initialized');
  }

  /**
   * Test Supabase connection and availability
   */
  async testSupabaseConnection() {
    try {
      // ✅ Enhanced connection test with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      const connectionPromise = supabase?.from('patients')?.select('id')?.limit(1);
      
      const { error } = await Promise.race([connectionPromise, timeoutPromise]);
      
      if (error) {
        if (error?.code === 'PGRST204' || error?.message?.includes('relation')) {
          this.log('⚠️ Supabase tables not found - run DATABASE_SCHEMA.sql');
          this.supabaseConnected = false;
        } else {
          this.log('❌ Supabase connection error:', error?.message);
          this.supabaseConnected = false;
        }
      } else {
        this.log('✅ Supabase connection successful');
        this.supabaseConnected = true;
        this.syncState.supabaseStatus = 'connected';
      }
    } catch (error) {
      this.log('❌ Supabase connection test failed:', error?.message);
      this.supabaseConnected = false;
      this.syncState.supabaseStatus = 'error';
      
      // ✅ Graceful degradation - continue with fallback mode
      this.log('🔄 Switching to fallback sync mode');
      this.setupFallbackSync();
    }
  }

  /**
   * Set up Supabase real-time channels for all entities
   */
  async setupSupabaseRealtimeChannels() {
    this.log('📡 Setting up Supabase real-time channels');

    // Subscribe to each entity table
    for (const [entity, tableName] of Object.entries(this.entityTableMap)) {
      await this.subscribeToTable(entity, tableName);
    }

    // Set up presence channel for cross-tab communication
    await this.setupPresenceChannel();

    this.log('✅ All Supabase real-time channels configured');
  }

  /**
   * Subscribe to a specific table's changes
   */
  async subscribeToTable(entity, tableName) {
    try {
      const channel = supabase?.channel(`${tableName}_changes`)?.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName
          },
          (payload) => {
            this.handleSupabaseChange(entity, payload);
          }
        )?.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.log(`✅ Subscribed to ${tableName} changes`);
          } else if (status === 'CHANNEL_ERROR') {
            this.log(`❌ Error subscribing to ${tableName}`);
            // ✅ Don't throw - allow other subscriptions to continue
          } else if (status === 'TIMED_OUT') {
            this.log(`⏱️ Subscription timeout for ${tableName} - retrying...`);
            // ✅ Auto-retry after timeout
            setTimeout(() => this.subscribeToTable(entity, tableName), 5000);
          }
        });

      this.realtimeChannels?.set(entity, channel);
      this.log(`📝 Set up real-time subscription for ${entity}`);
    } catch (error) {
      this.log(`❌ Failed to subscribe to ${tableName}:`, error?.message);
      // ✅ Continue execution - don't break the entire sync service
    }
  }

  /**
   * Handle Supabase real-time change events
   */
  handleSupabaseChange(entity, payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    this.log(`📢 Supabase change detected: ${entity}.${eventType}`, payload);

    // Map Supabase event types to our action types
    const actionMap = {
      'INSERT': 'create',
      'UPDATE': 'update',
      'DELETE': 'delete'
    };

    const action = actionMap?.[eventType] || eventType?.toLowerCase();
    const data = newRecord || oldRecord;

    // Trigger local listeners with Supabase data
    this.triggerSync(entity, action, data, `supabase_${Date.now()}`);

    // Update last successful sync
    this.syncState.lastSuccessfulSync = Date.now();
  }

  /**
   * Set up presence channel for cross-tab communication
   */
  async setupPresenceChannel() {
    try {
      const presenceChannel = supabase?.channel('extramed_presence', {
        config: {
          presence: {
            key: `user_${Date.now()}_${Math.random()?.toString(36)?.substr(2, 9)}`
          }
        }
      });

      presenceChannel?.on('presence', { event: 'sync' }, () => {
          const state = presenceChannel?.presenceState();
          this.log('👥 Presence sync:', Object.keys(state)?.length, 'active tabs');
        })?.on('presence', { event: 'join' }, ({ key }) => {
          this.log('👋 New tab joined:', key);
        })?.on('presence', { event: 'leave' }, ({ key }) => {
          this.log('👋 Tab left:', key);
        })?.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel?.track({
              online_at: new Date()?.toISOString(),
              user_agent: navigator.userAgent
            });
            this.log('✅ Presence channel active');
          }
        });

      this.realtimeChannels?.set('presence', presenceChannel);
    } catch (error) {
      this.log('⚠️ Presence channel setup failed:', error);
    }
  }

  /**
   * Set up fallback synchronization (when Supabase unavailable)
   */
  setupFallbackSync() {
    this.log('🔄 Setting up fallback sync mode');
    
    // Use localStorage for cross-tab communication
    window.addEventListener('storage', (event) => {
      if (!event?.key?.startsWith('extramed_sync_')) return;
      
      try {
        const syncData = JSON.parse(event?.newValue || '{}');
        const { entity, action, data, operationId } = syncData;
        
        if (entity && action && data) {
          this.log(`💾 Fallback sync detected: ${entity}.${action}`);
          this.triggerSync(entity, action, data, operationId);
        }
      } catch (error) {
        this.log('⚠️ Fallback sync parse error:', error);
      }
    });
  }

  /**
   * Set up network state monitoring
   */
  setupNetworkMonitoring() {
    window.addEventListener('online', async () => {
      this.log('🌐 Network connection restored');
      this.isOnline = true;
      
      // Reconnect to Supabase if needed
      if (!this.supabaseConnected) {
        await this.testSupabaseConnection();
        if (this.supabaseConnected) {
          await this.setupSupabaseRealtimeChannels();
        }
      }
      
      // Process queued operations
      this.processQueuedOperations();
    });

    window.addEventListener('offline', () => {
      this.log('📴 Network connection lost - entering offline mode');
      this.isOnline = false;
      this.syncState.supabaseStatus = 'offline';
    });

    this.isOnline = navigator?.onLine;
    this.log(`Network status: ${this.isOnline ? 'Online' : 'Offline'}`);
  }

  /**
   * Set up periodic sync check
   */
  setupPeriodicSync() {
    // Check every 30 seconds for queued operations
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.operationQueue?.length > 0) {
        this.log('⏰ Periodic sync check - processing queue');
        this.processQueuedOperations();
      }
    }, 30000);
  }

  /**
   * Queue an operation for later execution
   */
  queueOperation(operation) {
    try {
      if (this.operationQueue?.length >= this.maxQueueSize) {
        this.log('⚠️ Operation queue full, removing oldest operation');
        this.operationQueue?.shift();
      }

      const queuedOp = {
        ...operation,
        id: operation?.id || this.generateOperationId(),
        queuedAt: Date.now(),
        retryCount: 0,
        status: 'queued'
      };

      this.operationQueue?.push(queuedOp);
      this.syncState.queuedOperations = this.operationQueue?.length;
      this.saveQueueToStorage();
      
      this.log('📝 Operation queued:', queuedOp);
      this.notify('sync_status', 'operation_queued', {
        queueSize: this.operationQueue?.length,
        operation: queuedOp
      });

      return queuedOp?.id;
    } catch (error) {
      this.log('❌ Failed to queue operation:', error);
      return null;
    }
  }

  /**
   * Process all queued operations
   */
  async processQueuedOperations() {
    if (!this.isOnline || this.syncState?.inProgress) {
      this.log('⏸️ Skipping queue processing - offline or sync in progress');
      return;
    }

    if (this.operationQueue?.length === 0) return;

    this.syncState.inProgress = true;
    this.log(`🔄 Processing ${this.operationQueue?.length} queued operations`);

    const operations = [...this.operationQueue];
    const results = { successful: 0, failed: 0, conflicts: 0 };

    for (const operation of operations) {
      try {
        let result = await this.executeQueuedOperation(operation);
        
        if (result?.success) {
          results.successful++;
          this.removeFromQueue(operation?.id);
        } else if (result?.conflict) {
          results.conflicts++;
          await this.handleConflict(operation, result?.conflictData);
        } else {
          results.failed++;
          await this.retryOperation(operation);
        }
      } catch (error) {
        this.log(`❌ Error processing operation ${operation?.id}:`, error);
        results.failed++;
        await this.retryOperation(operation);
      }
    }

    this.syncState.inProgress = false;
    this.syncState.lastSuccessfulSync = Date.now();
    this.log('✅ Queue processing complete:', results);
    
    this.notify('sync_status', 'queue_processed', {
      results,
      remainingQueue: this.operationQueue?.length
    });
  }

  /**
   * Execute a queued operation using Supabase
   */
  async executeQueuedOperation(operation) {
    this.log(`⚙️ Executing queued operation: ${operation?.entity}.${operation?.action}`);

    try {
      const { entity, action, data } = operation;
      const tableName = this.entityTableMap?.[entity];

      if (!tableName) {
        throw new Error(`Unknown entity: ${entity}`);
      }

      let result;
      switch (action) {
        case 'create':
          result = await supabase?.from(tableName)?.insert(data)?.select()?.single();
          break;
        case 'update':
          result = await supabase?.from(tableName)?.update(data)?.eq('id', data?.id)?.select()?.single();
          break;
        case 'delete':
          result = await supabase?.from(tableName)?.delete()?.eq('id', data?.id);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      if (result?.error) {
        if (this.isConflictError(result?.error)) {
          return { success: false, conflict: true, conflictData: result?.error?.details };
        }
        throw result?.error;
      }

      return { success: true, data: result?.data };
    } catch (error) {
      this.log(`❌ Operation execution failed:`, error);
      
      if (this.isConflictError(error)) {
        return { success: false, conflict: true, conflictData: error?.data };
      }

      return { success: false, error };
    }
  }

  /**
   * Retry a failed operation with exponential backoff
   */
  async retryOperation(operation) {
    const { id, retryCount = 0 } = operation;

    if (retryCount >= this.retryConfig?.maxRetries) {
      this.log(`❌ Max retries reached for operation ${id}`);
      this.syncState.failedSyncs++;
      this.handlePermanentFailure(operation);
      return;
    }

    const delay = Math.min(
      this.retryConfig?.initialDelay * Math.pow(this.retryConfig?.backoffMultiplier, retryCount),
      this.retryConfig?.maxDelay
    );

    this.log(`🔄 Scheduling retry ${retryCount + 1}/${this.retryConfig?.maxRetries} for operation ${id} in ${delay}ms`);

    const opIndex = this.operationQueue?.findIndex(op => op?.id === id);
    if (opIndex !== -1) {
      this.operationQueue[opIndex].retryCount = retryCount + 1;
      this.operationQueue[opIndex].nextRetryAt = Date.now() + delay;
      this.saveQueueToStorage();
    }

    const retryTimeout = setTimeout(async () => {
      this.activeRetries?.delete(id);
      
      if (this.isOnline) {
        let result = await this.executeQueuedOperation(operation);
        
        if (result?.success) {
          this.removeFromQueue(id);
        } else {
          await this.retryOperation(this.operationQueue?.find(op => op?.id === id));
        }
      }
    }, delay);

    this.activeRetries?.set(id, retryTimeout);
  }

  /**
   * Handle conflict resolution with Supabase's built-in conflict detection
   */
  async handleConflict(operation, conflictData) {
    this.log('⚠️ Conflict detected, applying resolution strategy:', this.conflictStrategy);

    try {
      let resolvedData;

      switch (this.conflictStrategy) {
        case 'last-write-wins':
          resolvedData = operation?.data;
          this.log('✅ Conflict resolved: Last-write-wins');
          break;

        case 'merge':
          resolvedData = this.mergeData(operation?.data, conflictData);
          this.log('✅ Conflict resolved: Data merged');
          break;

        case 'manual':
          this.notify('conflict', 'manual_resolution_required', {
            operation,
            conflictData,
            localData: operation?.data
          });
          return;

        default:
          resolvedData = operation?.data;
      }

      let result = await this.executeQueuedOperation({
        ...operation,
        data: resolvedData,
        conflictResolved: true
      });

      if (result?.success) {
        this.removeFromQueue(operation?.id);
        this.notify('conflict', 'resolved', {
          operation,
          strategy: this.conflictStrategy
        });
      }
    } catch (error) {
      this.log('❌ Conflict resolution failed:', error);
      await this.retryOperation(operation);
    }
  }

  /**
   * Merge local and remote data
   */
  mergeData(localData, remoteData) {
    return {
      ...remoteData,
      ...localData,
      updatedAt: remoteData?.updatedAt > localData?.updatedAt 
        ? remoteData?.updatedAt 
        : localData?.updatedAt
    };
  }

  /**
   * Check if error is a conflict error
   */
  isConflictError(error) {
    const conflictIndicators = ['conflict', 'version mismatch', 'stale data', '409', '23505'];
    const errorMessage = (error?.message || error?.code || error?.toString())?.toLowerCase();
    return conflictIndicators?.some(indicator => errorMessage?.includes(indicator));
  }

  /**
   * Handle permanent operation failure
   */
  handlePermanentFailure(operation) {
    this.log(`❌ Permanent failure for operation ${operation?.id}`);
    this.removeFromQueue(operation?.id);
    
    const failedOps = this.getFailedOperations();
    failedOps?.push({
      ...operation,
      failedAt: Date.now(),
      reason: 'max_retries_exceeded'
    });
    
    try {
      localStorage.setItem('extramed_failed_operations', JSON.stringify(failedOps));
    } catch (error) {
      this.log('⚠️ Failed to save failed operation:', error);
    }
    
    this.notify('sync_error', 'permanent_failure', {
      operation,
      failedOperations: failedOps?.length
    });
  }

  /**
   * Get failed operations list
   */
  getFailedOperations() {
    try {
      const stored = localStorage.getItem('extramed_failed_operations');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      this.log('⚠️ Failed to load failed operations:', error);
      return [];
    }
  }

  /**
   * Remove operation from queue
   */
  removeFromQueue(operationId) {
    const index = this.operationQueue?.findIndex(op => op?.id === operationId);
    if (index !== -1) {
      this.operationQueue?.splice(index, 1);
      this.syncState.queuedOperations = this.operationQueue?.length;
      this.saveQueueToStorage();
      
      if (this.activeRetries?.has(operationId)) {
        clearTimeout(this.activeRetries?.get(operationId));
        this.activeRetries?.delete(operationId);
      }
    }
  }

  /**
   * Save operation queue to localStorage
   */
  saveQueueToStorage() {
    try {
      localStorage.setItem('extramed_operation_queue', JSON.stringify(this.operationQueue));
    } catch (error) {
      this.log('⚠️ Failed to save operation queue:', error);
    }
  }

  /**
   * Load queued operations from localStorage
   */
  loadQueuedOperations() {
    try {
      const stored = localStorage.getItem('extramed_operation_queue');
      if (stored) {
        this.operationQueue = JSON.parse(stored);
        this.syncState.queuedOperations = this.operationQueue?.length;
        this.log(`📦 Loaded ${this.operationQueue?.length} queued operations`);
        
        if (this.isOnline && this.operationQueue?.length > 0) {
          setTimeout(() => this.processQueuedOperations(), 2000);
        }
      }
    } catch (error) {
      this.log('⚠️ Failed to load operation queue:', error);
      this.operationQueue = [];
    }
  }

  /**
   * Subscribe to entity changes
   */
  subscribe(entity, callback) {
    if (!this.listeners?.has(entity)) {
      this.listeners?.set(entity, new Set());
    }
    
    this.listeners?.get(entity)?.add(callback);
    this.log(`📝 Subscribed to ${entity} changes`);
    
    return () => {
      this.listeners?.get(entity)?.delete(callback);
      this.log(`🗑️ Unsubscribed from ${entity} changes`);
    };
  }

  /**
   * Notify all subscribers with Supabase or fallback
   */
  async notify(entity, action, data) {
    this.log(`📢 Notifying ${entity}.${action}`, data);
    
    const operationId = this.generateOperationId();
    
    try {
      // If offline, queue the operation
      if (!this.isOnline) {
        this.log('📴 Offline - queueing operation');
        this.queueOperation({ entity, action, data, operationId });
        return operationId;
      }

      // If Supabase connected, operations are handled by real-time subscriptions
      // Just trigger local listeners for immediate UI update
      if (this.supabaseConnected) {
        this.triggerSync(entity, action, data, operationId);
      } else {
        // Fallback: Use localStorage for cross-tab sync
        try {
          const syncKey = `extramed_sync_${Date.now()}`;
          localStorage.setItem(syncKey, JSON.stringify({
            entity,
            action,
            data,
            operationId,
            timestamp: Date.now()
          }));
          // Clean up immediately
          setTimeout(() => localStorage.removeItem(syncKey), 100);
        } catch (error) {
          this.log('⚠️ Fallback notification failed:', error);
        }
        
        // Trigger local listeners
        this.triggerSync(entity, action, data, operationId);
      }
      
      return operationId;
    } catch (error) {
      this.log('❌ Notification failed:', error);
      this.queueOperation({ entity, action, data, operationId, error: error?.message });
      return operationId;
    }
  }

  /**
   * Trigger synchronization callbacks
   */
  triggerSync(entity, action, data, operationId) {
    const callbacks = this.listeners?.get(entity);
    if (!callbacks) return;
    
    callbacks?.forEach(callback => {
      try {
        callback({ 
          entity, 
          action, 
          data, 
          operationId,
          timestamp: Date.now(),
          isOnline: this.isOnline,
          source: this.supabaseConnected ? 'supabase' : 'fallback'
        });
      } catch (error) {
        console.error(`Error in ${entity} sync callback:`, error);
      }
    });
  }

  /**
   * Register a sync callback for specific entity
   */
  registerSyncCallback(entity, name, callback) {
    if (!this.syncCallbacks?.has(entity)) {
      this.syncCallbacks?.set(entity, new Map());
    }
    
    this.syncCallbacks?.get(entity)?.set(name, callback);
    this.log(`✅ Registered sync callback: ${entity}.${name}`);
  }

  /**
   * Execute sync callbacks for entity
   */
  async executeSyncCallbacks(entity, action, data) {
    const callbacks = this.syncCallbacks?.get(entity);
    if (!callbacks) return;
    
    for (const [name, callback] of callbacks?.entries()) {
      try {
        await callback(action, data);
        this.log(`✅ Executed ${entity}.${name} callback`);
      } catch (error) {
        console.error(`Error executing ${entity}.${name} callback:`, error);
      }
    }
  }

  /**
   * Sync patients data across all screens
   */
  syncPatients(action, patientData) {
    this.notify('patients', action, patientData);
    
    if (action === 'create' || action === 'update') {
      this.notify('dashboard', 'patient_stats_changed', patientData);
    }
  }

  /**
   * Sync estimates data across all screens
   */
  syncEstimates(action, estimateData) {
    this.notify('estimates', action, estimateData);
    this.notify('financial_summary', 'estimate_changed', estimateData);
    
    if (this.hasPlacementService(estimateData)) {
      this.notify('inpatient_records', 'estimate_with_placement', estimateData);
    }
  }

  /**
   * Sync inpatient records across all screens
   */
  syncInpatientRecords(action, recordData) {
    this.notify('inpatient_records', action, recordData);
    this.notify('dashboard', 'capacity_changed', recordData);
    this.notify('notifications', 'inpatient_changed', recordData);
  }

  /**
   * Sync staff data across all screens
   */
  syncStaff(action, staffData) {
    this.notify('staff', action, staffData);
    this.notify('staff_directory', 'staff_changed', staffData);
  }

  /**
   * Check if estimate contains placement services
   */
  hasPlacementService(estimate) {
    if (!estimate?.services) return false;
    
    const placementKeywords = [
      'размещение', 'койко-место', 'палата', 'госпитализация',
      'placement', 'hospitalization', 'bed', 'room'
    ];
    
    return estimate?.services?.some(service => {
      const serviceName = (service?.name || '')?.toLowerCase();
      return placementKeywords?.some(keyword => serviceName?.includes(keyword));
    });
  }

  /**
   * Get sync status with Supabase connection info
   */
  getSyncStatus() {
    return {
      ...this.syncState,
      isOnline: this.isOnline,
      supabaseConnected: this.supabaseConnected,
      queuedOperations: this.operationQueue?.length,
      failedOperations: this.getFailedOperations()?.length,
      activeRetries: this.activeRetries?.size,
      activeChannels: this.realtimeChannels?.size
    };
  }

  /**
   * Clear failed operations
   */
  clearFailedOperations() {
    try {
      localStorage.removeItem('extramed_failed_operations');
      this.log('🧹 Failed operations cleared');
      return true;
    } catch (error) {
      this.log('❌ Failed to clear failed operations:', error);
      return false;
    }
  }

  /**
   * Manually retry failed operations
   */
  async retryFailedOperations() {
    const failedOps = this.getFailedOperations();
    
    if (failedOps?.length === 0) {
      this.log('No failed operations to retry');
      return;
    }

    this.log(`🔄 Retrying ${failedOps?.length} failed operations`);
    
    failedOps?.forEach(op => {
      this.queueOperation({
        ...op,
        retryCount: 0,
        status: 'queued'
      });
    });

    this.clearFailedOperations();
    await this.processQueuedOperations();
  }

  /**
   * Set conflict resolution strategy
   */
  setConflictStrategy(strategy) {
    if (['last-write-wins', 'merge', 'manual']?.includes(strategy)) {
      this.conflictStrategy = strategy;
      this.log(`✅ Conflict strategy set to: ${strategy}`);
    } else {
      this.log(`⚠️ Invalid conflict strategy: ${strategy}`);
    }
  }

  /**
   * Generate unique operation ID
   */
  generateOperationId() {
    return `op_${Date.now()}_${Math.random()?.toString(36)?.substr(2, 9)}`;
  }

  /**
   * Force refresh all screens
   */
  forceRefreshAll() {
    this.log('🔄 Force refreshing all screens');
    
    ['patients', 'estimates', 'inpatient_records', 'staff']?.forEach(entity => {
      this.notify(entity, 'force_refresh', { timestamp: Date.now() });
    });
  }

  /**
   * Clean up resources
   */
  cleanup() {
    // Clear intervals
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Clear active retries
    this.activeRetries?.forEach(timeout => clearTimeout(timeout));
    this.activeRetries?.clear();

    // Unsubscribe from all Supabase channels
    this.realtimeChannels?.forEach((channel, entity) => {
      channel?.unsubscribe();
      this.log(`🗑️ Unsubscribed from ${entity} channel`);
    });
    this.realtimeChannels?.clear();
    
    this.listeners?.clear();
    this.syncCallbacks?.clear();
    this.isInitialized = false;
    
    this.log('🧹 Real-Time Sync Service cleaned up');
  }

  /**
   * Debug logging
   */
  log(message, data = null) {
    if (!this.debugMode) return;
    
    const timestamp = new Date()?.toISOString();
    const logMessage = `[RealtimeSync ${timestamp}] ${message}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Create singleton instance
const realtimeSyncService = new RealtimeSyncService();

// Auto-initialize on import
realtimeSyncService?.initialize();

export default realtimeSyncService;