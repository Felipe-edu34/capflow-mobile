import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import axios from 'axios';

// OBSERVAÇÃO IMPORTANTE: 
// Como estamos testando no celular físico, não podemos usar '127.0.0.1'.
// No próximo passo eu vou te ensinar a descobrir o número de IP do seu computador 
// para colocarmos aqui, beleza? Por enquanto deixei esse texto de aviso.
const API_URL = 'http://SEU_IP_DO_COMPUTADOR_AQUI:8000/api'; 

export default function App() {
  // O "useState" serve para o React guardar o que o usuário digita na tela
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Ativa a rodinha de carregamento
  const [token, setToken] = useState(null);       // Guarda o status se o login deu certo

  // Função que é disparada quando o usuário clica no botão "Entrar"
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Aviso', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true); // Ativa a rodinha de carregamento
    
    try {
      // Como estamos rodando na Web do computador, usamos 'localhost:8000'.
      // (Quando você for testar no Wi-Fi de casa pelo celular físico, mudaremos para o IP da sua máquina!)
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: username,
        password: password
      });

      // Se o Django aceitar o usuário e senha, ele devolve o token aqui:
      const userToken = response.data.token;
      
      setToken(userToken); // Salva o token no app para liberar o painel
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Usuário/Senha incorretos ou erro de conexão com o Django.');
    } finally {
      setLoading(false); // Para a rodinha de carregamento
    }
  };

  // SE O LOGIN DEU CERTO (TOKEN EXISTE), MOSTRA O PAINEL DO CAPFLOW
  if (token) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <Text style={styles.title}>🧢 Painel CapFlow</Text>
        <Text style={styles.subtitle}>Gerenciamento de Tecidos e Estoque</Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>🎉 Parabéns! Você se autenticou no Django com sucesso.</Text>
          <Text style={[styles.cardText, { marginTop: 10, color: '#2563eb', fontWeight: 'bold' }]}>
            Token de Acesso: {token.substring(0, 10)}...
          </Text>
        </View>

        {/* Botão para deslogar e limpar o token, voltando para o login */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#ef4444', marginTop: 20 }]} 
          onPress={() => setToken(null)}
        >
          <Text style={styles.buttonText}>Sair do Sistema</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // CASO CONTRÁRIO (SE NÃO TIVER TOKEN), CONTINUA MOSTRANDO A TELA DE LOGIN:
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Text style={styles.title}>🧢 CapFlow</Text>
      <Text style={styles.subtitle}>Gestão de Estoque Setorizado</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome de Usuário</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: admin" 
          value={username}
          onChangeText={setUsername} // Atualiza a variável username conforme digita
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
          style={styles.input} 
          placeholder="••••••••" 
          secureTextEntry={true} // Esconde as letras da senha com pontinhos
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" /> // Mostra a rodinha girando
        ) : (
          <Text style={styles.buttonText}>Entrar no Sistema</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Estilização visual (CSS do React Native)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
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
    marginBottom: 24,
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
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
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
  }
});