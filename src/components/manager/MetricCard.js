import React from 'react';
import { Text, View } from 'react-native';
import styles from './managerStyles';

export default function MetricCard({ label, value, hint, danger }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, danger && styles.metricDanger]}>{value}</Text>
      <Text style={styles.metricHint}>{hint}</Text>
    </View>
  );
}
