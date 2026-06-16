import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function EmployeeDashboard({ perfil, handleLogout }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>CF</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>CapFlow Ops</Text>
            <Text style={styles.headerSubtitle}>{perfil.empresa} | Operador: {perfil.username}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Operação ativa</Text>
          </View>
          <Text style={styles.welcomeText}>Centro de movimentação</Text>
          <Text style={styles.infoText}>
            Ambiente rápido para registrar entradas, saídas e apoiar a rotina de estoque com padrão operacional.
          </Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Prioridade</Text>
            <Text style={styles.metricValue}>Baixas</Text>
            <Text style={styles.metricHint}>Verificar itens críticos</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Fluxo</Text>
            <Text style={styles.metricValue}>Entrada</Text>
            <Text style={styles.metricHint}>Reposição controlada</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Setores</Text>
            <Text style={styles.metricValue}>Online</Text>
            <Text style={styles.metricHint}>Sincronização via API</Text>
          </View>
        </View>

        <View style={styles.actionPanel}>
          <Text style={styles.panelTitle}>Fila operacional</Text>
          <View style={styles.taskRow}>
            <View style={styles.taskBullet} />
            <Text style={styles.taskText}>Conferir produtos com estoque mínimo antes de novas saídas.</Text>
          </View>
          <View style={styles.taskRow}>
            <View style={[styles.taskBullet, styles.taskBulletGreen]} />
            <Text style={styles.taskText}>Registrar movimentações assim que a contagem física for validada.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF3F8' },
  header: {
    backgroundColor: '#07111F',
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#5EEAD4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { color: '#07111F', fontWeight: '900', fontSize: 14 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#9FB0C3', marginTop: 2 },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutText: { color: '#FCA5A5', fontWeight: '900', fontSize: 13 },
  content: {
    flex: 1,
    padding: 22,
    gap: 18,
  },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DDE5EF',
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
  },
  statusDot: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#22C55E' },
  statusText: { color: '#166534', fontWeight: '900', fontSize: 12 },
  welcomeText: { fontSize: 28, lineHeight: 34, fontWeight: '900', color: '#0F172A', marginBottom: 10 },
  infoText: { fontSize: 15, lineHeight: 22, color: '#64748B', maxWidth: 660 },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DDE5EF',
  },
  metricLabel: { color: '#64748B', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  metricValue: { color: '#0F172A', fontSize: 22, fontWeight: '900', marginTop: 8 },
  metricHint: { color: '#7C8DA0', fontSize: 12, marginTop: 6, fontWeight: '700' },
  actionPanel: {
    backgroundColor: '#07111F',
    borderRadius: 8,
    padding: 20,
  },
  panelTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', marginBottom: 14 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  taskBullet: { width: 9, height: 9, borderRadius: 9, backgroundColor: '#F59E0B' },
  taskBulletGreen: { backgroundColor: '#5EEAD4' },
  taskText: { color: '#C9D5E3', fontSize: 14, lineHeight: 20, flex: 1 },
});
