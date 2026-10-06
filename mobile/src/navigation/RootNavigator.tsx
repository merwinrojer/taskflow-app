import React from 'react';
import {NavigationContainer, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '../store/authStore';
import {useThemeStore} from '../store/themeStore';
import type {RootStackParamList} from '../types';
import {AuthScreen} from '../screens/Auth/AuthScreen';
import {HomeScreen} from '../screens/Home/HomeScreen';
import {ProfileScreen} from '../screens/Home/ProfileScreen';
import {TaskDetailsScreen} from '../screens/Task/TaskDetailsScreen';
import {TaskFormScreen} from '../screens/Task/TaskFormScreen';
import {darkTheme, lightTheme} from '../theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const user = useAuthStore(state => state.user);
  const dark = useThemeStore(state => state.dark);
  const paperTheme = dark ? darkTheme : lightTheme;
  const navigationTheme = dark ? NavigationDarkTheme : NavigationLightTheme;

  return (
    <NavigationContainer theme={{...navigationTheme, colors: {...navigationTheme.colors, background: paperTheme.colors.background, primary: paperTheme.colors.primary, card: paperTheme.colors.surface, text: paperTheme.colors.onSurface, border: paperTheme.colors.outlineVariant, notification: paperTheme.colors.error}}}>
      <Stack.Navigator screenOptions={{headerShown: false, contentStyle: {backgroundColor: paperTheme.colors.background}, animation: 'fade_from_bottom'}}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="TaskForm" component={TaskFormScreen} />
            <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={AuthScreen} />
            <Stack.Screen name="Register" component={AuthScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
