import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Button, HelperText, Text, TextInput, useTheme} from 'react-native-paper';
import {getApiError} from '../../api/client';
import {useAuthStore} from '../../store/authStore';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login' | 'Register'>;
type FormValues = {email: string; password: string};

export function AuthScreen({navigation, route}: Props) {
  const isRegister = route.name === 'Register';
  const theme = useTheme();
  const authenticate = useAuthStore(state => state.authenticate);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>({defaultValues: {email: '', password: ''}});

  const submit = handleSubmit(async values => {
    setSubmitting(true);
    setServerError('');
    try {
      await authenticate(isRegister ? 'register' : 'login', values.email.trim(), values.password);
    } catch (error) {
      setServerError(getApiError(error));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <KeyboardAvoidingView
      style={[styles.flex, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brandMark}>
          <Text variant="headlineMedium" style={styles.brandCheck}>✓</Text>
        </View>
        <Text variant="headlineMedium" style={styles.heading}>
          {isRegister ? 'Create your account' : 'Welcome back'}
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, {color: theme.colors.onSurfaceVariant}]}>
          {isRegister ? 'A clearer day starts with a plan.' : 'Let’s make today count.'}
        </Text>
        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address'},
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                label="Email"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={Boolean(errors.email)}
              />
            )}
          />
          {errors.email ? <HelperText type="error">{errors.email.message}</HelperText> : null}
          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: {value: 8, message: 'Use at least 8 characters'},
              maxLength: {value: 72, message: 'Password is too long'},
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                label="Password"
                autoComplete={isRegister ? 'new-password' : 'password'}
                secureTextEntry
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={Boolean(errors.password)}
              />
            )}
          />
          {errors.password ? <HelperText type="error">{errors.password.message}</HelperText> : null}
          {serverError ? <HelperText type="error">{serverError}</HelperText> : null}
          <Button
            mode="contained"
            onPress={() => {
              submit().catch(error => setServerError(getApiError(error)));
            }}
            loading={submitting}
            disabled={submitting}
            contentStyle={styles.submitContent}
            style={styles.submit}>
            {isRegister ? 'Create account' : 'Sign in'}
          </Button>
        </View>
        <Button
          mode="text"
          onPress={() => navigation.replace(isRegister ? 'Login' : 'Register')}>
          {isRegister ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  scroll: {flexGrow: 1, justifyContent: 'center', padding: 28},
  brandMark: {height: 60, width: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5B5FEF', marginBottom: 28},
  brandCheck: {color: '#FFFFFF', fontWeight: '800'},
  heading: {fontWeight: '700'},
  subtitle: {marginTop: 8, marginBottom: 30},
  form: {gap: 10},
  submit: {marginTop: 8, borderRadius: 12},
  submitContent: {height: 50},
});
