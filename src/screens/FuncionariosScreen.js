import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform, Modal, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import modernStyles from '../components/manager/modernStyles';
import AddFuncionarioModal from '../components/manager/AddFuncionarioModal'; 

const API_URL = 'http://localhost:8000/api/funcionarios/'; 

export default function FuncionariosScreen({ token, onFuncionarioCriado }) {
  const [busca, setBusca] = useState('');
  const [buscaFocada, setBuscaFocada] = useState(false);
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);

  // Estado do Modal de Gerenciamento de Permissões / Edição de Funcionário
  const [funcGerenciado, setFuncGerenciado] = useState(null);
  const [cargoEdit, setCargoEdit] = useState('OPERADOR');
  const [statusEdit, setStatusEdit] = useState('ATIVO');
  const [nomeEdit, setNomeEdit] = useState('');
  const [salvandoPermissao, setSalvandoPermissao] = useState(false);

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

  useEffect(() => {
    if (token) {
      carregarFuncionarios();
    }
  }, [token]);

  const handleSalvarFuncionario = async (dadosNovos) => {
    try {
      setCarregando(true);
      const response = await axios.post(API_URL, dadosNovos, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      setFuncionarios([response.data, ...funcionarios]);
      if (onFuncionarioCriado) {
        onFuncionarioCriado();
      }
      setModalVisivel(false);
      alert('Funcionário cadastrado com sucesso!');
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
      
      alert(`Atenção no Cadastro:\n${msgErro}`);
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalGerenciar = (func) => {
    setFuncGerenciado(func);
    setNomeEdit(func.nome || func.username || '');
    setCargoEdit((func.cargo || 'OPERADOR').toUpperCase());
    setStatusEdit((func.status || 'ATIVO').toUpperCase());
  };

  const handleSalvarPermissoes = async () => {
    if (!funcGerenciado) return;
    setSalvandoPermissao(true);

    const payload = {
      nome: nomeEdit,
      cargo: cargoEdit,
      status: statusEdit,
    };

    try {
      const response = await axios.patch(`${API_URL}${funcGerenciado.id}/`, payload, {
        headers: { Authorization: `Token ${token}` },
      });

      const atualizado = response.data || { ...funcGerenciado, ...payload };
      setFuncionarios((prev) =>
        prev.map((item) => (String(item.id) === String(funcGerenciado.id) ? { ...item, ...atualizado } : item))
      );

      if (onFuncionarioCriado) {
        onFuncionarioCriado();
      }

      setFuncGerenciado(null);
      alert('Permissões e cargo atualizados com sucesso!');
    } catch (error) {
      console.log('Erro ao atualizar permissões:', error.response?.data || error.message);
      alert('Não foi possível salvar as alterações deste funcionário no servidor.');
    } finally {
      setSalvandoPermissao(false);
    }
  };

  const handleExcluirFuncionario = async () => {
    if (!funcGerenciado) return;

    const confirmar = Platform.OS === 'web'
      ? window.confirm(`Deseja realmente remover o acesso de ${funcGerenciado.nome || funcGerenciado.username}?`)
      : true;

    if (!confirmar) return;

    setSalvandoPermissao(true);
    try {
      await axios.delete(`${API_URL}${funcGerenciado.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setFuncionarios((prev) => prev.filter((f) => String(f.id) !== String(funcGerenciado.id)));
      if (onFuncionarioCriado) {
        onFuncionarioCriado();
      }
      setFuncGerenciado(null);
      alert('Funcionário removido da equipe.');
    } catch (error) {
      console.log('Erro ao excluir funcionário:', error.response?.data || error.message);
      alert('Não foi possível excluir este funcionário.');
    } finally {
      setSalvandoPermissao(false);
    }
  };

  const funcionariosFiltrados = funcionarios.filter(func => {
    const nome = (func.nome || func.username || '').toLowerCase();
    const email = (func.email || '').toLowerCase();
    const termoBusca = busca.toLowerCase();
    return nome.includes(termoBusca) || email.includes(termoBusca);
  });

  const getCorCargo = (cargo) => {
    switch (cargo?.toUpperCase()) {
      case 'ADMINISTRADOR':
      case 'DONO':
        return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' };
      case 'GESTOR':
      case 'GERENTE':
        return { bg: '#F3E8FF', text: '#9333EA', border: '#E9D5FF' };
      default:
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
    }
  };

  return (
    <View style={modernStyles.listPanel}>
      
      {/* Cabeçalho */}
      <View style={modernStyles.listHeader}>
        <View>
          <Text style={modernStyles.sectionEyebrow}>Controle de Acessos</Text>
          <Text style={modernStyles.sectionTitle}>Equipe CapFlow</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <View style={[modernStyles.countBadge, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
            <Feather name="users" size={12} color="#475569" />
            <Text style={modernStyles.countBadgeText}>{funcionarios.length} membros</Text>
          </View>

          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#0EA5E9',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
              shadowColor: '#0EA5E9',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.18,
              shadowRadius: 6,
              elevation: 3,
            }}
            onPress={() => setModalVisivel(true)}
            activeOpacity={0.8}
          >
            <Feather name="user-plus" size={15} color="#FFFFFF" />
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>+ Novo Membro</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de Pesquisa */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: buscaFocada ? '#FFFFFF' : '#F8FAFC',
        borderWidth: 1.5,
        borderColor: buscaFocada ? '#0EA5E9' : '#CBD5E1',
        borderRadius: 12,
        paddingHorizontal: 14,
        marginBottom: 20,
      }}>
        <Feather name="search" size={16} color={buscaFocada ? '#0EA5E9' : '#64748B'} style={{ marginRight: 10 }} />
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 11,
            fontSize: 14,
            color: '#0F172A',
            fontWeight: '600',
            ...Platform.select({ web: { outlineStyle: 'none' } }),
          }}
          placeholder="Pesquisar funcionário por nome ou e-mail..."
          placeholderTextColor="#94A3B8"
          value={busca}
          onChangeText={setBusca}
          onFocus={() => setBuscaFocada(true)}
          onBlur={() => setBuscaFocada(false)}
        />
        {Boolean(busca) && (
          <TouchableOpacity onPress={() => setBusca('')} style={{ padding: 4 }}>
            <Feather name="x-circle" size={15} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading animado */}
      {carregando && funcionarios.length === 0 ? (
        <View style={modernStyles.loadingState}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={modernStyles.loadingText}>Carregando membros da equipe...</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {funcionariosFiltrados.map((func) => {
            const nomeExibicao = func.nome || func.username || 'Colaborador';
            const iniciais = nomeExibicao.slice(0, 2).toUpperCase();
            const coresCargo = getCorCargo(func.cargo);
            const ehInativo = func.status === 'INATIVO';

            return (
              <View
                key={func.id}
                style={{
                  backgroundColor: '#FFF',
                  padding: 16,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  opacity: ehInativo ? 0.65 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, minWidth: 180 }}>
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#0F172A',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#38BDF8', fontWeight: '900', fontSize: 14 }}>{iniciais}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>{nomeExibicao}</Text>
                      {ehInativo && (
                        <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: '#DC2626', fontSize: 10, fontWeight: '800' }}>INATIVO</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <Feather name="mail" size={11} color="#64748B" />
                      <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>
                        {func.email || 'Sem e-mail cadastrado'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{
                    backgroundColor: coresCargo.bg,
                    borderColor: coresCargo.border,
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 999,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: coresCargo.text }}>
                      {func.cargo || 'OPERADOR'}
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      borderWidth: 1,
                      borderColor: '#CBD5E1',
                      backgroundColor: '#F8FAFC',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                    }}
                    onPress={() => abrirModalGerenciar(func)}
                    activeOpacity={0.75}
                  >
                    <Feather name="sliders" size={13} color="#0284C7" />
                    <Text style={{ color: '#0284C7', fontSize: 12, fontWeight: '700' }}>Permissões</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {funcionariosFiltrados.length === 0 && (
            <View style={modernStyles.emptyState}>
              <Feather name="users" size={30} color="#94A3B8" style={{ marginBottom: 10 }} />
              <Text style={modernStyles.emptyTitle}>Nenhum funcionário encontrado</Text>
              <Text style={modernStyles.emptyText}>Cadastre novos membros da equipe clicando em "+ Novo Membro".</Text>
            </View>
          )}
        </View>
      )}

      {/* MODAL DE NOVO MEMBRO */}
      <AddFuncionarioModal 
        visible={modalVisivel} 
        onClose={() => setModalVisivel(false)}
        onSalvar={handleSalvarFuncionario} 
      />

      {/* MODAL DE GERENCIAR PERMISSÕES / CARGO */}
      <Modal
        visible={Boolean(funcGerenciado)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFuncGerenciado(null)}
      >
        <View style={modernStyles.modalOverlay}>
          <View style={[modernStyles.modalContainer, { width: '100%', maxWidth: 480 }]}>
            <View style={modernStyles.modalHeader}>
              <View>
                <Text style={modernStyles.modalTitle}>Configurar Permissões</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {funcGerenciado?.email || funcGerenciado?.username}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setFuncGerenciado(null)} style={modernStyles.modalCloseBtn}>
                <Text style={modernStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={modernStyles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={modernStyles.label}>Nome do Colaborador</Text>
              <TextInput
                style={modernStyles.formInput}
                value={nomeEdit}
                onChangeText={setNomeEdit}
                placeholder="Nome completo"
                placeholderTextColor="#94A3B8"
              />

              <Text style={[modernStyles.label, { marginTop: 18 }]}>Nível de Permissão (Cargo)</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => setCargoEdit('GESTOR')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: cargoEdit === 'GESTOR' || cargoEdit === 'GERENTE' ? '#0EA5E9' : '#E2E8F0',
                    backgroundColor: cargoEdit === 'GESTOR' || cargoEdit === 'GERENTE' ? '#F0F9FF' : '#FFFFFF',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Feather name="shield" size={15} color={cargoEdit === 'GESTOR' || cargoEdit === 'GERENTE' ? '#0284C7' : '#64748B'} />
                    <Text style={{ fontWeight: '800', fontSize: 14, color: cargoEdit === 'GESTOR' || cargoEdit === 'GERENTE' ? '#0284C7' : '#334155' }}>
                      Gestor
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#64748B', lineHeight: 16 }}>
                    Acesso total a métricas, setores, produtos e equipe.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCargoEdit('OPERADOR')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: cargoEdit === 'OPERADOR' ? '#F59E0B' : '#E2E8F0',
                    backgroundColor: cargoEdit === 'OPERADOR' ? '#FEF3C7' : '#FFFFFF',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Feather name="package" size={15} color={cargoEdit === 'OPERADOR' ? '#D97706' : '#64748B'} />
                    <Text style={{ fontWeight: '800', fontSize: 14, color: cargoEdit === 'OPERADOR' ? '#D97706' : '#334155' }}>
                      Operador
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#64748B', lineHeight: 16 }}>
                    Realiza entradas, saídas e conferência operacional.
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[modernStyles.label, { marginTop: 18 }]}>Status da Conta</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => setStatusEdit('ATIVO')}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 11,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: statusEdit === 'ATIVO' ? '#10B981' : '#E2E8F0',
                    backgroundColor: statusEdit === 'ATIVO' ? '#ECFDF5' : '#FFFFFF',
                  }}
                >
                  <Feather name="check-circle" size={14} color={statusEdit === 'ATIVO' ? '#059669' : '#64748B'} />
                  <Text style={{ fontWeight: '800', fontSize: 13, color: statusEdit === 'ATIVO' ? '#059669' : '#64748B' }}>
                    Acesso Ativo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStatusEdit('INATIVO')}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 11,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: statusEdit === 'INATIVO' ? '#EF4444' : '#E2E8F0',
                    backgroundColor: statusEdit === 'INATIVO' ? '#FEF2F2' : '#FFFFFF',
                  }}
                >
                  <Feather name="slash" size={14} color={statusEdit === 'INATIVO' ? '#DC2626' : '#64748B'} />
                  <Text style={{ fontWeight: '800', fontSize: 13, color: statusEdit === 'INATIVO' ? '#DC2626' : '#64748B' }}>
                    Suspenso
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 26 }}>
                <TouchableOpacity
                  onPress={handleExcluirFuncionario}
                  disabled={salvandoPermissao}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    backgroundColor: '#FEF2F2',
                    borderWidth: 1,
                    borderColor: '#FECACA',
                  }}
                >
                  <Feather name="trash-2" size={14} color="#DC2626" />
                  <Text style={{ color: '#DC2626', fontWeight: '800', fontSize: 13 }}>Excluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSalvarPermissoes}
                  disabled={salvandoPermissao}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 13,
                    borderRadius: 10,
                    backgroundColor: '#0EA5E9',
                  }}
                >
                  {salvandoPermissao ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Feather name="check" size={15} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Salvar Permissões</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}