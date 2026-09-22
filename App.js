import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Importando nossas telas modulares
import LoginScreen from './src/screens/LoginScreen';
import ManagerDashboard from './src/screens/ManagerDashboard';
import EmployeeDashboard from './src/screens/EmployeeDashboard';

const API_URL = 'http://127.0.0.1:8000/api'; 
const TOKEN_STORAGE_KEY = '@capflow_token';
const PERFIL_STORAGE_KEY = '@capflow_perfil';

export default function App() {
  const [token, setToken] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Restaura a sessão salva localmente no dispositivo ao abrir o app
  useEffect(() => {
    const restaurarSessao = async () => {
      try {
        const [savedToken, savedPerfil] = await AsyncStorage.multiGet([
          TOKEN_STORAGE_KEY,
          PERFIL_STORAGE_KEY,
        ]);

        if (savedToken[1] && savedPerfil[1]) {
          setToken(savedToken[1]);
          setPerfil(JSON.parse(savedPerfil[1]));
        }
      } catch (error) {
        console.log('Erro ao restaurar sessão local:', error);
      } finally {
        setInitializing(false);
      }
    };

    restaurarSessao();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const responseToken = await axios.post(`${API_URL}/token/`, { username, password });
      const cracha = responseToken.data.token;

      const responsePerfil = await axios.get(`${API_URL}/me/`, {
        headers: { Authorization: `Token ${cracha}` }
      });

      setToken(cracha);
      setPerfil(responsePerfil.data);

      // Salva a sessão no armazenamento local seguro
      await AsyncStorage.multiSet([
        [TOKEN_STORAGE_KEY, cracha],
        [PERFIL_STORAGE_KEY, JSON.stringify(responsePerfil.data)],
      ]);
    } catch (error) {
      alert('Erro no login. Verifique seu usuário e senha.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, PERFIL_STORAGE_KEY]);
    } catch (error) {
      console.log('Erro ao remover sessão:', error);
    }
    setToken(null);
    setPerfil(null);
    setUsername('');
    setPassword('');
  };

  const renderContent = () => {
    if (initializing) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#07111F' }}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      );
    }

    // Roteador inteligente
    if (!token || !perfil) {
      return (
        <LoginScreen 
          username={username} setUsername={setUsername}
          password={password} setPassword={setPassword}
          handleLogin={handleLogin} loading={loading}
        />
      );
    }

    if (perfil.cargo === 'GERENTE' || perfil.cargo === 'DONO') {
      return <ManagerDashboard perfil={perfil} token={token} handleLogout={handleLogout} />;
    }

    return <EmployeeDashboard perfil={perfil} handleLogout={handleLogout} />;
  };

  return (
    <SafeAreaProvider>
      {renderContent()}
    </SafeAreaProvider>
  );
}