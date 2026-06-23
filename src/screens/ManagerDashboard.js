import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Modal, TextInput } from 'react-native';
import axios from 'axios';

// Importando os componentes modulares do gerente
import InventorySection from '../components/manager/InventorySection';
import MetricCard from '../components/manager/MetricCard';
import ProductDetailModal from '../components/manager/ProductDetailModal';
import MovementHistory from '../components/manager/MovementHistory';
import SectorFormModal from '../components/manager/SectorFormModal';
import SectorList from '../components/manager/SectorList'; 
import ManagerCharts from '../components/manager/ManagerCharts'; 
import ProductFormModal from '../components/manager/ProductFormModal';
import modernStyles from '../components/manager/modernStyles';
import SubSectorFormModal from '../components/manager/SubSectorFormModal';

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
  id: null,
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
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [itens, setItens] = useState([]);
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [listaSetores, setListaSetores] = useState([]);
  const [listaSubsetores, setListaSubsetores] = useState([]);
  const [modalSubsetorVisivel, setModalSubsetorVisivel] = useState(false);
  const [salvandoSubsetor, setSalvandoSubsetor] = useState(false);

  const initialSubsetorForm = {
  id: null,
  nome: '',
  setorPaiId: '',
  };
  const [formSubsetor, setFormSubsetor] = useState(initialSubsetorForm);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const [formProduto, setFormProduto] = useState(initialProductForm);
  const [formSetor, setFormSetor] = useState(initialSectorForm);
  const [imagem, setImagem] = useState(null);
  const [setorSelecionado, setSetorSelecionado] = useState('todos');
  const [busca, setBusca] = useState('');
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [modalRapidoVisivel, setModalRapidoVisivel] = useState(false);
  const [itemRapidoSelecionado, setItemRapidoSelecionado] = useState(null);
  const [tipoRapido, setTipoRapido] = useState('ENTRADA');
  const [quantidadeRapida, setQuantidadeRapida] = useState('');
  const [ordenacao, setOrdenacao] = useState('alfabetica');
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  
  const [modalAlertasVisivel, setModalAlertasVisivel] = useState(false);
  const [alertaVisualizado, setAlertaVisualizado] = useState(false);
  const [modalSetorVisivel, setModalSetorVisivel] = useState(false);

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

  const carregarSubsetores = async () => {
  try {
    const response = await axios.get(`${API_URL}/subsetores/`, {
      headers: { Authorization: `Token ${token}` },
    });
    setListaSubsetores(response.data);
    } catch (error) {
    console.log("Erro ao carregar sub-setores:", error);
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
      carregarSubsetores();
    }
  }, [token]);

  // 1. Extração Global de Setores (para alimentar os botões e filtros sem depender do item selecionado)
  const setores = useMemo(() => {
    const mapa = new Map();
    itens.forEach(item => {
      const key = getSetorKey(item);
      const nome = getSetorNome(item);
      if (!mapa.has(key)) mapa.set(key, { key, nome });
    });
    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [itens]);

  // 2. Cálculo dos Dados Reativos (Responde ao filtro "setorSelecionado")
  const { indicadores, gruposPorSetor, listaItensCriticos, itensFiltrados } = useMemo(() => {
    const mapaSetores = new Map();
    let volume = 0;
    let itensCriticos = 0;
    const criticosArr = [];

    const filtrados = itens.filter((item) => {
      if (busca.trim() && !item.nome.toLowerCase().includes(busca.toLowerCase())) return false;
      if (setorSelecionado !== 'todos' && getSetorKey(item) !== String(setorSelecionado)) return false;
      return true;
    });

    filtrados.forEach((item) => {
      const key = getSetorKey(item);
      const nome = getSetorNome(item);
      const estoqueBaixo = Number(item.quantidade_atual) <= Number(item.estoque_minimo);

      volume += Number(item.quantidade_atual || 0);
      
      if (estoqueBaixo) {
        itensCriticos += 1;
        criticosArr.push(item);
      }

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
        totalItens: filtrados.length,
        itensCriticos,
        setores: mapaSetores.size,
        volume,
      },
      gruposPorSetor: grupos,
      listaItensCriticos: criticosArr,
      itensFiltrados: filtrados,
    };
  }, [itens, busca, ordenacao, setorSelecionado]);

  useEffect(() => {
    if (!loading && listaItensCriticos.length > 0 && !alertaVisualizado) {
      setModalAlertasVisivel(true);
      setAlertaVisualizado(true);
    }
  }, [loading, listaItensCriticos, alertaVisualizado]);

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

    // --- NOVA LÓGICA INTELIGENTE PARA SETOR E SUB-SETOR ---
    // Procura se o ID selecionado pertence à lista de sub-setores
    const subSetorSelecionado = listaSubsetores.find(sub => sub.id === formProduto.setorId);
    const setorPrincipalSelecionado = listaSetores.find(setor => setor.id === formProduto.setorId);

    if (subSetorSelecionado) {
      // Se for um sub-setor, descobrimos quem é o setor pai dele
      const paiId = subSetorSelecionado.setorPaiId || subSetorSelecionado.setor_pai || subSetorSelecionado.setor_id;
      
      formData.append('setor', paiId);              // Envia o ID do Setor Pai
      formData.append('subsetor', subSetorSelecionado.id); // Envia o ID do Sub-setor exigido pela API
    } else if (setorPrincipalSelecionado) {
      // Se selecionou o setor geral diretamente, enviamos o ID dele no setor
      formData.append('setor', setorPrincipalSelecionado.id);
      // Como o banco exige um sub-setor, enviamos vazio para testar se ele aceita, 
      // mas o ideal é que você selecione sempre a sub-opção na hora de testar!
      formData.append('subsetor', ''); 
    }
    // ------------------------------------------------------

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

  const handleSalvarSetor = async () => {
    if (!formSetor.nome) {
      alert('Por favor, digite o nome do setor.');
      return;
    }

    setSalvando(true);
    const payload = { nome: formSetor.nome };
    if (formSetor.responsavelId) payload.responsavel = formSetor.responsavelId;

    try {
      if (formSetor.id) {
        // Modo Edição (Atualizar)
        await axios.patch(`${API_URL}/setores/${formSetor.id}/`, payload, {
          headers: { Authorization: `Token ${token}` },
        });
        alert('Setor atualizado com sucesso!');
      } else {
        // Modo Criação (Cadastrar)
        await axios.post(`${API_URL}/setores/`, payload, {
          headers: { Authorization: `Token ${token}` },
        });
        alert('Setor criado com sucesso!');
      }
      
      setFormSetor(initialSectorForm);
      setModalSetorVisivel(false);
      carregarItens();
      carregarSetores();
    } catch (error) {
      alert('Erro ao salvar o setor.');
      console.log(error);
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarSubsetor = async () => {
  if (!formSubsetor.nome || !formSubsetor.setorPaiId) {
    alert('Por favor, preencha o nome e selecione o setor pai.');
    return;
  }

  setSalvandoSubsetor(true);
  const payload = {
    nome: formSubsetor.nome,
    setor_pai: formSubsetor.setorPaiId
  };

  try {
    if (formSubsetor.id) {
      // Editar Sub-setor
      await axios.patch(`${API_URL}/subsetores/${formSubsetor.id}/`, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      alert('Sub-setor atualizado!');
    } else {
      // Criar Sub-setor
      await axios.post(`${API_URL}/subsetores/`, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      alert('Sub-setor criado com sucesso!');
    }
    setFormSubsetor(initialSubsetorForm);
    setModalSubsetorVisivel(false);
    carregarSubsetores();
    carregarItens(); // Atualiza o painel geral
  } catch (error) {
    alert('Erro ao salvar sub-setor.');
    console.log(error);
  } finally {
    setSalvandoSubsetor(false);
  }
};

const handleExcluirSubsetor = async (idSubsetor) => {
  const confirmar = window?.confirm ? window.confirm('Deseja excluir este sub-setor?') : true;
  if (!confirmar) return;

  try {
    await axios.delete(`${API_URL}/subsetores/${idSubsetor}/`, {
      headers: { Authorization: `Token ${token}` },
    });
    alert('Sub-setor excluído!');
    carregarSubsetores();
    carregarItens();
  } catch (error) {
    alert('Erro ao excluir. Verifique se há produtos vinculados a este sub-setor.');
  }
};

const abrirModalEdicaoSubsetor = (sub) => {
  setFormSubsetor({
    id: sub.id,
    nome: sub.nome,
    setorPaiId: sub.setor_pai,
  });
  setModalSubsetorVisivel(true);
  };

  const handleExcluirSetor = async (idSetor) => {
    const confirmar = window?.confirm 
      ? window.confirm('Deseja realmente excluir este setor? Atenção: Isso pode afetar os produtos vinculados a ele.') 
      : true;
      
    if (!confirmar) return;

    try {
      await axios.delete(`${API_URL}/setores/${idSetor}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      alert('Setor excluído com sucesso!');
      carregarItens();
      carregarSetores();
    } catch (error) {
      alert('Erro ao excluir o setor. Verifique se existem produtos ainda vinculados a ele no banco de dados.');
      console.log(error);
    }
  };

  // Função auxiliar para abrir o modal preenchido
  const abrirModalEdicaoSetor = (setor) => {
    setFormSetor({
      id: setor.id,
      nome: setor.nome,
      responsavelId: setor.responsavel || '',
    });
    setModalSetorVisivel(true);
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

      alert('Produto updated com sucesso!');
      setItemSelecionado(null);
      carregarItens();
      carregarMovimentacoes();
    } catch (error) {
      alert('Erro ao atualizar o produto.');
    }
  };

  const handleMovimentacaoRapida = (item, tipo) => {
    setItemRapidoSelecionado(item);
    setTipoRapido(tipo);
    setQuantidadeRapida('');
    setModalRapidoVisivel(true);
  };

  const confirmarMovimentacaoRapida = async () => {
    if (!itemRapidoSelecionado) return;
    
    const quantidadeNum = Number(quantidadeRapida);
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      alert('Por favor, digite um número válido e maior que zero.');
      return;
    }

    let novaQuantidadeAtual = Number(itemRapidoSelecionado.quantidade_atual);
    if (tipoRapido === 'ENTRADA') {
      novaQuantidadeAtual += quantidadeNum;
    } else {
      if (novaQuantidadeAtual - quantidadeNum < 0) {
        alert('Operação negada: Quantidade insuficiente em estoque.');
        return;
      }
      novaQuantidadeAtual -= quantidadeNum;
    }

    try {
      await axios.post(`${API_URL}/movimentacoes/`, {
        item: itemRapidoSelecionado.id,
        tipo: tipoRapido,
        quantidade: quantidadeNum,
        observacao: `Movimentação rápida via painel geral`,
      }, {
        headers: { Authorization: `Token ${token}` },
      });

      await axios.patch(`${API_URL}/itens/${itemRapidoSelecionado.id}/`, {
        quantidade_atual: novaQuantidadeAtual
      }, {
        headers: { Authorization: `Token ${token}` },
      });

      setModalRapidoVisivel(false);
      carregarItens();
      carregarMovimentacoes();
    } catch (error) {
      alert('Erro ao salvar movimentação no banco de dados.');
    }
  };

  return (
    <SafeAreaView style={modernStyles.container}>
      <View style={modernStyles.header}>
        <View style={modernStyles.headerBrand}>
          <View style={modernStyles.brandMark}>
            <Text style={modernStyles.brandMarkText}>CF</Text>
          </View>
          <View>
            <Text style={modernStyles.headerTitle}>CapFlow</Text>
            <Text style={modernStyles.headerSubtitle}>Control Tower</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {listaItensCriticos.length > 0 && (
            <TouchableOpacity 
              onPress={() => setModalAlertasVisivel(true)}
              style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' }} />
              <Text style={{ color: '#991B1B', fontSize: 12, fontWeight: '700' }}>
                {listaItensCriticos.length} Alertas
              </Text>
            </TouchableOpacity>
          )}
          <View style={modernStyles.badgeStatus}>
            <Text style={modernStyles.badgeStatusText}>Painel Corporativo</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
      
        {sidebarAberta && (
          <View style={modernStyles.sidebar}>
            <View style={modernStyles.sidebarSection}>
              <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                Módulos do Sistema
              </Text>

              {[
                { id: 'dashboard', label: 'Visão Geral', desc: 'Métricas e Gráficos' },
                { id: 'produtos', label: 'Inventário', desc: 'Gestão de estoque' },
                { id: 'setores', label: 'Setores', desc: 'Gestão de áreas' },
                { id: 'movimentacoes', label: 'Movimentações', desc: 'Histórico de auditoria' },
              ].map((item) => {
                const ativo = abaAtiva === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setAbaAtiva(item.id)}
                    style={[
                      modernStyles.sidebarItem,
                      ativo && modernStyles.sidebarItemActive,
                    ]}
                  >
                    <Text style={[modernStyles.sidebarItemTitle, ativo && { color: '#FFFFFF' }]}>{item.label}</Text>
                    <Text style={[modernStyles.sidebarItemDesc, ativo && { color: '#9FC5F8' }]}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={modernStyles.sidebarProfile}>
              <Text style={modernStyles.sidebarUsername} numberOfLines={1}>
                {perfil?.username || 'Carregando...'}
              </Text>
              <Text style={modernStyles.sidebarCompany} numberOfLines={1}>
                {perfil?.empresa || 'Corporativo'}
              </Text>
              <TouchableOpacity onPress={handleLogout} style={modernStyles.sidebarLogout}>
                <Text style={modernStyles.sidebarLogoutText}>Sair da Conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ flex: 1, flexDirection: 'column' }}>
          
          <View style={modernStyles.topBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity onPress={() => setSidebarAberta(!sidebarAberta)} style={modernStyles.toggleButton}>
                <Text style={modernStyles.toggleButtonText}>{sidebarAberta ? '✕' : '☰'}</Text>
              </TouchableOpacity>
              <Text style={modernStyles.pageHeading}>
                Painel Geral / {abaAtiva === 'dashboard' ? 'Visão Geral' : abaAtiva}
              </Text>
            </View>
            <View style={modernStyles.badgeStatus}>
              <Text style={modernStyles.badgeStatusText}>Gestor Ativo</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={modernStyles.scrollContent}>
            
            {/* NOVO: Barra de Filtros Inteligentes por Setor */}
            {abaAtiva === 'dashboard' && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                  Filtro Analítico
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
                  <TouchableOpacity
                    onPress={() => setSetorSelecionado('todos')}
                    style={{
                      backgroundColor: setorSelecionado === 'todos' ? '#0F172A' : '#FFFFFF',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: setorSelecionado === 'todos' ? '#0F172A' : '#E2E8F0',
                    }}
                  >
                    <Text style={{ color: setorSelecionado === 'todos' ? '#FFF' : '#475569', fontWeight: '600', fontSize: 13 }}>
                      Visão Global
                    </Text>
                  </TouchableOpacity>
                  {setores.map(setor => (
                    <TouchableOpacity
                      key={setor.key}
                      onPress={() => setSetorSelecionado(setor.key)}
                      style={{
                        backgroundColor: setorSelecionado === setor.key ? '#0EA5E9' : '#FFFFFF',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: setorSelecionado === setor.key ? '#0EA5E9' : '#E2E8F0',
                      }}
                    >
                      <Text style={{ color: setorSelecionado === setor.key ? '#FFF' : '#475569', fontWeight: '600', fontSize: 13 }}>
                        {setor.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {listaItensCriticos.length > 0 && abaAtiva === 'dashboard' && (
              <View style={{ backgroundColor: '#FEF2F2', borderColor: '#FEE2E2', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifySetorContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Text style={{ color: '#991B1B', fontWeight: '700', fontSize: 14, marginBottom: 2 }}>
                    Ruptura Iminente de Estoque
                  </Text>
                  <Text style={{ color: '#7F1D1D', fontSize: 13, opacity: 0.9 }}>
                    Há {listaItensCriticos.length} produtos operando abaixo do limite mínimo {setorSelecionado !== 'todos' ? 'neste setor' : 'configurado'}.
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setModalAlertasVisivel(true)}
                  style={{ backgroundColor: '#EF4444', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 }}
                >
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Ver Itens</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={[modernStyles.metricsGrid, { marginBottom: 24 }]}>
              <MetricCard label="Produtos" value={indicadores.totalItens} hint="itens encontrados" />
              <MetricCard
                label="Críticos"
                value={indicadores.itensCriticos}
                hint="abaixo do mínimo"
                danger={indicadores.itensCriticos > 0}
              />
              <MetricCard label="Setores" value={indicadores.setores} hint="áreas envolvidas" />
              <MetricCard label="Volume" value={indicadores.volume} hint="unidades registradas" />
            </View>

            <View style={{ width: '100%', marginTop: 8 }}>
              
              {/* O ManagerCharts agora recebe as listas filtradas para refletir exatamente a visão do Setor */}
              {abaAtiva === 'dashboard' && (
                <ManagerCharts gruposPorSetor={gruposPorSetor} itens={itensFiltrados} />
              )}

              {abaAtiva === 'produtos' && (
                <InventorySection
                  grupos={gruposPorSetor}
                  setores={setores}
                  setorSelecionado={setorSelecionado}
                  onSelecionarSetor={setSetorSelecionado}
                  busca={busca}
                  onBuscaChange={setBusca}
                  loading={loading}
                  totalItens={indicadores.totalItens}
                  baseUrl={BASE_URL}
                  onOpenItem={setItemSelecionado}
                  ordenacao={ordenacao}
                  onOrdenacaoChange={setOrdenacao}
                  onNovoProduto={() => setModalProdutoVisivel(true)}
                  onMovimentacaoRapida={handleMovimentacaoRapida}
                />
              )}

              {abaAtiva === 'setores' && (
                <View style={{ width: '100%' }}>
                  <SectorList 
                    setores={listaSetores} 
                    subsetores={listaSubsetores} // NOVO
                    itens={itens} 
                    onNovoSetor={() => {
                      setFormSetor(initialSectorForm);
                      setModalSetorVisivel(true);
                    }}
                    onEditarSetor={abrirModalEdicaoSetor}
                    onExcluirSetor={handleExcluirSetor}
                    
                    // NOVAS PROPS PARA SUB-SETORES:
                    onNovoSubsetor={() => {
                      setFormSubsetor({ id: null, nome: '', setorPaiId: '' }); // Usando objeto inicial limpo
                      setModalSubsetorVisivel(true);
                    }}
                    onEditarSubsetor={abrirModalEdicaoSubsetor}
                    onExcluirSubsetor={handleExcluirSubsetor}
                  />
                </View>
              )}
              

              {abaAtiva === 'movimentacoes' && (
                <MovementHistory movimentacoes={movimentacoes} />
              )}

            </View>

          </ScrollView>
        </View>

      </View>

      <Modal
        visible={modalAlertasVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalAlertasVisivel(false)}
      >
        <View style={modernStyles.modalOverlay}>
          <View style={[modernStyles.modalContainer, { maxWidth: 550 }]}>
            <View style={modernStyles.modalHeader}>
              <View>
                <Text style={modernStyles.modalTitle}>⚠️ Reposição de Estoque Urgente</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Itens que cruzaram a linha do estoque mínimo.</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalAlertasVisivel(false)}
                style={modernStyles.modalCloseBtn}
              >
                <Text style={modernStyles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350, padding: 20 }}>
              {listaItensCriticos.map((item) => (
                <View 
                  key={item.id || item.nome}
                  style={{ flexDirection: 'row', alignItems: 'center', justifySetorContent: 'space-between', padding: 12, backgroundColor: '#FFF5F5', borderRadius: 8, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: 8 }}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>{item.nome}</Text>
                    <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Setor: {getSetorNome(item)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#EF4444' }}>
                      {item.quantidade_atual} {item.unidade_medida || 'UN'}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 1 }}>
                      Mínimo: {item.estoque_minimo}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={{ padding: 20, borderTopWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row', justifySetorContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setModalAlertasVisivel(false)}
                style={{ backgroundColor: '#0F172A', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Fechar Relatório</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* MODAL DE SETORES */}
      <SectorFormModal
        visible={modalSetorVisivel}
        onClose={() => {
          setModalSetorVisivel(false);
          setFormSetor(initialSectorForm);
        }}
        form={formSetor}
        setFormValue={setSectorFormValue}
        onSubmit={handleSalvarSetor}
        salvando={salvando}
      />

      {/* O NOSSO NOVO MODAL DE SUB-SETORES */}
      <SubSectorFormModal
        visible={modalSubsetorVisivel}
        onClose={() => {
          setModalSubsetorVisivel(false);
          setFormSubsetor({ id: null, nome: '', setorPaiId: '' });
        }}
        form={formSubsetor}
        setFormValue={(campo, valor) => setFormSubsetor({...formSubsetor, [campo]: valor})}
        setores={listaSetores} 
        onSubmit={handleSalvarSubsetor}
        salvando={salvandoSubsetor}
      />

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
        listaSubsetores={listaSubsetores} // <--- O SEGREDO ESTAVA AQUI! (adicione a palavra 'lista' no valor também)
      />

      <ProductDetailModal
        item={itemSelecionado}
        visible={Boolean(itemSelecionado)}
        baseUrl={BASE_URL}
        onClose={() => setItemSelecionado(null)}
        onExcluir={handleExcluirProduto}
        onMaryPatch={handleMaryPatch}
        listaSetores={listaSetores}
      />

      {/* MODAL DE MOVIMENTAÇÃO RÁPIDA */}
      <Modal
        visible={modalRapidoVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalRapidoVisivel(false)}
      >
        <View style={modernStyles.modalOverlay}>
          <View style={{ 
            width: '90%', 
            maxWidth: 440, 
            backgroundColor: '#FFFFFF', 
            borderRadius: 16, 
            borderWidth: 1, 
            borderColor: '#E2E8F0',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 6
          }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F1F5F9'
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>
                {tipoRapido === 'ENTRADA' ? 'Entrada Rápida' : 'Saída Rápida'}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalRapidoVisivel(false)} 
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#64748B', fontWeight: 'bold', fontSize: 13 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 24 }}>
              <Text style={{ color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                Produto Selecionado
              </Text>
              <View style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 }}>
                <Text style={{ color: '#475569', fontSize: 14, fontWeight: '500' }}>
                  {itemRapidoSelecionado?.nome}
                </Text>
              </View>

              <Text style={{ color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                Quantidade Real
              </Text>
              <TextInput
                style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: '#0F172A' }}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={quantidadeRapida}
                onChangeText={setQuantidadeRapida}
                autoFocus={true}
              />

              <TouchableOpacity
                onPress={confirmarMovimentacaoRapida}
                style={{ 
                  backgroundColor: tipoRapido === 'ENTRADA' ? '#0EA5E9' : '#EF4444', 
                  paddingVertical: 13, 
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 24,
                  shadowColor: '#0EA5E9',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {tipoRapido === 'ENTRADA' ? 'CONFIRMAR ENTRADA' : 'CONFIRMAR SAÍDA'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
