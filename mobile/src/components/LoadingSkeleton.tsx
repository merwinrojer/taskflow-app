import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from 'react-native-paper';

export function LoadingSkeleton() {
  const theme = useTheme();
  return (
    <View accessibilityLabel="Loading tasks" style={styles.container}>
      {[0, 1, 2].map(item => (
        <View
          key={item}
          style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <View style={[styles.line, styles.title, {backgroundColor: theme.colors.background}]} />
          <View style={[styles.line, {backgroundColor: theme.colors.background}]} />
          <View style={[styles.shortLine, {backgroundColor: theme.colors.background}]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {gap: 12},
  card: {padding: 18, borderRadius: 18, gap: 12},
  line: {height: 12, borderRadius: 8, width: '72%'},
  title: {height: 17, width: '54%'},
  shortLine: {height: 12, borderRadius: 8, width: '38%'},
});
