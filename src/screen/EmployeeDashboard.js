import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function EmployeeDashboard({ perfil, handleLogout }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Estoque CapFlow</Text>
          <Text style={styles.headerSubtitle}>{perfil.empresa} | Operador: {perfil.username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Área de Movimentação</Text>
        <Text style={styles.infoText}>Focado em dar entradas e saídas rápidas nos produtos.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A365D' },
  headerSubtitle: { fontSize: 14, color: '#718096', marginTop: 2 },
  logoutButton: { padding: 8 },
  logoutText: { color: '#E53E3E', fontWeight: 'bold' },
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  welcomeText: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#718096' }
});