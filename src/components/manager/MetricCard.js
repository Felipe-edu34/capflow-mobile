import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from './modernStyles';

const ICON_CONFIG = {
  Produtos: { name: 'box', bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
  Críticos: { name: 'alert-circle', bg: '#ECFDF5', color: '#10B981', border: '#A7F3D0' },
  Setores: { name: 'grid', bg: '#F3E8FF', color: '#9333EA', border: '#E9D5FF' },
  Volume: { name: 'layers', bg: '#CCFBF1', color: '#0D9488', border: '#99F6E4' },
};

export default function MetricCard({ label, value, hint, danger }) {
  const baseCfg = ICON_CONFIG[label] || { name: 'bar-chart-2', bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
  const cfg = danger
    ? { name: 'alert-triangle', bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' }
    : baseCfg;

  return (
    <View style={[
      styles.metricCard,
      danger && { borderColor: '#FCA5A5', backgroundColor: '#FFFBFB' }
    ]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: cfg.bg,
          borderWidth: 1,
          borderColor: cfg.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Feather name={cfg.name} size={16} color={cfg.color} />
        </View>
      </View>

      <Text style={[styles.metricValue, danger && styles.metricDanger, { marginTop: 0 }]}>{value}</Text>
      <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600', marginTop: 4 }}>{hint}</Text>
    </View>
  );
}
