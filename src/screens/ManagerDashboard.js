import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

// Importando os componentes modulares do gerente
import InventorySection from '../components/manager/InventorySection';
import MetricCard from '../components/manager/MetricCard';
import ProductDetailModal from '../components/manager/ProductDetailModal';
import MovementHistory from '../components/manager/MovementHistory';
import ProductForm from '../components/manager/ProductForm';
import SectorForm from '../components/manager/SectorForm';
import styles from '../components/manager/managerStyles';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';
const initialProductForm = {
  nome: '',
  quantidade: '',
  unidade: 'UN',
  minimo: '',
  setorId: '',
  gerenteId: '',
};

const initialSectorForm = {
  nome: '',
  responsavelId: '',
};

function getSetorKey(item) {
  return String(item.setor || item.setor_id || item.setor_nome || 'sem-setor');
}

function getSetorNome(item) {
  if (item.setor_nome) return item.setor_nome;
  if (item.setor || item.setor_id) return `Setor ${item.setor || item.setor_id}`;
  return 'Sem setor definido';
}

export default function ManagerDashboard({ perfil, token, handleLogout }) {
  // 1. ESTADOS DO DASHBOARD
  const [abaAtiva, setAbaAtiva] = useState('produtos');
  const [itens, setItens] = useState([]);
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [listaSetores, setListaSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const [formProduto, setFormProduto] = useState(initialProductForm);
  const [formSetor, setFormSetor] = useState(initialSectorForm);
  const [imagem, setImagem] = useState(null);
  const [setorSelecionado, setSetorSelecionado] = useState('todos');
  const [busca, setBusca] = useState('');
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [ordenacao, setOrdenacao] = useState('alfabetica');

  // 2. BUSCA DE DADOS
  const carregarItens = async () => {
    try {
      const response = await axios.get(`${API_URL}/itens/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setItens(response.data);
    } catch (error) {
      console.log('Erro ao buscar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarSetores = async () => {
    try {
      const response = await axios.get(`${API_URL}/setores/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setListaSetores(response.data);
    } catch (error) {
      console.log('Erro ao buscar setores:', error);
    }
  };

  const carregarMovimentacoes = async () => {
    try {
      const response = await axios.get(`${API_URL}/movimentacoes/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setMovimentacoes(response.data);
    } catch (error) {
      console.log('Erro ao buscar movimentações:', error);
    }
  };

  useEffect(() => {
    carregarItens();
    carregarSetores();
    carregarMovimentacoes();
  }, []);

  // 3. INTELIGÊNCIA DE INVENTÁRIO
  const { indicadores, gruposPorSetor, setores } = useMemo(() => {
    const mapaSetores = new Map();
    let volume = 0;
    let itensCriticos = 0;

    const itensFiltrados = itens.filter((item) => {
      if (!busca.trim()) return true;
      return item.nome.toLowerCase().includes(busca.toLowerCase());
    });

    itensFiltrados.forEach((item) => {
      const key = getSetorKey(item);
      const nome = getSetorNome(item);
      const estoqueBaixo = Number(item.quantidade_atual) <= Number(item.estoque_minimo);

      volume += Number(item.quantidade_atual || 0);
      if (estoqueBaixo) itensCriticos += 1;

      if (!mapaSetores.has(key)) {
        mapaSetores.set(key, { key, nome, itens: [], criticos: 0 });
      }

      const grupo = mapaSetores.get(key);
      grupo.itens.push(item);
      if (estoqueBaixo) grupo.criticos += 1;
    });

    const grupos = Array.from(mapaSetores.values()).sort((a, b) => a.nome.localeCompare(b.nome));

    grupos.forEach(grupo => {
      grupo.itens.sort((a, b) => {
        if (ordenacao === 'alfabetica') return a.nome.localeCompare(b.nome);
        if (ordenacao === 'maior_estoque') return Number(b.quantidade_atual) - Number(a.quantidade_atual);
        if (ordenacao === 'menor_estoque') return Number(a.quantidade_atual) - Number(b.quantidade_atual);
        if (ordenacao === 'criticos') {
          const aCritico = Number(a.quantidade_atual) <= Number(a.estoque_minimo) ? 1 : 0;
          const bCritico = Number(b.quantidade_atual) <= Number(b.estoque_minimo) ? 1 : 0;
          if (bCritico === aCritico) return a.nome.localeCompare(b.nome);
          return bCritico - aCritico;
        }
        return 0;
      });
    });

    return {
      indicadores: {
        totalItens: itensFiltrados.length,
        itensCriticos,
        setores: grupos.length,
        volume,
      },
      gruposPorSetor: grupos,
      setores: grupos.map(({ key, nome }) => ({ key, nome })),
    };
  }, [itens, busca, ordenacao]);

  const setProductFormValue = (field, value) => {
    setFormProduto((current) => ({ ...current, [field]: value }));
  };

  const setSectorFormValue = (field, value) => {
    setFormSetor((current) => ({ ...current, [field]: value }));
  };

  const handleSelecionarImagem = (event) => {
    const arquivo = event.target.files[0];
    if (arquivo) setImagem(arquivo);
  };

  // --- FUNÇÕES OPERACIONAIS (POST, PATCH, DELETE) ---
  const handleCadastrarProduto = async () => {
    const camposFaltando = [];
    if (!formProduto.nome?.trim()) camposFaltando.push('Nome do produto');
    if (!formProduto.quantidade?.toString().trim()) camposFaltando.push('Quantidade atual');
    if (!formProduto.minimo?.toString().trim()) camposFaltando.push('Estoque mínimo');
    if (!formProduto.setorId) camposFaltando.push('Setor responsável');

    if (camposFaltando.length > 0) {
      alert(`Não foi possível salvar.\nPor favor, preencha:\n• ${camposFaltando.join('\n• ')}`);
      return;
    }

    setSalvando(true);
    const formData = new FormData();
    formData.append('nome', formProduto.nome);
    formData.append('quantidade_atual', formProduto.quantidade);
    formData.append('unidade_medida', formProduto.unidade || 'UN');
    formData.append('estoque_minimo', formProduto.minimo);
    formData.append('setor', formProduto.setorId);

    if (imagem) formData.append('imagem', imagem);

    try {
      await axios.post(`${API_URL}/itens/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Produto cadastrado com sucesso!');
      setFormProduto(initialProductForm);
      setImagem(null);
      carregarItens(); 
      carregarMovimentacoes();
    } catch (error) {
      console.log('Erro detalhado da API:', error.response?.data || error.message);
      if (error.response?.data && typeof error.response.data === 'object') {
        const errosServidor = Object.entries(error.response.data)
          .map(([campo, msgs]) => `${campo}: ${Array.isArray(msgs) ? msgs.join(', ') : String(msgs)}`)
          .join('\n');
        alert(`Erro retornado pelo Django:\n${errosServidor}`);
      } else {
        alert('Erro ao salvar o produto no estoque.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleCadastrarSetor = async () => {
    if (!formSetor.nome) {
      alert('Por favor, digite o nome do setor.');
      return;
    }

    setSalvando(true);
    const payload = { nome: formSetor.nome };
    if (formSetor.responsavelId) payload.responsavel = formSetor.responsavelId;

    try {
      await axios.post(`${API_URL}/setores/`, payload, {
        headers: { Authorization: `Token ${token}` },
      });

      alert('Setor operacional criado com sucesso!');
      setFormSetor(initialSectorForm);
      carregarItens();
      carregarSetores();
    } catch (error) {
      console.log('Erro ao cadastrar setor:', error.response?.data || error.message);
      alert('Erro ao criar setor.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirProduto = async (idProduto) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto permanentemente?')) return;

    try {
      await axios.delete(`${API_URL}/itens/${idProduto}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      alert('Produto excluído com sucesso!');
      setItemSelecionado(null);
      carregarItens();
      carregarMovimentacoes();
    } catch (error) {
      console.log('Erro ao excluir:', error);
      alert('Erro ao excluir o produto.');
    }
  };

  const handleMaryPatch = async (idProduto, dadosAtualizados, novaImagem) => {
    try {
      const formData = new FormData();
      formData.append('nome', dadosAtualizados.nome);
      formData.append('quantidade_atual', dadosAtualizados.quantidade_atual);
      formData.append('unidade_medida', dadosAtualizados.unidade_medida);
      formData.append('estoque_minimo', dadosAtualizados.estoque_minimo);
      formData.append('setor', dadosAtualizados.setor);

      if (novaImagem) formData.append('imagem', novaImagem);

      await axios.patch(`${API_URL}/itens/${idProduto}/`, formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Produto atualizado com sucesso!');
      setItemSelecionado(null);
      carregarItens();
      carregarMovimentacoes();
    } catch (error) {
      console.log('Erro ao atualizar:', error.response?.data || error.message);
      alert('Erro ao atualizar o produto.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', flexDirection: 'column' }}>
      
      {/* 🟦 BARRA SUPERIOR GLOBAL DE INFORMAÇÕES (BRANDING & STATUS DE ALTO NÍVEL) */}
      <View style={{ height: 75, backgroundColor: '#06111F', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, borderBottomWidth: 1, borderColor: '#1E293B' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 36, height: 36, backgroundColor: '#0EA5E9', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16 }}>CF</Text>
          </View>
          <View>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }}>CapFlow</Text>
            <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '500' }}>Control Tower</Text>
          </View>
        </View>
        <View style={{ backgroundColor: '#1E293B', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#334155' }}>
          <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '600' }}>Painel Corporativo</Text>
        </View>
      </View>

      {/* CORPO DO WORKSPACE (MENU + CONTEÚDO DISTRIBUÍDOS EM LINHA) */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
      
      {/* MENU LATERAL DE NAVEGAÇÃO DINÂMICO */}
      {sidebarAberta && (
        <View style={{ width: 280, backgroundColor: '#06111F', padding: 20, justifyContent: 'space-between', borderRightWidth: 1, borderColor: '#1E293B' }}>
        <View style={{ flex: 1 }}>

          {/* Opções do Menu */}
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#475569', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
              Módulos do Sistema
            </Text>

            {[
              { id: 'produtos', label: 'Novo Produto', desc: 'Gestão de estoque' },
              { id: 'setores', label: 'Novo Setor', desc: 'Mapear armazéns' },
              { id: 'movimentacoes', label: 'Movimentações', desc: 'Histórico de auditoria' },
            ].map((item) => {
              const ativo = abaAtiva === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setAbaAtiva(item.id)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    backgroundColor: ativo ? '#1E293B' : 'transparent',
                    borderLeftWidth: ativo ? 4 : 0,
                    borderLeftColor: '#0EA5E9',
                  }}
                >
                  <Text style={{ color: ativo ? '#FFF' : '#94A3B8', fontSize: 13, fontWeight: '600' }}>{item.label}</Text>
                  <Text style={{ color: ativo ? '#38BDF8' : '#475569', fontSize: 11, marginTop: 2 }}>{item.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Perfil do Usuário e Logout na Base da Sidebar */}
        <View style={{ paddingTop: 20, borderTopWidth: 1, borderColor: '#1E293B' }}>
          <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
            {perfil.username}
          </Text>
          <Text style={{ color: '#64748B', fontSize: 11, marginBottom: 12 }} numberOfLines={1}>
            {perfil.empresa}
          </Text>
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ backgroundColor: '#EF4444', paddingVertical: 8, borderRadius: 6, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
        </View>
        )}

      {/* 🖥️ ÁREA DE CONTEÚDO PRINCIPAL (DIREITA) */}
      <View style={{ flex: 1, flexDirection: 'column' }}>
        
        {/* TOP BAR DE STATUS */}
        <View style={{ height: 60, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity 
              onPress={() => setSidebarAberta(!sidebarAberta)}
              style={{ padding: 8, borderRadius: 6, backgroundColor: '#F1F5F9' }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#475569' }}>
                {sidebarAberta ? '✕' : '☰'}
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', textTransform: 'capitalize' }}>
            Painel Geral / {abaAtiva}
          </Text>
          </View>
          <View style={{ backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, borderWidth: 1, borderColor: '#BAE6FD' }}>
            <Text style={{ color: '#0369A1', fontSize: 12, fontWeight: '600' }}>Gestor Ativo</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* INDICADORES DE DESEMPENHO (Sempre visíveis no topo do espaço de trabalho) */}
          <View style={[styles.metricsGrid, { marginBottom: 24 }]}>
            <MetricCard label="Produtos" value={indicadores.totalItens} hint="itens no catálogo" />
            <MetricCard
              label="Críticos"
              value={indicadores.itensCriticos}
              hint="abaixo do mínimo"
              danger={indicadores.itensCriticos > 0}
            />
            <MetricCard label="Setores" value={indicadores.setores} hint="áreas mapeadas" />
            <MetricCard label="Volume" value={indicadores.volume} hint="unidades registradas" />
          </View>

          {/* WORKSPACE DIVIDIDO DE ACORDO COM A ABA ATIVA */}
          <View style={styles.workspaceWrap}>
            
            {/* Coluna Esquerda: Formulários Dinâmicos */}
            <View style={styles.formColumn}>
              {abaAtiva === 'produtos' ? (
                <ProductForm
                  form={formProduto}
                  setFormValue={setProductFormValue}
                  imagem={imagem}
                  onSelecionarImagem={handleSelecionarImagem}
                  onSubmit={handleCadastrarProduto}
                  salvando={salvando}
                  listaSetores={listaSetores}
                />
              ) : abaAtiva === 'setores' ? (
                <SectorForm
                  form={formSetor}
                  setFormValue={setSectorFormValue}
                  onSubmit={handleCadastrarSetor}
                  salvando={salvando}
                />
              ) : (
                <View style={[styles.listPanel, { padding: 20 }]}>
                  <Text style={styles.sectionTitle}>Painel de Auditoria</Text>
                  <Text style={styles.sectionEyebrow}>O histórico completo de entradas e saídas automáticas geradas pelo painel está listado ao lado.</Text>
                </View>
              )}
            </View>

            {/* Coluna Direita: Listagem de Inventário ou Histórico */}
            <View style={styles.listColumn}>
              {abaAtiva === 'movimentacoes' ? (
                <MovementHistory movimentacoes={movimentacoes} />
              ) : (
                <InventorySection
                  grupos={gruposPorSetor}
                  setores={setores}
                  setorSelecionado={setorSelecionado}
                  onSelecionarSetor={setSetorSelecionado}
                  busca={busca}
                  onBuscaChange={setBusca}
                  loading={loading}
                  totalItens={itens.length}
                  baseUrl={BASE_URL}
                  onOpenItem={setItemSelecionado}
                  ordenacao={ordenacao}
                  onOrdenacaoChange={setOrdenacao}
                />
              )}
            </View>

          </View>
        </ScrollView>
      </View>

      {/* MODAL DETALHADO */}
      <ProductDetailModal
        item={itemSelecionado}
        visible={Boolean(itemSelecionado)}
        baseUrl={BASE_URL}
        onClose={() => setItemSelecionado(null)}
        onExcluir={handleExcluirProduto}
        onMaryPatch={handleMaryPatch}
        listaSetores={listaSetores}
      />
      </View>
    </SafeAreaView>
  );
}