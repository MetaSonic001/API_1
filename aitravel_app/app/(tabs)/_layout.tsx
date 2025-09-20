import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ size, color }) => <Ionicons name="compass" size={size} color={color} /> }} />
      <Tabs.Screen name="plan" options={{ tabBarIcon: ({ size, color }) => <Ionicons name="map" size={size} color={color} /> }} />
      <Tabs.Screen name="ar" options={{ tabBarIcon: ({ size, color }) => <Ionicons name="camera" size={size} color={color} /> }} />
      <Tabs.Screen name="trips" options={{ tabBarIcon: ({ size, color }) => <Ionicons name="airplane" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ size, color }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 85,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
