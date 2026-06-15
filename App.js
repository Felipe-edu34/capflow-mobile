import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Modal, Alert } from 'react-native';
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

  // --- ESTADOS DO MODAL DE MOVIMENTAÇÃO ---
  const [modalVisible, setModalVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [tipoMov, setTipoMov] = useState('ENTRADA'); 
  const [qtdMov, setQtdMov] = useState('');
  const [obsMov, setObsMov] = useState('');
  const [enviandoMov, setEnviandoMov] = useState(false);

  // Assim que o token é salvo (login com sucesso), ele dispara a busca do estoque
  useEffect(() => {
    if (token) buscarEstoque();
  }, [token]);

  // --- 1. FUNÇÃO DE BUSCAR OS ITENS NO BANCO ---
  const buscarEstoque = async () => {
    setLoadingEstoque(true);
    try {
      // Faz o GET na rota de itens, mostrando o "Crachá" (Token) para o Django
      const response = await axios.get('http://127.0.0.1:8000/api/itens/', {
        headers: { Authorization: `Token ${token}` }
      });
      
      // Salva os dados na variável que constrói a tela
      setItensEstoque(response.data); 
      console.log("Itens do estoque recebidos:", response.data);
      
    } catch (error) {
      console.log('Erro ao buscar estoque:', error);
    } finally {
      setLoadingEstoque(false);
    }
  };

  // --- 2. FUNÇÃO DE LOGIN (PEGAR O CRACHÁ) ---
  const handleLogin = async () => {
    if (!username || !password) {
      setStatusMessage('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true); 
    setStatusMessage('Conectando ao servidor...');
    
    try {
      // Bate na porta de autenticação
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: username,
        password: password
      });
      
      // Salva o token (aceita tanto o padrão antigo quanto o novo)
      const tokenRecebido = response.data.access || response.data.token;
      setToken(tokenRecebido); 
      
      console.log("Crachá recebido com sucesso:", tokenRecebido);
      setStatusMessage('Login realizado com sucesso!');
    } catch (error) {
      console.log(error);
      setStatusMessage('Erro de conexão ou usuário incorreto.');
    } finally {
      setLoading(false); 
    }
  };

  // --- 3. FUNÇÕES DO MODAL ---
  const abrirModal = (item) => {
    setItemSelecionado(item);
    setTipoMov('ENTRADA');
    setQtdMov('');
    setObsMov('');
    setModalVisible(true);
  };

  const salvarMovimentacao = async () => {
    if (!qtdMov || isNaN(qtdMov) || qtdMov <= 0) {
      Alert.alert('Erro', 'Digite uma quantidade válida.');
      return;
    }

    setEnviandoMov(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/movimentacoes/', {
        item: itemSelecionado.id,
        tipo: tipoMov,
        quantidade_movimentada: qtdMov,
        observacao: obsMov
      }, {
        headers: { Authorization: `Token ${token}` }
      });

      setModalVisible(false);
      buscarEstoque(); // Atualiza a lista por trás
      Alert.alert('Sucesso', 'Movimentação registrada com sucesso!');
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setEnviandoMov(false);
    }
  };

  // --- RENDERIZAÇÃO DE CADA ITEM DA LISTA ---
  const renderizarItem = ({ item }) => (
    <TouchableOpacity style={styles.itemCard} onPress={() => abrirModal(item)}>
      <Text style={styles.itemTitle}>📦 {item.nome}</Text>
      <Text style={styles.itemText}>Quantidade Atual: {item.quantidade_atual} {item.unidade_medida}</Text>
      {parseFloat(item.quantidade_atual) <= parseFloat(item.estoque_minimo) ? (
        <Text style={styles.alertaEstoque}>⚠️ Estoque Baixo! Mínimo: {item.estoque_minimo}</Text>
      ) : null}
      <Text style={styles.toqueAqui}>Toque para movimentar 👆</Text>
    </TouchableOpacity>
  );

  // --- TELA PRINCIPAL (LOGADO) ---
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

        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalFundo}>
            <View style={styles.modalCaixa}>
              <Text style={styles.modalTitulo}>Lançar Movimentação</Text>
              <Text style={styles.modalSub}>{itemSelecionado?.nome}</Text>

              <View style={styles.botoesTipo}>
                <TouchableOpacity 
                  style={[styles.botaoTipo, tipoMov === 'ENTRADA' ? styles.botaoAtivoEntrada : null]} 
                  onPress={() => setTipoMov('ENTRADA')}
                >
                  <Text style={tipoMov === 'ENTRADA' ? styles.textoBranco : styles.textoPreto}>Entrada (+)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.botaoTipo, tipoMov === 'SAIDA' ? styles.botaoAtivoSaida : null]} 
                  onPress={() => setTipoMov('SAIDA')}
                >
                  <Text style={tipoMov === 'SAIDA' ? styles.textoBranco : styles.textoPreto}>Saída (-)</Text>
                </TouchableOpacity>
              </View>

              <TextInput 
                style={styles.inputModal} 
                placeholder="Quantidade" 
                keyboardType="numeric"
                value={qtdMov}
                onChangeText={setQtdMov}
              />
              <TextInput 
                style={styles.inputModal} 
                placeholder="Observação" 
                value={obsMov}
                onChangeText={setObsMov}
              />

              {enviandoMov ? <ActivityIndicator size="large" color="#2563eb" /> : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>
                  <TouchableOpacity style={[styles.botaoModal, { backgroundColor: '#94a3b8' }]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.textoBranco}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.botaoModal, { backgroundColor: '#2563eb' }]} onPress={salvarMovimentacao}>
                    <Text style={styles.textoBranco}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // --- TELA DE LOGIN (DESLOGADO) ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧢 CapFlow</Text>
      <Text style={styles.subtitle}>Gestão de Estoque Setorizado</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome de Usuário</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} secureTextEntry={true} value={password} onChangeText={setPassword} />
      </View>

      <Text style={styles.statusText}>{statusMessage}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.textoBranco}>Entrar no Sistema</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderColor: '#e2e8f0', paddingBottom: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b' },
  logoutButton: { backgroundColor: '#ef4444', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  inputContainer: { width: '100%', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#ffffff', width: '100%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 16 },
  button: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
  statusText: { fontSize: 13, color: '#64748b', marginBottom: 15, textAlign: 'center' },
  itemCard: { backgroundColor: '#ffffff', padding: 18, borderRadius: 10, marginBottom: 12, width: '100%', borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  itemTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  itemText: { fontSize: 15, color: '#475569', marginBottom: 4 },
  alertaEstoque: { color: '#ef4444', fontWeight: 'bold', fontSize: 13, marginTop: 8 },
  toqueAqui: { color: '#2563eb', fontSize: 12, marginTop: 10, textAlign: 'right', fontWeight: '600' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCaixa: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '100%', alignItems: 'center' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
  modalSub: { fontSize: 15, color: '#64748b', marginBottom: 20 },
  botoesTipo: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 20 },
  botaoTipo: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, alignItems: 'center', marginHorizontal: 5 },
  botaoAtivoEntrada: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  botaoAtivoSaida: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  textoBranco: { color: '#fff', fontWeight: 'bold' },
  textoPreto: { color: '#0f172a', fontWeight: 'bold' },
  inputModal: { width: '100%', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 15 },
  botaoModal: { flex: 0.48, paddingVertical: 12, borderRadius: 6, alignItems: 'center' }
});