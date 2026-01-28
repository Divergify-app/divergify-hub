import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import CalendarScreen from './screens/calendarscreen';
import MapsScreen from './screens/mapsscreen';
import ShoppingScreen from './screens/shoppingscreen';
import BlockerScreen from './screens/blockerscreen';
import HubScreen from './screens/hubscreen';
import NudgesScreen from './screens/nudgesscreen';
import SidekicksScreen from './screens/sidekicksscreen';
import StickysScreen from './screens/stickysscreen';
import OnboardingScreen from './screens/onboardingscreen';
import QuickCaptureFab from './components/quickcapturefab';
import QuickCaptureModal from './components/quickcapturemodal';
import { StickysProvider } from './src/stickys/StickysProvider';
import { colors } from './constants/colors';
import usePersistentState from './hooks/usepersistentstate';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

const tabIcons = {
  Calendar: 'calendar',
  Maps: 'map',
  Shopping: 'cart',
  Blocker: 'stopwatch',
  Nudges: 'sparkles',
  Hub: 'home',
  Sidekicks: 'chatbubbles',
  Stickys: 'document-text',
};

export default function App() {
  const [captureOpen, setCaptureOpen] = useState(false);
  const [onboardingComplete, setOnboardingComplete, onboardingHydrated] =
    usePersistentState('onboardingComplete', false);

  if (!onboardingHydrated) {
    return null;
  }
  return (
    <StickysProvider>
      {onboardingComplete ? (
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                paddingBottom: 6,
                paddingTop: 6,
              },
              tabBarActiveTintColor: colors.accent,
              tabBarInactiveTintColor: colors.muted,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={tabIcons[route.name]} size={size} color={color} />
              ),
            })}
          >
            <Tab.Screen name="Hub" component={HubScreen} options={{ title: 'The Hub' }} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Stickys" component={StickysScreen} />
            <Tab.Screen name="Maps" component={MapsScreen} />
            <Tab.Screen name="Shopping" component={ShoppingScreen} />
            <Tab.Screen
              name="Blocker"
              component={BlockerScreen}
              options={{ title: 'Beat your baseline' }}
            />
            <Tab.Screen name="Nudges" component={NudgesScreen} />
            <Tab.Screen name="Sidekicks" component={SidekicksScreen} />
          </Tab.Navigator>
          <QuickCaptureFab onPress={() => setCaptureOpen(true)} />
          <QuickCaptureModal
            visible={captureOpen}
            onClose={() => setCaptureOpen(false)}
          />
        </NavigationContainer>
      ) : (
        <OnboardingScreen
          onFinish={() => setOnboardingComplete(true)}
          onSkip={() => setOnboardingComplete(true)}
        />
      )}
    </StickysProvider>
  );
}
