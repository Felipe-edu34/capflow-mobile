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
import ManagerCharts from '../components/manager/ManagerCharts'; // <--- GRAFICOS IMPORTADOS REINTEGRADOS
import ProductFormModal from '../components/manager/ProductFormModal';
import modernStyles from '../components/manager/modernStyles';
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
  // 1. ESTADOS DO DASHBOARD (Aba padrão alterada para 'dashboard' para abrir nos gráficos)
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
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
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);

  // 2. BUSCA DE DADOS CONECTADA AO DJANGO (Mantida idêntica à sua)
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
    if (token) {
      carregarItens();
      carregarSetores();
      carregarMovimentacoes();
    }
  }, [token]);

  // 3. INTELIGÊNCIA DE INVENTÁRIO (Mantido useMemo original intacto)
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
    const arquivo = event.target.files?.[0];
    if (arquivo) setImagem(arquivo);
  };

  // --- FUNÇÕES OPERACIONAIS ORIGINAIS ---
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
      setModalProdutoVisivel(false);
      carregarItens();
      carregarMovimentacoes();
    } catch (error) {
      console.log('Erro detalhado:', error.response?.data || error.message);
      alert('Erro ao salvar o produto no estoque.');
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
      alert('Erro ao criar setor.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirProduto = async (idProduto) => {
    const confirmar = window?.confirm ? window.confirm('Deseja excluir permanentemente?') : true;
    if (!confirmar) return;

    try {
      await axios.delete(`${API_URL}/itens/${idProduto}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      alert('Produto excluído com sucesso!');
      setItemSelecionado(null);
      carregarItens();
      carregarMovimentacoes();
    } catch (error) {
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
      alert('Erro ao atualizar o produto.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>CF</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>CapFlow</Text>
            <Text style={styles.headerSubtitle}>Control Tower</Text>
          </View>
        </View>
        <View style={styles.badgeStatus}>
          <Text style={styles.badgeStatusText}>Painel Corporativo</Text>
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
      
        {/* MENU LATERAL INCLUINDO A OPÇÃO 'VISÃO GERAL' */}
        {sidebarAberta && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarSection}>
              <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                Módulos do Sistema
              </Text>

              {[
                { id: 'dashboard', label: 'Visão Geral', desc: 'Métricas e Gráficos' },
                { id: 'produtos', label: 'Novo Produto', desc: 'Gestão de estoque' },
                { id: 'setores', label: 'Novo Setor', desc: 'Mapear armazéns' },
                { id: 'movimentacoes', label: 'Movimentações', desc: 'Histórico de auditoria' },
              ].map((item) => {
                const ativo = abaAtiva === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setAbaAtiva(item.id)}
                    style={[
                      styles.sidebarItem,
                      ativo && styles.sidebarItemActive,
                    ]}
                  >
                    <Text style={[styles.sidebarItemTitle, ativo && { color: '#FFFFFF' }]}>{item.label}</Text>
                    <Text style={[styles.sidebarItemDesc, ativo && { color: '#9FC5F8' }]}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sidebarProfile}>
              <Text style={styles.sidebarUsername} numberOfLines={1}>
                {perfil?.username || 'Carregando...'}
              </Text>
              <Text style={styles.sidebarCompany} numberOfLines={1}>
                {perfil?.empresa || 'Corporativo'}
              </Text>
              <TouchableOpacity onPress={handleLogout} style={styles.sidebarLogout}>
                <Text style={styles.sidebarLogoutText}>Sair da Conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ÁREA DE CONTEÚDO PRINCIPAL */}
        <View style={{ flex: 1, flexDirection: 'column' }}>
          
          <View style={styles.topBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity onPress={() => setSidebarAberta(!sidebarAberta)} style={styles.toggleButton}>
                <Text style={styles.toggleButtonText}>{sidebarAberta ? '✕' : '☰'}</Text>
              </TouchableOpacity>
              <Text style={styles.pageHeading}>
                Painel Geral / {abaAtiva === 'dashboard' ? 'Visão Geral' : abaAtiva}
              </Text>
            </View>
            <View style={styles.badgeStatus}>
              <Text style={styles.badgeStatusText}>Gestor Ativo</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* INDICADORES DE DESEMPENHO REAL-TIME */}
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

            {/* CONDICIONAL INTELIGENTE PARA A RENDERIZAÇÃO */}
            {abaAtiva === 'dashboard' ? (
              /* SE A ABA FOR 'DASHBOARD' EXIBE SÓ OS GRAFICOS CORPORATIVOS */
              <View style={{ width: '100%', marginTop: 8 }}>
                <ManagerCharts gruposPorSetor={gruposPorSetor} itens={itens} />
              </View>
            ) : (
              /* CASO CONTRÁRIO, EXIBE O SEU LAYOUT DE DUAS COLUNAS ORIGINAL COM OS FORMULÁRIOS */
              <View style={styles.workspaceWrap}>

                <View style={styles.formColumn}>
                  {abaAtiva === 'produtos' ? (
                    <View style={[styles.listPanel, { padding: 20, backgroundColor: '#0F172A', borderColor: 'rgba(100, 200, 255, 0.2)' }]}>
                      <Text style={[styles.sectionTitle, { color: '#00D9FF' }]}>Gestao de Produtos</Text>
                      <Text style={[styles.sectionEyebrow, { color: 'rgba(224, 242, 254, 0.7)', marginTop: 8 }]}>
                        Clique no botao abaixo para cadastrar um novo produto no estoque.
                      </Text>
                      <TouchableOpacity
                        style={modernStyles.btnNovoInline}
                        onPress={() => setModalProdutoVisivel(true)}
                      >
                        <Text style={modernStyles.btnNovoInlineText}>+ Novo Produto</Text>
                      </TouchableOpacity>
                    </View>
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
            )}
          </ScrollView>
        </View>

      </View>

      {/* MODAL DE FORMULÁRIO MODERNO */}
      <ProductFormModal
        visible={modalProdutoVisivel}
        onClose={() => {
          setModalProdutoVisivel(false);
          setFormProduto(initialProductForm);
          setImagem(null);
        }}
        form={formProduto}
        setFormValue={setProductFormValue}
        imagem={imagem}
        onSelecionarImagem={handleSelecionarImagem}
        onSubmit={handleCadastrarProduto}
        salvando={salvando}
        listaSetores={listaSetores}
      />

      {/* MODAL DETALHADO COMPATIVEL COM OS DOIS MODOS */}
      <ProductDetailModal
        item={itemSelecionado}
        visible={Boolean(itemSelecionado)}
        baseUrl={BASE_URL}
        onClose={() => setItemSelecionado(null)}
        onExcluir={handleExcluirProduto}
        onMaryPatch={handleMaryPatch}
        listaSetores={listaSetores}
      />
    </SafeAreaView>
  );
}