import React, { useState } from 'react';
import axios from 'axios';

// Importando nossas telas modulares
import LoginScreen from './src/screens/LoginScreen';
import ManagerDashboard from './src/screens/ManagerDashboard';
import EmployeeDashboard from './src/screens/EmployeeDashboard';

const API_URL = 'http://127.0.0.1:8000/api'; 

export default function App() {
  const [token, setToken] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
    } catch (error) {
      alert('Erro no login. Verifique seu usuário e senha.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setPerfil(null);
    setUsername('');
    setPassword('');
  };

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
    return <ManagerDashboard perfil={perfil} handleLogout={handleLogout} />;
  }

  return <EmployeeDashboard perfil={perfil} handleLogout={handleLogout} />;
}