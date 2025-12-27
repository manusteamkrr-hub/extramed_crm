import { supabase } from '../lib/supabase';

/**
 * Real-time Analytics Service
 * Provides live streaming of operational and financial metrics
 */

class RealtimeAnalyticsService {
  constructor() {
    this.subscriptions = new Map();
    this.metricsCache = new Map();
    this.updateCallbacks = new Map();
  }

  /**
   * Subscribe to real-time patient status updates
   */
  subscribeToPatientStatus(callback) {
    const channel = supabase?.channel('patient-status-changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients'
        },
        async (payload) => {
          const metrics = await this.calculatePatientMetrics();
          callback(metrics);
        }
      )?.subscribe();

    this.subscriptions?.set('patient-status', channel);
    return () => this.unsubscribe('patient-status');
  }

  /**
   * Subscribe to real-time room occupancy updates
   */
  subscribeToRoomOccupancy(callback) {
    const channel = supabase?.channel('room-occupancy-changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inpatient_journal'
        },
        async (payload) => {
          const occupancy = await this.calculateRoomOccupancy();
          callback(occupancy);
        }
      )?.subscribe();

    this.subscriptions?.set('room-occupancy', channel);
    return () => this.unsubscribe('room-occupancy');
  }

  /**
   * Subscribe to real-time financial metrics
   */
  subscribeToFinancialMetrics(callback) {
    const channel = supabase?.channel('financial-metrics-changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'estimates'
        },
        async (payload) => {
          const metrics = await this.calculateFinancialMetrics();
          callback(metrics);
        }
      )?.subscribe();

    this.subscriptions?.set('financial-metrics', channel);
    return () => this.unsubscribe('financial-metrics');
  }

  /**
   * Subscribe to operational alerts
   */
  subscribeToOperationalAlerts(callback) {
    const channel = supabase?.channel('operational-alerts')?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          if (payload?.new?.priority === 'high' || payload?.new?.priority === 'critical') {
            callback(payload?.new);
          }
        }
      )?.subscribe();

    this.subscriptions?.set('operational-alerts', channel);
    return () => this.unsubscribe('operational-alerts');
  }

  /**
   * Calculate real-time patient metrics
   */
  async calculatePatientMetrics() {
    try {
      const { data: patients, error } = await supabase?.from('patients')?.select('status, created_at');

      if (error) throw error;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const metrics = {
        total: patients?.length || 0,
        active: patients?.filter(p => p?.status === 'active')?.length || 0,
        discharged: patients?.filter(p => p?.status === 'discharged')?.length || 0,
        newToday: patients?.filter(p => new Date(p.created_at) >= today)?.length || 0,
        timestamp: now?.toISOString()
      };

      this.metricsCache?.set('patient-metrics', metrics);
      return metrics;
    } catch (error) {
      console.error('Error calculating patient metrics:', error);
      return this.metricsCache?.get('patient-metrics') || this.getDefaultPatientMetrics();
    }
  }

  /**
   * Calculate real-time room occupancy
   */
  async calculateRoomOccupancy() {
    try {
      const { data: rooms, error: roomsError } = await supabase?.from('rooms')?.select('id, room_number, capacity, status');

      if (roomsError) throw roomsError;

      const { data: inpatients, error: inpatientsError } = await supabase?.from('inpatient_journal')?.select('room_id, status')?.eq('status', 'admitted');

      if (inpatientsError) throw inpatientsError;

      const totalRooms = rooms?.length || 0;
      const totalCapacity = rooms?.reduce((sum, room) => sum + (room?.capacity || 0), 0) || 0;
      const occupiedBeds = inpatients?.length || 0;
      const occupiedRooms = new Set(inpatients?.map(ip => ip.room_id))?.size || 0;

      const occupancy = {
        totalRooms,
        occupiedRooms,
        availableRooms: totalRooms - occupiedRooms,
        totalCapacity,
        occupiedBeds,
        availableBeds: totalCapacity - occupiedBeds,
        occupancyRate: totalCapacity > 0 ? ((occupiedBeds / totalCapacity) * 100)?.toFixed(1) : 0,
        roomOccupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100)?.toFixed(1) : 0,
        timestamp: new Date()?.toISOString(),
        roomDetails: rooms?.map(room => {
          const roomInpatients = inpatients?.filter(ip => ip?.room_id === room?.id) || [];
          return {
            id: room?.id,
            roomNumber: room?.room_number,
            capacity: room?.capacity,
            occupied: roomInpatients?.length,
            available: room?.capacity - roomInpatients?.length,
            status: room?.status
          };
        }) || []
      };

      this.metricsCache?.set('room-occupancy', occupancy);
      return occupancy;
    } catch (error) {
      console.error('Error calculating room occupancy:', error);
      return this.metricsCache?.get('room-occupancy') || this.getDefaultRoomOccupancy();
    }
  }

  /**
   * Calculate real-time financial metrics
   */
  async calculateFinancialMetrics() {
    try {
      const { data: estimates, error } = await supabase?.from('estimates')?.select('status, total_amount, created_at');

      if (error) throw error;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const metrics = {
        totalRevenue: estimates?.reduce((sum, est) => sum + (est?.total_amount || 0), 0) || 0,
        pendingAmount: estimates?.filter(est => est?.status === 'pending')
          ?.reduce((sum, est) => sum + (est?.total_amount || 0), 0) || 0,
        approvedAmount: estimates?.filter(est => est?.status === 'approved')
          ?.reduce((sum, est) => sum + (est?.total_amount || 0), 0) || 0,
        todayRevenue: estimates?.filter(est => new Date(est.created_at) >= today)
          ?.reduce((sum, est) => sum + (est?.total_amount || 0), 0) || 0,
        monthRevenue: estimates?.filter(est => new Date(est.created_at) >= thisMonth)
          ?.reduce((sum, est) => sum + (est?.total_amount || 0), 0) || 0,
        estimateCount: {
          total: estimates?.length || 0,
          pending: estimates?.filter(est => est?.status === 'pending')?.length || 0,
          approved: estimates?.filter(est => est?.status === 'approved')?.length || 0,
          rejected: estimates?.filter(est => est?.status === 'rejected')?.length || 0
        },
        timestamp: now?.toISOString()
      };

      this.metricsCache?.set('financial-metrics', metrics);
      return metrics;
    } catch (error) {
      console.error('Error calculating financial metrics:', error);
      return this.metricsCache?.get('financial-metrics') || this.getDefaultFinancialMetrics();
    }
  }

  /**
   * Get operational alerts summary
   */
  async getOperationalAlerts(limit = 10) {
    try {
      const { data, error } = await supabase?.from('notifications')?.select('*')?.in('priority', ['high', 'critical'])?.eq('is_read', false)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return {
        alerts: data || [],
        criticalCount: data?.filter(n => n?.priority === 'critical')?.length || 0,
        highCount: data?.filter(n => n?.priority === 'high')?.length || 0,
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      console.error('Error fetching operational alerts:', error);
      return {
        alerts: [],
        criticalCount: 0,
        highCount: 0,
        timestamp: new Date()?.toISOString()
      };
    }
  }

  /**
   * Get comprehensive analytics snapshot
   */
  async getAnalyticsSnapshot() {
    try {
      const [patientMetrics, roomOccupancy, financialMetrics, alerts] = await Promise.all([
        this.calculatePatientMetrics(),
        this.calculateRoomOccupancy(),
        this.calculateFinancialMetrics(),
        this.getOperationalAlerts()
      ]);

      return {
        patients: patientMetrics,
        rooms: roomOccupancy,
        financial: financialMetrics,
        alerts,
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      console.error('Error getting analytics snapshot:', error);
      throw error;
    }
  }

  /**
   * Subscribe to all analytics updates
   */
  subscribeToAllAnalytics(callback) {
    const unsubscribers = [];

    unsubscribers?.push(this.subscribeToPatientStatus((metrics) => {
      callback({ type: 'patient-metrics', data: metrics });
    }));

    unsubscribers?.push(this.subscribeToRoomOccupancy((occupancy) => {
      callback({ type: 'room-occupancy', data: occupancy });
    }));

    unsubscribers?.push(this.subscribeToFinancialMetrics((metrics) => {
      callback({ type: 'financial-metrics', data: metrics });
    }));

    unsubscribers?.push(this.subscribeToOperationalAlerts((alert) => {
      callback({ type: 'operational-alert', data: alert });
    }));

    return () => {
      unsubscribers?.forEach(unsub => unsub());
    };
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(key) {
    const channel = this.subscriptions?.get(key);
    if (channel) {
      supabase?.removeChannel(channel);
      this.subscriptions?.delete(key);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    this.subscriptions?.forEach((channel) => {
      supabase?.removeChannel(channel);
    });
    this.subscriptions?.clear();
    this.metricsCache?.clear();
  }

  // Default fallback data
  getDefaultPatientMetrics() {
    return {
      total: 0,
      active: 0,
      discharged: 0,
      newToday: 0,
      timestamp: new Date()?.toISOString()
    };
  }

  getDefaultRoomOccupancy() {
    return {
      totalRooms: 0,
      occupiedRooms: 0,
      availableRooms: 0,
      totalCapacity: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      occupancyRate: 0,
      roomOccupancyRate: 0,
      timestamp: new Date()?.toISOString(),
      roomDetails: []
    };
  }

  getDefaultFinancialMetrics() {
    return {
      totalRevenue: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      todayRevenue: 0,
      monthRevenue: 0,
      estimateCount: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      },
      timestamp: new Date()?.toISOString()
    };
  }
}

export const realtimeAnalytics = new RealtimeAnalyticsService();
export default realtimeAnalytics;