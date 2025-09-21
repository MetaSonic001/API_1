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
import { useTripCraftAPI } from '../../hooks/useTripCraftAPI';

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

  const api = useTripCraftAPI();

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
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userTrips',
                'userPreferences',
                'userStats',
                'offlinePackages',
                'audioTours',
                'arAssets'
              ]);
              
              Alert.alert('Success', 'Cache cleared successfully!');
              setStorageUsage({
                totalSize: 32,
                offlinePackages: 0,
                audioTours: 0,
                arAssets: 32,
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
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
    icon: string,
    color: string = '#059669'
  ) => (
    <View style={styles.preferenceItem}>
      <View style={[styles.preferenceIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={preferences[key] as boolean}
        onValueChange={(value) => savePreference(key, value)}
        trackColor={{ false: '#E2E8F0', true: `${color}30` }}
        thumbColor={preferences[key] ? color : '#CBD5E1'}
        ios_backgroundColor="#E2E8F0"
      />
    </View>
  );

  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.statIconGradient}
      >
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
      </LinearGradient>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderSettingItem = (
    title: string,
    value: string,
    icon: string,
    onPress: () => void,
    color: string = '#64748B'
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );

  const renderActionItem = (
    title: string,
    icon: string,
    onPress: () => void,
    color: string = '#64748B'
  ) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.actionText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Profile Header */}
        <LinearGradient
          colors={['#0F766E', '#059669', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.avatarEditButton}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Alex Johnson</Text>
              <Text style={styles.profileEmail}>alex.johnson@gmail.com</Text>
              <View style={styles.profileBadge}>
                <LinearGradient
                  colors={['#F59E0B', '#F97316']}
                  style={styles.badgeGradient}
                >
                  <Ionicons name="diamond" size={12} color="#FFFFFF" />
                  <Text style={styles.profileBadgeText}>Premium Explorer</Text>
                </LinearGradient>
              </View>
            </View>
            
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Enhanced Travel Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Travel Journey</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            {renderStatCard('Adventures', stats.totalTrips, 'airplane', '#059669')}
            {renderStatCard('Countries', stats.totalDestinations, 'earth', '#7C3AED')}
            {renderStatCard('Distance', `${(stats.totalDistance / 1000).toFixed(0)}K km`, 'speedometer', '#F59E0B')}
            {renderStatCard('Avg Days', `${stats.averageTripDuration}`, 'time', '#06B6D4')}
          </View>
          
          <View style={styles.achievementCard}>
            <LinearGradient
              colors={['#F8FAFC', '#FFFFFF']}
              style={styles.achievementGradient}
            >
              <View style={styles.achievementHeader}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="trophy" size={20} color="#F59E0B" />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>Travel Achievements</Text>
                  <Text style={styles.achievementSubtitle}>
                    Favorite: {stats.favoriteDestinationType} • Saved: ${stats.totalBudgetSaved}
                  </Text>
                </View>
              </View>
              
              <View style={styles.achievementBadges}>
                <View style={[styles.miniBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#059669' }]}>Culture Lover</Text>
                </View>
                <View style={[styles.miniBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.miniBadgeText, { color: '#F59E0B' }]}>Budget Master</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Enhanced Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Preferences</Text>
          <View style={styles.preferencesCard}>
            {renderPreferenceSwitch(
              'Smart Notifications',
              'Intelligent trip updates and personalized reminders',
              'notifications',
              'notifications-outline',
              '#059669'
            )}
            {renderPreferenceSwitch(
              'Live Updates',
              'Real-time weather, transport, and venue information',
              'realTimeUpdates',
              'refresh-outline',
              '#06B6D4'
            )}
            {renderPreferenceSwitch(
              'Auto Offline',
              'Download offline packages automatically before trips',
              'offlineMode',
              'cloud-download-outline',
              '#7C3AED'
            )}
            {renderPreferenceSwitch(
              'Audio Tours',
              'AI-narrated experiences at destinations',
              'audioTours',
              'volume-high-outline',
              '#F59E0B'
            )}
            {renderPreferenceSwitch(
              'AR Experience',
              'Augmented reality features and interactive guides',
              'arExperience',
              'scan-outline',
              '#EC4899'
            )}
            {renderPreferenceSwitch(
              'Fact Verification',
              'Verify recommendations with trusted sources',
              'factVerification',
              'shield-checkmark-outline',
              '#10B981'
            )}
          </View>
        </View>

        {/* Enhanced Storage Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithAction}>
            <Text style={styles.sectionTitle}>Storage Manager</Text>
            <TouchableOpacity onPress={clearCache} style={styles.clearCacheButton}>
              <Ionicons name="trash-outline" size={16} color="#DC2626" />
              <Text style={styles.clearCacheText}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.storageCard}>
            <View style={styles.storageHeader}>
              <View style={styles.storageMainInfo}>
                <Text style={styles.storageSize}>{storageUsage.totalSize}MB</Text>
                <Text style={styles.storageLabel}>Total Used</Text>
              </View>
              
              <View style={styles.storageCircle}>
                <View style={styles.storageCircleInner}>
                  <Text style={styles.storagePercentage}>72%</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.storageBreakdown}>
              <View style={styles.storageItem}>
                <View style={styles.storageItemHeader}>
                  <View style={[styles.storageColorDot, { backgroundColor: '#059669' }]} />
                  <Text style={styles.storageItemTitle}>Offline Packages</Text>
                  <Text style={styles.storageItemSize}>{storageUsage.offlinePackages}MB</Text>
                </View>
                <View style={styles.storageBar}>
                  <View
                    style={[
                      styles.storageBarFill,
                      {
                        width: `${(storageUsage.offlinePackages / storageUsage.totalSize) * 100}%`,
                        backgroundColor: '#059669'
                      }
                    ]}
                  />
                </View>
              </View>
              
              <View style={styles.storageItem}>
                <View style={styles.storageItemHeader}>
                  <View style={[styles.storageColorDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.storageItemTitle}>Audio Tours</Text>
                  <Text style={styles.storageItemSize}>{storageUsage.audioTours}MB</Text>
                </View>
                <View style={styles.storageBar}>
                  <View
                    style={[
                      styles.storageBarFill,
                      {
                        width: `${(storageUsage.audioTours / storageUsage.totalSize) * 100}%`,
                        backgroundColor: '#F59E0B'
                      }
                    ]}
                  />
                </View>
              </View>
              
              <View style={styles.storageItem}>
                <View style={styles.storageItemHeader}>
                  <View style={[styles.storageColorDot, { backgroundColor: '#7C3AED' }]} />
                  <Text style={styles.storageItemTitle}>AR Assets</Text>
                  <Text style={styles.storageItemSize}>{storageUsage.arAssets}MB</Text>
                </View>
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
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalization</Text>
          <View style={styles.settingsCard}>
            {renderSettingItem(
              'Language & Region',
              `${preferences.language} (${preferences.currency})`,
              'globe-outline',
              () => {},
              '#059669'
            )}
            {renderSettingItem(
              'App Theme',
              preferences.theme.charAt(0).toUpperCase() + preferences.theme.slice(1),
              'color-palette-outline',
              () => {},
              '#7C3AED'
            )}
            {renderSettingItem(
              'Measurement Units',
              'Metric (km, °C)',
              'calculator-outline',
              () => {},
              '#F59E0B'
            )}
          </View>
        </View>

        {/* Enhanced Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.actionsCard}>
            {renderActionItem(
              'Export Travel Data',
              'download-outline',
              exportData,
              '#059669'
            )}
            {renderActionItem(
              'Privacy Settings',
              'shield-outline',
              () => {},
              '#7C3AED'
            )}
            {renderActionItem(
              'Data Usage Policy',
              'document-text-outline',
              () => {},
              '#F59E0B'
            )}
            {renderActionItem(
              'Account Security',
              'lock-closed-outline',
              () => {},
              '#DC2626'
            )}
          </View>
        </View>

        {/* Enhanced Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <View style={styles.actionsCard}>
            {renderActionItem(
              'Help Center',
              'help-circle-outline',
              () => {},
              '#64748B'
            )}
            {renderActionItem(
              'Contact Support',
              'chatbubble-outline',
              () => {},
              '#64748B'
            )}
            {renderActionItem(
              'Send Feedback',
              'thumbs-up-outline',
              () => {},
              '#64748B'
            )}
            {renderActionItem(
              'Rate TripCraft AI',
              'star-outline',
              () => {},
              '#F59E0B'
            )}
          </View>
        </View>

        {/* Enhanced Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerTitle}>TripCraft AI</Text>
            <Text style={styles.footerVersion}>Version 1.0.0</Text>
          </View>
          <Text style={styles.footerTagline}>Crafting extraordinary journeys with AI ✨</Text>
          
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-twitter" size={18} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-instagram" size={18} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="mail-outline" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
    fontWeight: '500',
  },
  profileBadge: {
    alignSelf: 'flex-start',
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  profileBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  viewAllText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: '23%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statTitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementCard: {
    marginTop: 4,
  },
  achievementGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  achievementSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  achievementBadges: {
    flexDirection: 'row',
  },
  miniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  preferencesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    color: '#1E293B',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '500',
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  clearCacheText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 4,
  },
  storageCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  storageMainInfo: {
    flex: 1,
  },
  storageSize: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -1,
    marginBottom: 4,
  },
  storageLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  storageCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storageCircleInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storagePercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storageBreakdown: {
    marginTop: 8,
  },
  storageItem: {
    marginBottom: 20,
  },
  storageItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storageColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  storageItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  storageItemSize: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  storageBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginLeft: 18,
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerContent: {
    alignItems: 'center',
    marginBottom: 12,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerTagline: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '500',
  },
  socialLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
})