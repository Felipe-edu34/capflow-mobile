import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AddFuncionarioModal from '../components/manager/AddFuncionarioModal'; 

const API_URL = 'http://localhost:8000/api/funcionarios/'; 

// 🛠️ 1. Recebemos o token diretamente via props (passado pelo ManagerDashboard)
export default function FuncionariosScreen({ token }) {
  const [busca, setBusca] = useState('');
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);

  // 🛠️ 2. Usamos o formato "Token" e a prop que vem da tela principal
  const carregarFuncionarios = async () => {
    try {
      setCarregando(true);
      
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      setFuncionarios(response.data);
    } catch (error) {
      console.log("Erro ao carregar:", error);
      Alert.alert('Erro', 'Não foi possível carregar os funcionários do servidor.');
    } finally {
      setCarregando(false);
    }
  };

  // Garante que só vai tentar carregar se o token já estiver disponível
  useEffect(() => {
    if (token) {
      carregarFuncionarios();
    }
  }, [token]);

  // 🛠️ 3. Função de salvar também atualizada para usar a prop token
  const handleSalvarFuncionario = async (dadosNovos) => {
    try {
      setCarregando(true);
      
      const response = await axios.post(API_URL, dadosNovos, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      setFuncionarios([response.data, ...funcionarios]);
      setModalVisivel(false);
      Alert.alert('Sucesso', 'Funcionário cadastrado com sucesso!');
      
    } catch (error) {
      console.error("Erro completo retornado pelo Axios:", error);
      
      let msgErro = 'Erro ao conectar com o servidor.';
      
      if (error.response?.data) {
        const dadosErro = error.response.data;
        
        if (typeof dadosErro === 'object') {
          msgErro = Object.entries(dadosErro)
            .map(([campo, mensagens]) => {
              const textoMensagem = Array.isArray(mensagens) ? mensagens.join(', ') : mensagens;
              return `${campo.toUpperCase()}: ${textoMensagem}`;
            })
            .join('\n');
        } else {
          msgErro = String(dadosErro);
        }
      } else if (error.message) {
        msgErro = error.message;
      }
      
      Alert.alert('Atenção no Cadastro', msgErro);
    } finally {
      setCarregando(false);
    }
  };

  const funcionariosFiltrados = funcionarios.filter(func => {
    const nome = func.nome ? func.nome.toLowerCase() : '';
    const email = func.email ? func.email.toLowerCase() : '';
    const termoBusca = busca.toLowerCase();
    return nome.includes(termoBusca) || email.includes(termoBusca);
  });

  const getCorCargo = (cargo) => {
    switch (cargo?.toUpperCase()) {
      case 'ADMINISTRADOR': return { bg: '#E0F2FE', text: '#0EA5E9' };
      case 'GESTOR': return { bg: '#EEF2F6', text: '#475569' };
      default: return { bg: '#FEF3C7', text: '#D97706' };
    }
  };

  return (
    <View style={{ width: '100%', padding: 16 }}>
      
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#0F172A' }}>Equipe CapFlow</Text>
          <Text style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>Gerencie os acessos do sistema</Text>
        </View>

        <TouchableOpacity 
          style={{ backgroundColor: '#0EA5E9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}
          onPress={() => setModalVisivel(true)}
        >
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>+ Novo Membro</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Pesquisa */}
      <View style={{ marginBottom: 20 }}>
        <TextInput
          style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#0F172A' }}
          placeholder="Pesquisar funcionário..."
          placeholderTextColor="#94A3B8"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* Loading animado */}
      {carregando && funcionarios.length === 0 ? (
        <ActivityIndicator size="large" color="#0EA5E9" style={{ marginTop: 40 }} />
      ) : (
        <View style={{ gap: 12 }}>
          {funcionariosFiltrados.map((func) => {
            const coresCargo = getCorCargo(func.cargo);
            const ehInativo = func.status === 'INATIVO';

            return (
              <View
                key={func.id}
                style={{
                  backgroundColor: '#FFF',
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: ehInativo ? 0.6 : 1
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>{func.nome}</Text>
                  <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{func.email}</Text>
                  
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <View style={{ backgroundColor: coresCargo.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: coresCargo.text }}>
                        {func.cargo}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  style={{ borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                  onPress={() => alert(`Gerenciar permissões de ${func.nome}`)}
                >
                  <Text style={{ color: '#475569', fontSize: 12, fontWeight: '600' }}>Gerenciar</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {funcionariosFiltrados.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 40 }}>
              Nenhum funcionário encontrado.
            </Text>
          )}
        </View>
      )}

      {/* MODAL CONECTADO */}
      <AddFuncionarioModal 
        visible={modalVisivel} 
        onClose={() => setModalVisivel(false)}
        onSalvar={handleSalvarFuncionario} 
      />

    </View>
  );
}