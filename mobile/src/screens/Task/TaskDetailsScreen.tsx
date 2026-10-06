import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, IconButton, Surface, Text, useTheme} from 'react-native-paper';
import {getApiError} from '../../api/client';
import {taskApi} from '../../api/taskApi';
import {useTaskStore} from '../../store/taskStore';
import type {RootStackParamList, Task} from '../../types';
import {formatDate, formatDateTime, priorityColor} from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetails'>;

export function TaskDetailsScreen({navigation, route}: Props) {
  const theme = useTheme();
  const taskId = route.params.taskId;
  const storedTask = useTaskStore(state => state.tasks.find(task => task.id === taskId));
  const toggleComplete = useTaskStore(state => state.toggleComplete);
  const remove = useTaskStore(state => state.remove);
  const [task, setTask] = useState<Task | undefined>(storedTask);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!storedTask);

  useEffect(() => {
    let active = true;
    taskApi.get(taskId)
      .then(value => {
        if (active) setTask(value);
      })
      .catch(reason => {
        if (active) setError(getApiError(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [taskId]);

  const handleToggle = async () => {
    try {
      await toggleComplete(taskId);
      const updated = await taskApi.get(taskId);
      setTask(updated);
    } catch (reason) {
      setError(getApiError(reason));
    }
  };

  const handleDelete = async () => {
    try {
      await remove(taskId);
      navigation.goBack();
    } catch (reason) {
      setError(getApiError(reason));
    }
  };

  if (loading) {
    return <View style={[styles.center, {backgroundColor: theme.colors.background}]}><Text>Loading task…</Text></View>;
  }
  if (!task) {
    return (
      <View style={[styles.center, {backgroundColor: theme.colors.background}]}>
        <Text variant="titleLarge">Task unavailable</Text>
        <Text style={styles.error}>{error || 'This task could not be found.'}</Text>
        <Button onPress={() => navigation.goBack()}>Go back</Button>
      </View>
    );
  }

  return (
    <ScrollView style={{backgroundColor: theme.colors.background}} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text variant="titleLarge" style={styles.headerTitle}>Task details</Text>
        <IconButton icon="pencil-outline" onPress={() => navigation.navigate('TaskForm', {taskId})} accessibilityLabel="Edit task" />
      </View>
      <Surface style={styles.card} elevation={1}>
        <View style={[styles.priorityRail, {backgroundColor: priorityColor[task.priority]}]} />
        <View style={styles.cardContent}>
          <Text variant="labelLarge" style={{color: priorityColor[task.priority]}}>{task.priority.toUpperCase()} PRIORITY</Text>
          <Text variant="headlineSmall" style={styles.taskTitle}>{task.title}</Text>
          <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>{task.description || 'No description added.'}</Text>
          <View style={[styles.divider, {backgroundColor: theme.colors.outlineVariant}]} />
          <DetailRow label="Category" value={task.category} />
          <DetailRow label="Deadline" value={formatDate(task.deadline)} />
          <DetailRow label="Created" value={formatDateTime(task.createdAt)} />
          <DetailRow label="Status" value={task.completed ? 'Completed' : 'Pending'} />
        </View>
      </Surface>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode={task.completed ? 'outlined' : 'contained'} icon={task.completed ? 'restore' : 'check'} onPress={handleToggle} style={styles.action}>
        {task.completed ? 'Mark as pending' : 'Mark complete'}
      </Button>
      <Button mode="text" textColor={theme.colors.error} icon="delete-outline" onPress={handleDelete}>
        Delete task
      </Button>
    </ScrollView>
  );
}

function DetailRow({label, value}: {label: string; value: string}) {
  const theme = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>{label}</Text>
      <Text variant="bodyMedium" style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {padding: 20, paddingBottom: 40},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 18, marginHorizontal: -8},
  headerTitle: {flex: 1, textAlign: 'center', fontWeight: '700'},
  card: {borderRadius: 18, flexDirection: 'row', overflow: 'hidden'},
  priorityRail: {width: 5},
  cardContent: {padding: 20, flex: 1, gap: 10},
  taskTitle: {fontWeight: '700', marginTop: 4, marginBottom: 4},
  divider: {height: 1, marginVertical: 10},
  detailRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 10},
  detailValue: {fontWeight: '600', textAlign: 'right', flexShrink: 1},
  action: {marginTop: 22, marginBottom: 8},
  error: {color: '#C83B4D', textAlign: 'center', marginVertical: 12},
});
