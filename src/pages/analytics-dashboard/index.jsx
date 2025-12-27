import React, { useState, useEffect } from 'react';
import { Activity, Users, BedDouble, DollarSign, AlertTriangle, TrendingUp, Clock, Zap } from 'lucide-react';
import Layout from '../../components/navigation/Layout';
import realtimeAnalytics from '../../services/realtimeAnalyticsService';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const handleRoleChange = (role) => {
    console.log('Role changed to:', role);
  };

  useEffect(() => {
    loadInitialData();
    const unsubscribe = subscribeToUpdates();
    return () => {
      unsubscribe();
      realtimeAnalytics?.unsubscribeAll();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await realtimeAnalytics?.getAnalyticsSnapshot();
      setAnalytics(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    return realtimeAnalytics?.subscribeToAllAnalytics((update) => {
      setLiveUpdates(prev => [update, ...prev]?.slice(0, 10));
      setLastUpdate(new Date());
      
      setAnalytics(prev => {
        if (!prev) return prev;
        
        const updated = { ...prev };
        if (update?.type === 'patient-metrics') {
          updated.patients = update?.data;
        } else if (update?.type === 'room-occupancy') {
          updated.rooms = update?.data;
        } else if (update?.type === 'financial-metrics') {
          updated.financial = update?.data;
        }
        return updated;
      });
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount || 0);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })?.format(date);
  };

  if (loading) {
    return (
      <Layout onRoleChange={handleRoleChange}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout onRoleChange={handleRoleChange}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadInitialData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onRoleChange={handleRoleChange}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Real-Time Analytics</h1>
            <p className="text-gray-600 mt-1">Live operational and financial insights</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-green-500 animate-pulse" />
            <span>Live</span>
            {lastUpdate && (
              <span className="text-gray-400">
                • Updated {formatTime(lastUpdate)}
              </span>
            )}
          </div>
        </div>

        {/* Patient Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Patient Status</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Total Patients</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">
                {analytics?.patients?.total || 0}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Active</div>
              <div className="text-3xl font-bold text-green-900 mt-2">
                {analytics?.patients?.active || 0}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 font-medium">Discharged</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {analytics?.patients?.discharged || 0}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">New Today</div>
              <div className="text-3xl font-bold text-purple-900 mt-2">
                {analytics?.patients?.newToday || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Room Occupancy */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <BedDouble className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Room Occupancy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="text-sm text-indigo-600 font-medium">Occupancy Rate</div>
              <div className="text-3xl font-bold text-indigo-900 mt-2">
                {analytics?.rooms?.occupancyRate || 0}%
              </div>
              <div className="text-xs text-indigo-600 mt-1">
                {analytics?.rooms?.occupiedBeds || 0} / {analytics?.rooms?.totalCapacity || 0} beds
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Occupied Rooms</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">
                {analytics?.rooms?.occupiedRooms || 0}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                of {analytics?.rooms?.totalRooms || 0} total
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Available Rooms</div>
              <div className="text-3xl font-bold text-green-900 mt-2">
                {analytics?.rooms?.availableRooms || 0}
              </div>
            </div>
            <div className="bg-teal-50 rounded-lg p-4">
              <div className="text-sm text-teal-600 font-medium">Available Beds</div>
              <div className="text-3xl font-bold text-teal-900 mt-2">
                {analytics?.rooms?.availableBeds || 0}
              </div>
            </div>
          </div>

          {/* Room Details Grid */}
          {analytics?.rooms?.roomDetails?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Room Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {analytics?.rooms?.roomDetails?.map(room => (
                  <div
                    key={room?.id}
                    className={`rounded-lg p-3 border-2 ${
                      room?.occupied >= room?.capacity
                        ? 'bg-red-50 border-red-200'
                        : room?.occupied > 0
                        ? 'bg-yellow-50 border-yellow-200' :'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      Room {room?.roomNumber}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {room?.occupied}/{room?.capacity} beds
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Financial Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-emerald-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Financial Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-sm text-emerald-600 font-medium">Total Revenue</div>
              <div className="text-2xl font-bold text-emerald-900 mt-2">
                {formatCurrency(analytics?.financial?.totalRevenue)}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">This Month</div>
              <div className="text-2xl font-bold text-blue-900 mt-2">
                {formatCurrency(analytics?.financial?.monthRevenue)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">Today</div>
              <div className="text-2xl font-bold text-purple-900 mt-2">
                {formatCurrency(analytics?.financial?.todayRevenue)}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
              <div className="text-2xl font-bold text-yellow-900 mt-2">
                {formatCurrency(analytics?.financial?.pendingAmount)}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Approved</div>
              <div className="text-2xl font-bold text-green-900 mt-2">
                {formatCurrency(analytics?.financial?.approvedAmount)}
              </div>
            </div>
          </div>

          {/* Estimates Breakdown */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.financial?.estimateCount?.total || 0}
              </div>
              <div className="text-sm text-gray-600">Total Estimates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analytics?.financial?.estimateCount?.pending || 0}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics?.financial?.estimateCount?.approved || 0}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analytics?.financial?.estimateCount?.rejected || 0}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </div>

        {/* Operational Alerts */}
        {analytics?.alerts && (analytics?.alerts?.criticalCount > 0 || analytics?.alerts?.highCount > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Operational Alerts</h2>
              <span className="ml-auto px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                {analytics?.alerts?.criticalCount + analytics?.alerts?.highCount} active
              </span>
            </div>
            <div className="space-y-3">
              {analytics?.alerts?.alerts?.map((alert, index) => (
                <div
                  key={alert?.id || index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert?.priority === 'critical' ?'bg-red-50 border-red-500' :'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-semibold ${
                            alert?.priority === 'critical' ? 'text-red-700' : 'text-yellow-700'
                          }`}
                        >
                          {alert?.priority?.toUpperCase()}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{alert?.type}</span>
                      </div>
                      <p className="text-gray-900 mt-1">{alert?.message}</p>
                    </div>
                    <Clock className="w-4 h-4 text-gray-400 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Updates Feed */}
        {liveUpdates?.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Live Updates</h2>
              <span className="ml-auto text-sm text-gray-600">
                Last {liveUpdates?.length} updates
              </span>
            </div>
            <div className="space-y-2">
              {liveUpdates?.map((update, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" />
                    <span className="text-sm font-medium text-gray-900">
                      {update?.type?.replace(/-/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Just now</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}