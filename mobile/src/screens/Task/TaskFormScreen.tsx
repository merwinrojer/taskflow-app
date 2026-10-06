import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View} from 'react-native';
import DateTimePicker, {type DateTimePickerEvent} from '@react-native-community/datetimepicker';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, HelperText, IconButton, SegmentedButtons, Text, TextInput, useTheme} from 'react-native-paper';
import {getApiError} from '../../api/client';
import {taskApi} from '../../api/taskApi';
import {useTaskStore} from '../../store/taskStore';
import type {Priority, RootStackParamList, TaskDraft} from '../../types';
import {formatDate} from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;
type FormValues = Omit<TaskDraft, 'deadline'>;
const priorities: Priority[] = ['Low', 'Medium', 'High'];

export function TaskFormScreen({navigation, route}: Props) {
  const theme = useTheme();
  const taskId = route.params?.taskId;
  const saveTask = useTaskStore(state => state.save);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingTask, setLoadingTask] = useState(Boolean(taskId));
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<FormValues>({
    defaultValues: {title: '', description: '', priority: 'Medium', category: 'Personal'},
  });

  useEffect(() => {
    if (!taskId) return;
    let active = true;
    taskApi.get(taskId)
      .then(task => {
        if (!active) return;
        reset({
          title: task.title,
          description: task.description,
          priority: task.priority,
          category: task.category,
        });
        setDeadline(task.deadline ? new Date(task.deadline) : null);
      })
      .catch(error => {
        if (active) setServerError(getApiError(error));
      })
      .finally(() => {
        if (active) setLoadingTask(false);
      });
    return () => {
      active = false;
    };
  }, [reset, taskId]);

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && selected) {
      selected.setHours(23, 59, 0, 0);
      setDeadline(selected);
    }
  };

  const submit = handleSubmit(async values => {
    setSaving(true);
    setServerError('');
    try {
      const draft: TaskDraft = {...values, deadline: deadline?.toISOString() ?? null};
      const saved = await saveTask(draft, taskId);
      navigation.replace('TaskDetails', {taskId: saved.id});
    } catch (error) {
      setServerError(getApiError(error));
    } finally {
      setSaving(false);
    }
  });

  if (loadingTask) {
    return (
      <View style={[styles.center, {backgroundColor: theme.colors.background}]}>
        <Text>Loading task…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headingRow}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <Text variant="headlineSmall" style={styles.heading}>
            {taskId ? 'Edit task' : 'Create task'}
          </Text>
        </View>
        <Controller
          control={control}
          name="title"
          rules={{required: 'Give your task a title', maxLength: {value: 120, message: 'Use 120 characters or fewer'}}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              label="Task title"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={Boolean(errors.title)}
              maxLength={120}
              autoFocus={!taskId}
            />
          )}
        />
        {errors.title ? <HelperText type="error">{errors.title.message}</HelperText> : null}
        <Controller
          control={control}
          name="description"
          rules={{maxLength: {value: 2000, message: 'Use 2000 characters or fewer'}}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              label="Description (optional)"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              style={styles.description}
              error={Boolean(errors.description)}
            />
          )}
        />
        {errors.description ? <HelperText type="error">{errors.description.message}</HelperText> : null}
        <Text variant="titleMedium" style={styles.label}>Priority</Text>
        <Controller
          control={control}
          name="priority"
          render={({field: {onChange, value}}) => (
            <SegmentedButtons
              value={value}
              onValueChange={next => onChange(next as Priority)}
              buttons={priorities.map(item => ({value: item, label: item}))}
            />
          )}
        />
        <Text variant="titleMedium" style={styles.label}>Category</Text>
        <Controller
          control={control}
          name="category"
          rules={{maxLength: {value: 40, message: 'Use 40 characters or fewer'}}}
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              label="e.g. Work, Personal, Health"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={40}
              error={Boolean(errors.category)}
            />
          )}
        />
        {errors.category ? <HelperText type="error">{errors.category.message}</HelperText> : null}
        <Text variant="titleMedium" style={styles.label}>Deadline</Text>
        <View style={styles.deadlineRow}>
          <Button mode="outlined" icon="calendar" onPress={() => setShowPicker(true)}>
            {deadline ? formatDate(deadline.toISOString()) : 'Choose a date'}
          </Button>
          {deadline ? <IconButton icon="close-circle-outline" onPress={() => setDeadline(null)} accessibilityLabel="Clear deadline" /> : null}
        </View>
        {showPicker ? (
          <DateTimePicker
            value={deadline ?? new Date()}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
          />
        ) : null}
        {serverError ? <HelperText type="error">{serverError}</HelperText> : null}
        <Button
          mode="contained"
          onPress={() => {
            submit().catch(error => setServerError(getApiError(error)));
          }}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
          contentStyle={styles.saveContent}>
          {taskId ? 'Save changes' : 'Create task'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  content: {padding: 20, paddingBottom: 40, gap: 12},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  headingRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: -8},
  heading: {fontWeight: '700'},
  description: {minHeight: 110},
  label: {fontWeight: '700', marginTop: 8},
  deadlineRow: {flexDirection: 'row', alignItems: 'center'},
  saveButton: {marginTop: 16, borderRadius: 12},
  saveContent: {height: 50},
});
