import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios'; // Agora que está instalado corretamente, o celular vai reconhecer!

export default function App() {
  // --- ESTADOS (Memória do React) ---
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [token, setToken] = useState(null); 
  const [statusMessage, setStatusMessage] = useState('Aguardando login...'); 

  // --- FUNÇÃO QUE ENVIA OS DADOS AO DJANGO ---
  const handleLogin = async () => {
    if (!username || !password) {
      setStatusMessage('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true); 
    setStatusMessage('Conectando ao servidor...');
    
    try {
      // O celular envia os dados via Wi-Fi para o IP do seu computador na porta 8000
      const response = await axios.post('http://192.168.0.11:8000/api/token/', {
        username: username,
        password: password
      });

      // Se o Django validar, ele entrega o token
      const userToken = response.data.token;
      setToken(userToken); 
      setStatusMessage('Login realizado com sucesso!');
      
    } catch (error) {
      console.log(error);
      setStatusMessage('Erro de conexão ou dados incorretos.');
    } finally {
      setLoading(false); 
    }
  };

  // --- CONTROLADOR DE TELAS ---
  
  // Se o token existir, mostra a tela do Painel
  if (token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🧢 Painel CapFlow</Text>
        <Text style={styles.subtitle}>Gerenciamento de Estoque</Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>🎉 Sucesso! Você está logado pelo celular.</Text>
          <Text style={[styles.cardText, { marginTop: 10, color: '#2563eb', fontWeight: 'bold' }]}>
            Token: {token.substring(0, 15)}...
          </Text>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#ef4444' }]} onPress={() => setToken(null)}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Se não tiver token, mostra a tela de Login padrão
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧢 CapFlow</Text>
      <Text style={styles.subtitle}>Gestão de Estoque Setorizado</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome de Usuário</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: admin" 
          value={username}
          onChangeText={setUsername} 
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
          style={styles.input} 
          placeholder="••••••••" 
          secureTextEntry={true} 
          value={password}
          onChangeText={setPassword} 
        />
      </View>

      <Text style={styles.statusText}>Status: {statusMessage}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" /> 
        ) : (
          <Text style={styles.buttonText}>Entrar no Sistema</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// --- ESTILOS VISUAIS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f1f5f9',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardText: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 15,
    textAlign: 'center',
  }
});