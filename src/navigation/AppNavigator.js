// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import AlertInboxScreen from '../screens/AlertInboxScreen';
import NavigateScreen from '../screens/NavigateScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { useApp, USER_ROLE } from '../context/AppContext';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function VictimTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icons = { Home: '🆘', History: '🕐', Profile: '👤' };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
        tabBarActiveTintColor: COLORS.danger,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function ResponderTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icons = { Alerts: '🔔', Navigate: '🧭', Profile: '👤' };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Alerts" component={AlertInboxScreen} />
      <Tab.Screen name="Navigate" component={NavigateScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { userRole, userId } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userId ? (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        ) : userRole === USER_ROLE.VICTIM ? (
          <Stack.Screen name="VictimMain" component={VictimTabs} />
        ) : (
          <Stack.Screen name="ResponderMain" component={ResponderTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 6,
    height: 64,
  },
});
