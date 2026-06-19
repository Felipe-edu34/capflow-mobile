import React from 'react';
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

export default function LoginScreen({ username, setUsername, password, setPassword, handleLogin, loading }) {
  // Pega a largura da tela em tempo real para fazer a responsividade
  const { width } = useWindowDimensions();
  
  // Define que telas maiores que 900px são consideradas "Desktop/Tablet Landscape"
  const isLargeScreen = width > 900;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* O backdrop (fundo com linhas) fica absoluto atrás de tudo */}
      <View style={styles.backdrop}>
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, styles.gridLineTwo]} />
      </View>

      {/* Envolvemos o conteúdo no ScrollView */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Container principal que muda a direção dependendo da tela */}
        <View style={[
          styles.contentContainer,
          isLargeScreen ? styles.rowLayout : styles.columnLayout
        ]}>
          
          {/* Painel Esquerdo (Texto) */}
          <View style={[styles.heroPanel, isLargeScreen && styles.heroPanelLarge]}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>CF</Text>
              </View>
              <View>
                <Text style={styles.logo}>CapFlow</Text>
                <Text style={styles.subtitle}>Plataforma de Comando de Inventário</Text>
              </View>
            </View>

            <Text style={styles.headline}>Domine seu Inventário em Tempo Real</Text>
            <Text style={styles.description}>
              Acompanhe estoque, setores e movimentações em uma experiência mais precisa, segura e pronta para rotina empresarial.
            </Text>
          </View>

          {/* Painel Direito (Login) */}
          <View style={[styles.loginPanel, isLargeScreen && styles.loginPanelLarge]}>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  scrollContent: {
    flexGrow: 1, // Permite que o scroll ocupe a tela toda se o conteúdo for menor, mas role se for maior
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40, // Dá um respiro para não grudar no topo/base ao rolar
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    zIndex: -1, // Garante que o fundo não bloqueie o clique nos botões
  },
  gridLine: {
    position: 'absolute',
    top: '18%',
    left: -40,
    right: -40,
    height: 1,
    backgroundColor: '#17304B',
    transform: [{ rotate: '-11deg' }],
  },
  gridLineTwo: {
    top: '70%',
    backgroundColor: '#154E5D',
    transform: [{ rotate: '8deg' }],
  },
  contentContainer: {
    width: '100%',
    maxWidth: 1100,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  rowLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  heroPanel: {
    width: '100%',
    maxWidth: 540,
    padding: 32,
    backgroundColor: '#0C1A30',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  heroPanelLarge: {
    flex: 1.2,
    maxWidth: 600,
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
    borderRadius: 14,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  logo: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#8EA4BC',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 18,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#B6C4D5',
    maxWidth: 500,
    marginBottom: 10,
  },
  loginPanel: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#E6EDF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
  loginPanelLarge: {
    flex: 0.8,
    marginTop: 0,
  },
  cardEyebrow: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 26,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#DDE5EF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    fontSize: 15,
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#0EA5E9',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    gap: 10,
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