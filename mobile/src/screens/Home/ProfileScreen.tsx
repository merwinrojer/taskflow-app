import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Divider, IconButton, Switch, Text, useTheme} from 'react-native-paper';
import {getApiError} from '../../api/client';
import {useAuthStore} from '../../store/authStore';
import {useThemeStore} from '../../store/themeStore';
import type {RootStackParamList} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({navigation}: Props) {
  const theme = useTheme();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const dark = useThemeStore(state => state.dark);
  const toggleTheme = useThemeStore(state => state.toggle);
  const [signingOut, setSigningOut] = useState(false);
  const [actionError, setActionError] = useState('');

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } catch (error) {
      setActionError(getApiError(error));
    } finally {
      setSigningOut(false);
    }
  };

  const handleThemeToggle = () => {
    setActionError('');
    toggleTheme().catch(error => setActionError(getApiError(error)));
  };

  return (
    <View style={[styles.screen, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text variant="titleLarge" style={styles.headerTitle}>Profile</Text>
        <View style={styles.spacer} />
      </View>
      <View style={[styles.avatar, {backgroundColor: theme.colors.primaryContainer}]}>
        <Text variant="headlineMedium" style={[styles.avatarText, {color: theme.colors.primary}]}>
          {user?.email.charAt(0).toUpperCase() ?? '?'}
        </Text>
      </View>
      <Text variant="titleLarge" style={styles.email}>{user?.email}</Text>
      <Text variant="bodyMedium" style={[styles.caption, {color: theme.colors.onSurfaceVariant}]}>TaskFlow account</Text>
      <Divider style={styles.divider} />
      <View style={styles.settingRow}>
        <View style={styles.settingText}>
          <Text variant="titleMedium">Dark mode</Text>
          <Text variant="bodySmall" style={{color: theme.colors.onSurfaceVariant}}>
            Use a darker color palette
          </Text>
        </View>
        <Switch value={dark} onValueChange={handleThemeToggle} />
      </View>
      {actionError ? <Text style={{color: theme.colors.error}}>{actionError}</Text> : null}
      <View style={styles.footer}>
        <Button mode="outlined" icon="logout" onPress={signOut} loading={signingOut} disabled={signingOut}>
          Sign out
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, padding: 20},
  header: {flexDirection: 'row', alignItems: 'center', marginHorizontal: -8, marginBottom: 32},
  headerTitle: {flex: 1, textAlign: 'center', fontWeight: '700'},
  spacer: {width: 48},
  avatar: {width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'center'},
  avatarText: {fontWeight: '700'},
  email: {textAlign: 'center', fontWeight: '700', marginTop: 16},
  caption: {textAlign: 'center', marginTop: 4},
  divider: {marginVertical: 24},
  settingRow: {minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  settingText: {gap: 3},
  footer: {marginTop: 'auto', paddingBottom: 10},
});
