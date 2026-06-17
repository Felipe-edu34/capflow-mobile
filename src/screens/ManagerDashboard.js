import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

// Importando os componentes modulares do gerente
import InventorySection from '../components/manager/InventorySection';
import MetricCard from '../components/manager/MetricCard';
import ProductDetailModal from '../components/manager/ProductDetailModal';
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
  const [listaSetores, setListaSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const [formProduto, setFormProduto] = useState(initialProductForm);
  const [formSetor, setFormSetor] = useState(initialSectorForm);
  const [imagem, setImagem] = useState(null);
  const [setorSelecionado, setSetorSelecionado] = useState('todos');
  const [busca, setBusca] = useState('');

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

  useEffect(() => {
    carregarItens();
    carregarSetores();
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
  }, [itens, busca]);

  // Manipuladores dos formulários
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

    if (imagem) {
      formData.append('imagem', imagem);
    }

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
    } catch (error) {
      console.log('Erro detalhado da API:', error.response?.data || error.message);
      
      if (error.response?.data && typeof error.response.data === 'object') {
        // CORREÇÃO TÉCNICA: Verificação de tipo segura para evitar falha no método .join()
        const errosServidor = Object.entries(error.response.data)
          .map(([campo, msgs]) => {
            const mensagemTratada = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
            return `${campo}: ${mensagemTratada}`;
          })
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
    if (formSetor.responsavelId) {
      payload.responsavel = formSetor.responsavelId;
    }

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
      alert('Erro ao criar setor. Verifique as permissões ou ID do funcionário.');
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
    } catch (error) {
      console.log('Erro ao excluir:', error);
      alert('Erro ao excluir the produto.');
    }
  };

  const handleAtualizarProduto = async (idProduto, dadosAtualizados, novaImagem) => {
    try {
      const formData = new FormData();
      formData.append('nome', dadosAtualizados.nome);
      formData.append('quantidade_atual', dadosAtualizados.quantidade_atual);
      formData.append('unidade_medida', dadosAtualizados.unidade_medida);
      formData.append('estoque_minimo', dadosAtualizados.estoque_minimo);
      formData.append('setor', dadosAtualizados.setor);

      if (novaImagem) {
        formData.append('imagem', novaImagem);
      }

      await axios.patch(`${API_URL}/itens/${idProduto}/`, formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Produto updated com sucesso!');
      setItemSelecionado(null);
      carregarItens();
    } catch (error) {
      console.log('Erro ao atualizar:', error.response?.data || error.message);
      alert('Erro ao atualizar o produto.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>CF</Text>
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.headerTitle}>CapFlow Control Tower</Text>
            <Text style={styles.headerSubtitle}>{perfil.empresa} | Gestor: {perfil.username}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HERO BANNER - DESIGN PROFISSIONAL */}
        <View style={[styles.hero, { backgroundColor: '#06111F', paddingVertical: 32, paddingHorizontal: 24 }]}>
          <View style={styles.heroCopy}>
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
              Painel Administrativo
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24 }}>
              Gestão de catálogo e mapeamento de setores operacionais.
            </Text>

            {/* SELETOR DE ABAS */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tabButton, abaAtiva === 'produtos' && styles.tabButtonActive]}
                onPress={() => setAbaAtiva('produtos')}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabButtonText, abaAtiva === 'produtos' && styles.tabButtonTextActive]}>
                  Novo Produto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, abaAtiva === 'setores' && styles.tabButtonActive]}
                onPress={() => setAbaAtiva('setores')}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabButtonText, abaAtiva === 'setores' && styles.tabButtonTextActive]}>
                  Novo Setor
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* INDICADORES DE DESEMPENHO */}
        <View style={styles.metricsGrid}>
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

        {/* WORKSPACE DIVIDIDO */}
        <View style={styles.workspaceWrap}>
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
            ) : (
              <SectorForm
                form={formSetor}
                setFormValue={setSectorFormValue}
                onSubmit={handleCadastrarSetor}
                salvando={salvando}
              />
            )}
          </View>

          <View style={styles.listColumn}>
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
            />
          </View>
        </View>
      </ScrollView>

      {/* MODAL DETALHADO CONECTADO ÀS OPERAÇÕES */}
      <ProductDetailModal
        item={itemSelecionado}
        visible={Boolean(itemSelecionado)}
        baseUrl={BASE_URL}
        onClose={() => setItemSelecionado(null)}
        onExcluir={handleExcluirProduto}
        onAtualizar={handleAtualizarProduto}
        listaSetores={listaSetores}
      />
    </SafeAreaView>
  );
}