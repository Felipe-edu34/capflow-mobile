import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

export default function LoginScreen({ username, setUsername, password, setPassword, handleLogin, loading }) {
  return (
    <View style={styles.screen}>
      <View style={styles.backdrop}>
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, styles.gridLineTwo]} />
      </View>

      <View style={styles.heroPanel}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>CF</Text>
          </View>
          <View>
            <Text style={styles.logo}>CapFlow</Text>
            <Text style={styles.subtitle}>Inventory Command Platform</Text>
          </View>
        </View>

        <Text style={styles.headline}>Controle operacional com visão executiva.</Text>
        <Text style={styles.description}>
          Acompanhe estoque, setores e movimentações em uma experiência mais precisa, segura e pronta para rotina empresarial.
        </Text>

        <View style={styles.signalRow}>
          <View style={styles.signalItem}>
            <Text style={styles.signalValue}>24/7</Text>
            <Text style={styles.signalLabel}>monitoramento</Text>
          </View>
          <View style={styles.signalDivider} />
          <View style={styles.signalItem}>
            <Text style={styles.signalValue}>ERP</Text>
            <Text style={styles.signalLabel}>ready</Text>
          </View>
          <View style={styles.signalDivider} />
          <View style={styles.signalItem}>
            <Text style={styles.signalValue}>API</Text>
            <Text style={styles.signalLabel}>conectada</Text>
          </View>
        </View>
      </View>

      <View style={styles.loginPanel}>
        <Text style={styles.cardEyebrow}>Acesso Seguro</Text>
        <Text style={styles.cardTitle}>Entrar no console</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuário"
          placeholderTextColor="#8A97A8"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#8A97A8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#06111F" /> : <Text style={styles.buttonText}>Acessar Dashboard</Text>}
        </TouchableOpacity>

        <View style={styles.securityRow}>
          <View style={styles.statusDot} />
          <Text style={styles.securityText}>Sessão protegida por autenticação via token</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07111F',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  gridLine: {
    position: 'absolute',
    top: '18%',
    left: -40,
    right: -40,
    height: 1,
    backgroundColor: '#1E3A5F',
    transform: [{ rotate: '-9deg' }],
  },
  gridLineTwo: {
    top: '70%',
    backgroundColor: '#154E5D',
    transform: [{ rotate: '8deg' }],
  },
  heroPanel: {
    width: '100%',
    maxWidth: 520,
    padding: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#5EEAD4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#06111F',
    fontWeight: '900',
    fontSize: 16,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#8EA4BC',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  headline: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#B6C4D5',
    maxWidth: 460,
  },
  signalRow: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 8,
    padding: 16,
  },
  signalItem: {
    flex: 1,
  },
  signalValue: {
    color: '#5EEAD4',
    fontSize: 18,
    fontWeight: '900',
  },
  signalLabel: {
    color: '#8EA4BC',
    fontSize: 11,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  signalDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 14,
  },
  loginPanel: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 8,
  },
  cardEyebrow: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#DDE5EF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 15,
    fontSize: 15,
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#5EEAD4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#06111F',
    fontWeight: '900',
    fontSize: 15,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#22C55E',
  },
  securityText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
});
