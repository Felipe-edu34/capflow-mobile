import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';

export default function App() {
  // --- ESTADOS DO SISTEMA ---
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [token, setToken] = useState(null); 
  const [statusMessage, setStatusMessage] = useState('Aguardando login...'); 

  const [itensEstoque, setItensEstoque] = useState([]); 
  const [loadingEstoque, setLoadingEstoque] = useState(false); 

  // --- BUSCA AUTOMÁTICA AO LOGAR ---
  useEffect(() => {
    if (token) {
      buscarEstoque();
    }
  }, [token]);

  const buscarEstoque = async () => {
    setLoadingEstoque(true);
    try {
      const response = await axios.get('http://192.168.0.11:8000/api/itens/', {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      });
      setItensEstoque(response.data);
    } catch (error) {
      console.log('Erro ao buscar estoque:', error);
    } finally {
      setLoadingEstoque(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setStatusMessage('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true); 
    setStatusMessage('Conectando ao servidor...');
    
    try {
      const response = await axios.post('http://192.168.0.11:8000/api/token/', {
        username: username,
        password: password
      });
      setToken(response.data.token); 
      setStatusMessage('Login realizado com sucesso!');
    } catch (error) {
      console.log(error);
      setStatusMessage('Erro de conexão ou dados incorretos.');
    } finally {
      setLoading(false); 
    }
  };

  // --- DESIGN DE CADA ITEM DA LISTA COM SEUS CAMPOS REAIS ---
  const renderizarItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemTitle}>📦 {item.nome}</Text>
      <Text style={styles.itemText}>Quantidade Atual: {item.quantidade_atual} {item.unidade_medida}</Text>
      
      {/* Lógica Visual: Se a quantidade atual for menor ou igual ao mínimo, exibe alerta */}
      {parseFloat(item.quantidade_atual) <= parseFloat(item.estoque_minimo) ? (
        <Text style={styles.alertaEstoque}>
          ⚠️ Estoque Baixo! Mínimo ideal: {item.estoque_minimo}
        </Text>
      ) : null}
    </View>
  );

  // --- TELA DO PAINEL LOGADO ---
  if (token) {
    return (
      <View style={[styles.container, { paddingTop: 60, paddingBottom: 0 }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🧢 CapFlow</Text>
            <Text style={styles.subtitle}>Estoque Atual</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={() => setToken(null)}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {loadingEstoque ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={itensEstoque}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderizarItem}
            contentContainerStyle={{ paddingBottom: 40 }} 
            style={{ width: '100%' }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  }

  // --- TELA DE LOGIN ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧢 CapFlow</Text>
      <Text style={styles.subtitle}>Gestão de Estoque Setorizado</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome de Usuário</Text>
        <TextInput 
          style={styles.input} 
          value={username}
          onChangeText={setUsername} 
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
          style={styles.input} 
          secureTextEntry={true} 
          value={password}
          onChangeText={setPassword} 
        />
      </View>

      <Text style={styles.statusText}>{statusMessage}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Entrar no Sistema</Text>}
      </TouchableOpacity>
    </View>
  );
}

// --- ESTILIZAÇÃO VISUAL ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingBottom: 15,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b' },
  logoutButton: { backgroundColor: '#ef4444', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  inputContainer: { width: '100%', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#ffffff', width: '100%', paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 16,
  },
  button: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  statusText: { fontSize: 13, color: '#64748b', marginBottom: 15, textAlign: 'center' },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2, 
  },
  itemTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  itemText: { fontSize: 15, color: '#475569', marginBottom: 4 },
  alertaEstoque: { color: '#ef4444', fontWeight: 'bold', fontSize: 13, marginTop: 8 }
});