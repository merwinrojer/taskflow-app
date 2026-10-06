import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {
  Button,
  FAB,
  IconButton,
  Menu,
  ProgressBar,
  Searchbar,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EmptyState} from '../../components/EmptyState';
import {LoadingSkeleton} from '../../components/LoadingSkeleton';
import {TaskCard} from '../../components/TaskCard';
import {useTaskStore} from '../../store/taskStore';
import {useAuthStore} from '../../store/authStore';
import {useDebouncedValue} from '../../hooks/useDebouncedValue';
import type {RootStackParamList, TaskSort} from '../../types';
import {getApiError} from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
const sortLabels: Record<TaskSort, string> = {
  smart: 'Smart priority',
  priority: 'Priority',
  deadline: 'Deadline',
  createdAt: 'Created date',
};

export function HomeScreen({navigation}: Props) {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const user = useAuthStore(state => state.user);
  const {
    tasks,
    stats: dashboardStats,
    filteredTotal,
    loadingMore,
    status,
    sort,
    search,
    loading,
    refreshing,
    error,
    setStatus,
    setSort,
    setSearch,
    load,
    loadMore,
    toggleComplete,
    remove,
  } = useTaskStore();
  const debouncedSearch = useDebouncedValue(search, 250);
  const [sortMenu, setSortMenu] = useState(false);
  const [actionError, setActionError] = useState('');
  const stats = useMemo(
    () => ({
      ...dashboardStats,
      progress: dashboardStats.total
        ? Math.round((dashboardStats.completed / dashboardStats.total) * 100)
        : 0,
    }),
    [dashboardStats],
  );

  useEffect(() => {
    if (isFocused) {
      load().catch(() => undefined);
    }
  }, [isFocused, load, status, sort, debouncedSearch]);

  const refresh = useCallback(() => {
    load(true).catch(() => undefined);
  }, [load]);

  const execute = async (action: () => Promise<void>) => {
    try {
      setActionError('');
      await action();
    } catch (err) {
      setActionError(getApiError(err));
    }
  };

  return (
    <View style={[styles.screen, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />
        }>
        <View style={styles.header}>
          <View>
            <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>
              Good to see you
            </Text>
            <Text variant="headlineSmall" style={styles.title}>
              {user?.email.split('@')[0] ?? 'Your tasks'}
            </Text>
          </View>
          <IconButton icon="account-circle-outline" size={28} onPress={() => navigation.navigate('Profile')} accessibilityLabel="Profile" />
        </View>
        <View style={[styles.statsCard, {backgroundColor: theme.colors.primaryContainer}]}>
          <View style={styles.statsTop}>
            <View>
              <Text variant="titleMedium" style={styles.statsTitle}>Your progress</Text>
              <Text variant="bodyMedium">{stats.completed} of {stats.total} tasks completed</Text>
            </View>
            <Text variant="headlineSmall" style={styles.percent}>{stats.progress}%</Text>
          </View>
          <ProgressBar progress={stats.progress / 100} color={theme.colors.primary} style={styles.progress} />
          <View style={styles.statRow}>
            <Text variant="labelMedium">{stats.pending} pending</Text>
            <Text variant="labelMedium">{stats.completed} completed</Text>
          </View>
        </View>
        <Searchbar
          placeholder="Search tasks"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          inputStyle={styles.searchInput}
        />
        <View style={styles.filters}>
          <SegmentedButtons
            value={status}
            onValueChange={value => setStatus(value as typeof status)}
            buttons={[
              {value: 'all', label: 'All'},
              {value: 'pending', label: 'Pending'},
              {value: 'completed', label: 'Done'},
            ]}
          />
        </View>
        <View style={styles.listHeader}>
          <Text variant="titleLarge" style={styles.listTitle}>Tasks</Text>
          <Menu
            visible={sortMenu}
            onDismiss={() => setSortMenu(false)}
            anchor={
              <Button compact mode="text" icon="sort" onPress={() => setSortMenu(true)}>
                {sortLabels[sort]}
              </Button>
            }>
            {(Object.keys(sortLabels) as TaskSort[]).map(key => (
              <Menu.Item
                key={key}
                title={sortLabels[key]}
                leadingIcon={sort === key ? 'check' : undefined}
                onPress={() => {
                  setSort(key);
                  setSortMenu(false);
                }}
              />
            ))}
          </Menu>
        </View>
        {actionError ? (
          <View style={styles.inlineError}>
            <Text style={[styles.inlineErrorText, {color: theme.colors.error}]}>{actionError}</Text>
            <IconButton icon="close" size={18} onPress={() => setActionError('')} />
          </View>
        ) : null}
        {loading ? (
          <LoadingSkeleton />
        ) : error && tasks.length === 0 ? (
          <EmptyState title="Couldn’t load tasks" message={error} actionLabel="Try again" onAction={refresh} />
        ) : tasks.length === 0 ? (
          <EmptyState
            title={search ? 'No matches found' : status === 'completed' ? 'Nothing completed yet' : 'A fresh start'}
            message={search ? 'Try another search term.' : 'Add your first task and make room for what matters.'}
            actionLabel={!search && status !== 'completed' ? 'Create a task' : undefined}
            onAction={!search && status !== 'completed' ? () => navigation.navigate('TaskForm') : undefined}
          />
        ) : (
          <View style={styles.taskList}>
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={() => navigation.navigate('TaskDetails', {taskId: task.id})}
                onToggle={() => execute(() => toggleComplete(task.id))}
                onDelete={() => execute(() => remove(task.id))}
              />
            ))}
            {error ? <Text style={{color: theme.colors.error}}>{error}</Text> : null}
            {tasks.length < filteredTotal ? (
              <Button
                mode="outlined"
                loading={loadingMore}
                disabled={loadingMore}
                onPress={() => {
                  loadMore().catch(() => undefined);
                }}>
                Load more tasks
              </Button>
            ) : null}
          </View>
        )}
      </ScrollView>
      <FAB
        icon="plus"
        label="New task"
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('TaskForm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  content: {padding: 20, paddingBottom: 108},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18},
  title: {fontWeight: '700', textTransform: 'capitalize', marginTop: 3},
  statsCard: {padding: 18, borderRadius: 20, marginBottom: 18},
  statsTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  statsTitle: {fontWeight: '700', marginBottom: 3},
  percent: {fontWeight: '800'},
  progress: {height: 8, borderRadius: 5, marginTop: 18, marginBottom: 9},
  statRow: {flexDirection: 'row', justifyContent: 'space-between'},
  search: {borderRadius: 14, elevation: 0},
  searchInput: {minHeight: 0},
  filters: {marginTop: 16, marginBottom: 14},
  listHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  listTitle: {fontWeight: '700'},
  taskList: {gap: 0},
  fab: {position: 'absolute', right: 20, bottom: 20},
  inlineError: {flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingLeft: 12, marginBottom: 8},
  inlineErrorText: {flex: 1},
});
