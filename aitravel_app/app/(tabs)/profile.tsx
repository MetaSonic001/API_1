import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserPreferences {
  notifications: boolean;
  realTimeUpdates: boolean;
  offlineMode: boolean;
  audioTours: boolean;
  arExperience: boolean;
  factVerification: boolean;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

interface UserStats {
  totalTrips: number;
  totalDestinations: number;
  totalDistance: number;
  favoriteDestinationType: string;
  averageTripDuration: number;
  totalBudgetSaved: number;
}

export default function ProfileScreen() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: true,
    realTimeUpdates: true,
    offlineMode: false,
    audioTours: true,
    arExperience: true,
    factVerification: true,
    currency: 'USD',
    language: 'English',
    theme: 'auto',
  });

  const [stats, setStats] = useState<UserStats>({
    totalTrips: 12,
    totalDestinations: 8,
    totalDistance: 45620,
    favoriteDestinationType: 'Cultural Cities',
    averageTripDuration: 6.5,
    totalBudgetSaved: 2340,
  });

  const [storageUsage, setStorageUsage] = useState({
    totalSize: 256,
    offlinePackages: 180,
    audioTours: 45,
    arAssets: 31,
  });

  useEffect(() => {
    loadUserPreferences();
    loadUserStats();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem('userPreferences');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('userStats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const savePreference = async (key: keyof UserPreferences, value: any) => {
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      setPreferences(updatedPreferences);
      await AsyncStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data including offline packages and audio tours. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully!');
            setStorageUsage({
              totalSize: 32,
              offlinePackages: 0,
              audioTours: 0,
              arAssets: 32,
            });
          }
        }
      ]
    );
  };

  const exportData = async () => {
    Alert.alert(
      'Export Data',
      'Your trip data and preferences will be exported to a shareable format.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => Alert.alert('Success', 'Data exported successfully!') }
      ]
    );
  };

  const renderPreferenceSwitch = (
    title: string,
    description: string,
    key: keyof UserPreferences,
    icon: string
  ) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceIcon}>
        <Ionicons name={icon as any} size={24} color="#2563EB" />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={preferences[key] as boolean}
        onValueChange={(value) => savePreference(key, value)}
        trackColor={{ false: '#F3F4F6', true: '#DBEAFE' }}
        thumbColor={preferences[key] ? '#2563EB' : '#9CA3AF'}
      />
    </View>
  );

  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Travel Explorer</Text>
            <Text style={styles.profileEmail}>explorer@tripcraft.ai</Text>
            <View style={styles.profileBadge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.profileBadgeText}>Premium Member</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Travel Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Travel Statistics</Text>
        <View style={styles.statsGrid}>
          {renderStatCard('Total Trips', stats.totalTrips, 'airplane', '#2563EB')}
          {renderStatCard('Destinations', stats.totalDestinations, 'location', '#059669')}
          {renderStatCard('Distance (km)', stats.totalDistance.toLocaleString(), 'speedometer', '#7C3AED')}
          {renderStatCard('Avg Duration', `${stats.averageTripDuration}d`, 'time', '#F59E0B')}
        </View>
        
        <View style={styles.additionalStats}>
          <View style={styles.additionalStat}>
            <Text style={styles.additionalStatLabel}>Favorite Type</Text>
            <Text style={styles.additionalStatValue}>{stats.favoriteDestinationType}</Text>
          </View>
          <View style={styles.additionalStat}>
            <Text style={styles.additionalStatLabel}>Budget Saved</Text>
            <Text style={styles.additionalStatValue}>${stats.totalBudgetSaved}</Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {renderPreferenceSwitch(
          'Push Notifications',
          'Get notified about trip updates and reminders',
          'notifications',
          'notifications-outline'
        )}
        {renderPreferenceSwitch(
          'Real-time Updates',
          'Receive live weather, transport, and venue updates',
          'realTimeUpdates',
          'refresh-outline'
        )}
        {renderPreferenceSwitch(
          'Offline Mode',
          'Automatically download offline packages',
          'offlineMode',
          'cloud-download-outline'
        )}
        {renderPreferenceSwitch(
          'Audio Tours',
          'Include AI-generated audio tours in itineraries',
          'audioTours',
          'volume-high-outline'
        )}
        {renderPreferenceSwitch(
          'AR Experience',
          'Enable augmented reality features',
          'arExperience',
          'camera-outline'
        )}
        {renderPreferenceSwitch(
          'Fact Verification',
          'Verify all recommendations with citations',
          'factVerification',
          'shield-checkmark-outline'
        )}
      </View>

      {/* Storage Usage */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Storage Usage</Text>
          <TouchableOpacity onPress={clearCache}>
            <Text style={styles.clearCacheButton}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Ionicons name="server-outline" size={24} color="#6B7280" />
            <Text style={styles.storageTitle}>Total Usage: {storageUsage.totalSize}MB</Text>
          </View>
          
          <View style={styles.storageBreakdown}>
            <View style={styles.storageItem}>
              <View style={styles.storageBar}>
                <View
                  style={[
                    styles.storageBarFill,
                    {
                      width: `${(storageUsage.offlinePackages / storageUsage.totalSize) * 100}%`,
                      backgroundColor: '#2563EB'
                    }
                  ]}
                />
              </View>
              <Text style={styles.storageLabel}>Offline Packages ({storageUsage.offlinePackages}MB)</Text>
            </View>
            
            <View style={styles.storageItem}>
              <View style={styles.storageBar}>
                <View
                  style={[
                    styles.storageBarFill,
                    {
                      width: `${(storageUsage.audioTours / storageUsage.totalSize) * 100}%`,
                      backgroundColor: '#059669'
                    }
                  ]}
                />
              </View>
              <Text style={styles.storageLabel}>Audio Tours ({storageUsage.audioTours}MB)</Text>
            </View>
            
            <View style={styles.storageItem}>
              <View style={styles.storageBar}>
                <View
                  style={[
                    styles.storageBarFill,
                    {
                      width: `${(storageUsage.arAssets / storageUsage.totalSize) * 100}%`,
                      backgroundColor: '#7C3AED'
                    }
                  ]}
                />
              </View>
              <Text style={styles.storageLabel}>AR Assets ({storageUsage.arAssets}MB)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="language-outline" size={24} color="#6B7280" />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Language</Text>
            <Text style={styles.settingValue}>{preferences.language}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="card-outline" size={24} color="#6B7280" />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Default Currency</Text>
            <Text style={styles.settingValue}>{preferences.currency}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="contrast-outline" size={24} color="#6B7280" />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Theme</Text>
            <Text style={styles.settingValue}>{preferences.theme}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Data & Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <TouchableOpacity style={styles.actionItem} onPress={exportData}>
          <Ionicons name="download-outline" size={24} color="#2563EB" />
          <Text style={styles.actionText}>Export My Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="shield-outline" size={24} color="#059669" />
          <Text style={styles.actionText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="document-text-outline" size={24} color="#F59E0B" />
          <Text style={styles.actionText}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
          <Text style={styles.actionText}>Help Center</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="mail-outline" size={24} color="#6B7280" />
          <Text style={styles.actionText}>Contact Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="star-outline" size={24} color="#6B7280" />
          <Text style={styles.actionText}>Rate TripCraft AI</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>TripCraft AI v1.0.0</Text>
        <Text style={styles.footerSubtext}>Built with ❤️ for travelers</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  profileBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  clearCacheButton: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
  },
  additionalStat: {
    flex: 1,
    alignItems: 'center',
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 4,
  },
  additionalStatValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  storageCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  storageBreakdown: {
    marginTop: 16,
  },
  storageItem: {
    marginBottom: 16,
  },
  storageBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  storageLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});