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
const SUPABASE_URL = 'https://ltqyjayrehyyybdvvuyn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IG-rdnj9L3Ly-J-j3RvMdg__SfVDghO';

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
    const loginInput = (username || '').trim();
    if (!loginInput || !password) {
      alert('Por favor, preencha seu e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      let accessToken = null;

      // 1. Se o usuário digitou um e-mail, autentica direto no Supabase Auth (GoTrue)
      if (loginInput.includes('@')) {
        const supabaseAuthResponse = await axios.post(
          `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
          { email: loginInput, password },
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
            },
          }
        );
        accessToken = supabaseAuthResponse.data.access_token;
      } else {
        // 2. Caso tenha digitado username sem '@', o endpoint /api/token/ resolve no Supabase Auth
        const responseToken = await axios.post(`${API_URL}/token/`, {
          username: loginInput,
          password,
        });
        accessToken = responseToken.data.token || responseToken.data.access_token;
      }

      // 3. Busca o perfil e permissões no backend validando o JWT do Supabase
      const responsePerfil = await axios.get(`${API_URL}/me/`, {
        headers: { Authorization: `Token ${accessToken}` },
      });

      setToken(accessToken);
      setPerfil(responsePerfil.data);

      // Salva a sessão no armazenamento local seguro
      await AsyncStorage.multiSet([
        [TOKEN_STORAGE_KEY, accessToken],
        [PERFIL_STORAGE_KEY, JSON.stringify(responsePerfil.data)],
      ]);
    } catch (error) {
      const msg =
        error.response?.data?.msg ||
        error.response?.data?.error_description ||
        error.response?.data?.detail ||
        'Erro no login. Verifique seu e-mail e senha no Supabase.';
      alert(msg);
      console.log('Erro no login Supabase:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (token && token.split('.').length === 3) {
        await axios.post(
          `${SUPABASE_URL}/auth/v1/logout`,
          {},
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch(() => {});
      }
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

    const cargosGestao = ['GERENTE', 'DONO', 'ADMINISTRADOR', 'GESTOR'];
    if (cargosGestao.includes((perfil.cargo || '').toUpperCase())) {
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