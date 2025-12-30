import { supabase } from '../lib/supabase';

const NotificationService = {
  async getNotifications({ limit = 50 } = {}) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async markAllAsRead() {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteAllNotifications() {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUrgentNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'urgent')
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching urgent notifications:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async getSystemHealth() {
    try {
      // Simple health check by querying a table
      const { error } = await supabase.from('user_profiles').select('id').limit(1);
      return { success: !error, status: error ? 'degraded' : 'healthy' };
    } catch (error) {
      return { success: false, status: 'error' };
    }
  }
};

export default NotificationService;
