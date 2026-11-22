import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  useWindowDimensions, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen({ username, setUsername, password, setPassword, handleLogin, loading }) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 900;

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [campoFocado, setCampoFocado] = useState(null);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Elementos decorativos de fundo */}
      <View style={styles.backdrop}>
        <View style={styles.glowCircleOne} />
        <View style={styles.glowCircleTwo} />
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, styles.gridLineTwo]} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.contentContainer,
          isLargeScreen ? styles.rowLayout : styles.columnLayout
        ]}>
          
          {/* Painel Esquerdo (Apresentação da Plataforma) */}
          <View style={[styles.heroPanel, isLargeScreen ? styles.heroPanelLarge : styles.heroPanelMobile]}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Feather name="layers" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flexShrink: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={styles.logo}>CapFlow</Text>
                  <View style={styles.versionBadge}>
                    <Text style={styles.versionBadgeText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.subtitle}>Plataforma de Comando de Inventário</Text>
              </View>
            </View>

            <Text style={[styles.headline, !isLargeScreen && { fontSize: 26, lineHeight: 34 }]}>
              Domine seu Inventário em Tempo Real
            </Text>
            <Text style={styles.description}>
              Acompanhe estoque, setores e movimentações em uma experiência precisa, auditável e desenhada para alta performance operacional.
            </Text>

            {/* Destaques de Funcionalidades */}
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
                  <Feather name="activity" size={16} color="#38BDF8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Monitoramento Analítico</Text>
                  <Text style={styles.featureDesc}>Indicadores de volume, ocupação por setor e alertas automáticos de ruptura.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Feather name="check-circle" size={16} color="#34D399" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Rastreabilidade e Auditoria</Text>
                  <Text style={styles.featureDesc}>Histórico completo de entradas e saídas com exportação instantânea para CSV.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Painel Direito (Card de Autenticação) */}
          <View style={[styles.loginPanel, isLargeScreen ? styles.loginPanelLarge : styles.loginPanelMobile]}>
            <View style={styles.cardBadgeRow}>
              <View style={styles.cardBadge}>
                <Feather name="shield" size={13} color="#0284C7" />
                <Text style={styles.cardEyebrow}>Acesso Seguro</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Entrar no console</Text>
            <Text style={styles.cardSubtitle}>
              Insira suas credenciais corporativas para acessar o painel de controle.
            </Text>

            {/* Campo Usuário */}
            <Text style={styles.inputLabel}>Usuário</Text>
            <View style={[
              styles.inputWrapper,
              campoFocado === 'username' && styles.inputWrapperFocused
            ]}>
              <Feather 
                name="user" 
                size={18} 
                color={campoFocado === 'username' ? '#0EA5E9' : '#94A3B8'} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Usuário"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setCampoFocado('username')}
                onBlur={() => setCampoFocado(null)}
                autoCapitalize="none"
                accessibilityLabel="Usuário"
              />
            </View>

            {/* Campo Senha */}
            <Text style={styles.inputLabel}>Senha de Acesso</Text>
            <View style={[
              styles.inputWrapper,
              campoFocado === 'password' && styles.inputWrapperFocused
            ]}>
              <Feather 
                name="lock" 
                size={18} 
                color={campoFocado === 'password' ? '#0EA5E9' : '#94A3B8'} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setCampoFocado('password')}
                onBlur={() => setCampoFocado(null)}
                secureTextEntry={!mostrarSenha}
                accessibilityLabel="Senha"
              />
              <TouchableOpacity 
                onPress={() => setMostrarSenha(!mostrarSenha)} 
                style={styles.eyeButton}
                accessibilityRole="button"
                accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Feather name={mostrarSenha ? 'eye-off' : 'eye'} size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin} 
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Acessar Dashboard"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonText}>Acessar Dashboard</Text>
                  <Feather name="arrow-right" size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.securityRow}>
              <View style={styles.statusDot} />
              <Text style={styles.securityText}>Sessão criptografada e protegida via Token REST</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060E1A',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  glowCircleOne: {
    position: 'absolute',
    top: -120,
    left: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
  },
  glowCircleTwo: {
    position: 'absolute',
    bottom: -140,
    right: -80,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  gridLine: {
    position: 'absolute',
    top: '20%',
    left: -40,
    right: -40,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ rotate: '-9deg' }],
  },
  gridLineTwo: {
    top: '74%',
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    transform: [{ rotate: '7deg' }],
  },
  contentContainer: {
    width: '100%',
    maxWidth: 1120,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  rowLayout: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  heroPanel: {
    width: '100%',
    maxWidth: 560,
    padding: 36,
    backgroundColor: '#0B172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 12,
  },
  heroPanelLarge: {
    flex: 1.15,
    maxWidth: 600,
  },
  heroPanelMobile: {
    padding: 24,
    borderRadius: 20,
  },
  loginPanelMobile: {
    padding: 24,
    borderRadius: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },
  brandMark: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  versionBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  versionBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  headline: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#94A3B8',
    marginBottom: 28,
  },
  featureList: {
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  featureDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  loginPanel: {
    backgroundColor: '#FFFFFF',
    padding: 36,
    borderRadius: 24,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 10,
  },
  loginPanelLarge: {
    flex: 0.85,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cardEyebrow: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputWrapperFocused: {
    borderColor: '#0EA5E9',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  securityText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});