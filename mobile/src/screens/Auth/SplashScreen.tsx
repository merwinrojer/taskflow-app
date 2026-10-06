import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Text, useTheme} from 'react-native-paper';

interface SplashScreenProps {
  error?: string | null;
  onRetry?: () => void;
}

export function SplashScreen({error, onRetry}: SplashScreenProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.mark, {backgroundColor: theme.colors.primary}]}>
        <Text variant="headlineLarge" style={styles.check}>✓</Text>
      </View>
      <Text variant="headlineMedium" style={styles.title}>TaskFlow</Text>
      <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>
        Plan with purpose.
      </Text>
      {error ? (
        <>
          <Text style={[styles.error, {color: theme.colors.error}]}>{error}</Text>
          {onRetry ? <Button onPress={onRetry}>Try again</Button> : null}
        </>
      ) : (
        <ActivityIndicator style={styles.loader} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28},
  mark: {width: 78, height: 78, borderRadius: 26, alignItems: 'center', justifyContent: 'center'},
  check: {color: '#FFFFFF', fontWeight: '800'},
  title: {fontWeight: '800', marginTop: 18, marginBottom: 4},
  loader: {marginTop: 34},
  error: {textAlign: 'center', marginTop: 28, marginBottom: 8},
});
