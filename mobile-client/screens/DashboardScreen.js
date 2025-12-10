import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { authService } from '../services/auth';
import { clientService } from '../services/clientService';

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionDuration, setSessionDuration] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      const [dashboardResult, sessionResult, historyResult] = await Promise.all([
        clientService.getDashboard(),
        clientService.getActiveSession(),
        clientService.getSessionHistory(10),
      ]);

      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
      }

      if (sessionResult.success) {
        setActiveSession(sessionResult.data);
        if (sessionResult.data) {
          updateSessionDuration(sessionResult.data.startTime);
        }
      }

      if (historyResult.success) {
        setSessionHistory(historyResult.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const updateSessionDuration = (startTime) => {
    if (!startTime) return;
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    setSessionDuration(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
  };

  useEffect(() => {
    loadDashboard();
    
    // Update session duration every minute
    const interval = setInterval(() => {
      if (activeSession) {
        updateSessionDuration(activeSession.startTime);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [loadDashboard, activeSession]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dashboardData?.stats?.todayApplications || 0}
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dashboardData?.stats?.weekApplications || 0}
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dashboardData?.stats?.monthApplications || 0}
            </Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dashboardData?.stats?.totalApplications || 0}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Active Session */}
        {activeSession ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Session</Text>
            <View style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.activeIndicator} />
                <Text style={styles.sessionStatus}>Live</Text>
              </View>
              <Text style={styles.sessionText}>
                Started: {formatDate(activeSession.startTime)} at {formatTime(activeSession.startTime)}
              </Text>
              <Text style={styles.sessionText}>Duration: {sessionDuration}</Text>
              <Text style={styles.sessionText}>
                Jobs Applied: {activeSession.jobsApplied || 0}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Session</Text>
            <View style={styles.sessionCard}>
              <Text style={styles.noSessionText}>No active session</Text>
            </View>
          </View>
        )}

        {/* Session History */}
        {sessionHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previous Sessions</Text>
            {sessionHistory.map((session) => (
              <View key={session.id} style={styles.historyCard}>
                <Text style={styles.historyDate}>
                  {formatDate(session.endTime)} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
                </Text>
                <Text style={styles.historyDetails}>
                  Duration: {session.duration?.formatted || 'N/A'} • Jobs: {session.jobsApplied || 0}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Jobs */}
        {dashboardData?.recentJobs && dashboardData.recentJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            {dashboardData.recentJobs.slice(0, 5).map((job) => (
              <View key={job.id} style={styles.jobCard}>
                <Text style={styles.jobCompany}>{job.companyName || 'Unknown Company'}</Text>
                <Text style={styles.jobTitle}>{job.jobTitle || 'N/A'}</Text>
                <Text style={styles.jobStatus}>Status: {job.status || 'N/A'}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  sessionStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  sessionText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  noSessionText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    padding: 20,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  historyDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobCompany: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  jobStatus: {
    fontSize: 12,
    color: '#3b82f6',
  },
});
