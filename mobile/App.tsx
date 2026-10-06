import React, {useEffect} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {RootNavigator} from './src/navigation/RootNavigator';
import {SplashScreen} from './src/screens/Auth/SplashScreen';
import {useAuthStore} from './src/store/authStore';
import {useThemeStore} from './src/store/themeStore';
import {darkTheme, lightTheme} from './src/theme/theme';

const renderIcon = (props: React.ComponentProps<typeof MaterialCommunityIcons>) => (
  <MaterialCommunityIcons {...props} />
);

function App() {
  const booting = useAuthStore(state => state.booting);
  const bootError = useAuthStore(state => state.bootError);
  const restore = useAuthStore(state => state.restore);
  const dark = useThemeStore(state => state.dark);
  const hydrateTheme = useThemeStore(state => state.hydrate);
  const theme = dark ? darkTheme : lightTheme;

  useEffect(() => {
    Promise.all([restore(), hydrateTheme()]).catch(error => {
      console.error('Application initialization failed:', error);
    });
  }, [hydrateTheme, restore]);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <PaperProvider
          theme={theme}
          settings={{icon: renderIcon}}>
          <StatusBar
            barStyle={dark ? 'light-content' : 'dark-content'}
          />
          {booting ? (
            <SplashScreen />
          ) : bootError ? (
            <SplashScreen
              error={bootError}
              onRetry={() => {
                restore().catch(error => console.error('Session restore failed:', error));
              }}
            />
          ) : (
            <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
              <RootNavigator />
            </SafeAreaView>
          )}
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
});

export default App;
