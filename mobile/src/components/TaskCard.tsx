import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {IconButton, Text, useTheme} from 'react-native-paper';
import type {Task} from '../types';
import {formatDate, priorityColor} from '../utils/format';

interface TaskCardProps {
  task: Task;
  onOpen: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskCard({task, onOpen, onToggle, onDelete}: TaskCardProps) {
  const theme = useTheme();
  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={() => (
        <Pressable style={styles.deleteAction} onPress={onDelete} accessibilityRole="button">
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      )}>
      <Pressable
        onPress={onOpen}
        style={[styles.card, {backgroundColor: theme.colors.surface}]}
        accessibilityRole="button"
        accessibilityLabel={`${task.title}, ${task.completed ? 'completed' : 'pending'}`}>
        <View style={[styles.priorityRail, {backgroundColor: priorityColor[task.priority]}]} />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <IconButton
              icon={task.completed ? 'check-circle' : 'circle-outline'}
              iconColor={task.completed ? theme.colors.primary : theme.colors.outline}
              size={23}
              onPress={event => {
                event.stopPropagation();
                onToggle();
              }}
              accessibilityLabel={task.completed ? 'Mark pending' : 'Mark complete'}
            />
            <View style={styles.titleWrap}>
              <Text
                variant="titleMedium"
                numberOfLines={1}
                style={task.completed ? styles.completedTitle : undefined}>
                {task.title}
              </Text>
            </View>
            <Text style={[styles.priority, {color: priorityColor[task.priority]}]}>
              {task.priority}
            </Text>
          </View>
          {task.description ? (
            <Text
              variant="bodyMedium"
              numberOfLines={2}
              style={[styles.description, {color: theme.colors.onSurfaceVariant}]}>
              {task.description}
            </Text>
          ) : null}
          <View style={styles.meta}>
            <Text variant="labelMedium" style={{color: theme.colors.onSurfaceVariant}}>
              {task.category}
            </Text>
            <Text variant="labelMedium" style={{color: theme.colors.onSurfaceVariant}}>
              {task.deadline ? `Due ${formatDate(task.deadline)}` : 'No deadline'}
            </Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {borderRadius: 17, flexDirection: 'row', overflow: 'hidden', marginBottom: 12},
  priorityRail: {width: 4},
  content: {flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 7},
  topRow: {flexDirection: 'row', alignItems: 'center', gap: 2},
  titleWrap: {flex: 1},
  description: {marginLeft: 48},
  priority: {fontSize: 12, fontWeight: '700'},
  completedTitle: {textDecorationLine: 'line-through', opacity: 0.6},
  meta: {marginLeft: 48, flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  deleteAction: {backgroundColor: '#C83B4D', width: 84, alignItems: 'center', justifyContent: 'center', borderRadius: 16, marginBottom: 12, marginLeft: 8},
  deleteText: {color: '#FFFFFF', fontWeight: '700'},
});
