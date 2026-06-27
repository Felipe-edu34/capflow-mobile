import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

// --- ESTILOS ---
import modernStyles from '../components/manager/modernStyles';

// --- COMPONENTES DE ESTRUTURA (Visão Geral) ---
import ManagerHeader from '../components/manager/ManagerHeader';
import ManagerSidebar from '../components/manager/ManagerSidebar';
import DashboardFilters from '../components/manager/DashboardFilters';
import MetricCard from '../components/manager/MetricCard';
import ManagerCharts from '../components/manager/ManagerCharts';
import FuncionariosScreen from '../screens/FuncionariosScreen'; 

// --- COMPONENTES DE LISTAGEM ---
import InventorySection from '../components/manager/InventorySection';
import SectorList from '../components/manager/SectorList'; 
import MovementHistory from '../components/manager/MovementHistory';

// --- COMPONENTES DE MODAL (Formulários e Detalhes) ---
import ProductDetailModal from '../components/manager/ProductDetailModal';
import SectorFormModal from '../components/manager/SectorFormModal';
import SubSectorFormModal from '../components/manager/SubSectorFormModal';
import ProductFormModal from '../components/manager/ProductFormModal';
import QuickMovementModal from '../components/manager/QuickMovementModal';
import CriticalAlertsModal from '../components/manager/CriticalAlertsModal';

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

const initialSubsetorForm = {
  id: null,
  nome: '',
  setorPaiId: '',
};

function getSetorKey(item) {
  return String(item.setor || item.setor_id || item.setor_nome || 'sem-setor');
}

// CORREÇÃO: Função agora retorna APENAS o Setor Principal
function getSetorNome(item, listaSubsetores = []) {
  let nomePai = item.setor_nome;
  if (!nomePai && (item.setor || item.setor_id)) {
    nomePai = `Setor ${item.setor || item.setor_id}`;
  }
  if (!nomePai) nomePai = 'Sem setor definido';

  // Ignoramos a lógica antiga de colocar a setinha (➔) 
  // Retornamos direto o nome do Setor Pai!
  return nomePai;
}

export default function ManagerDashboard({ perfil, token, handleLogout }) {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [itens, setItens] = useState([]);
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [listaSetores, setListaSetores] = useState([]);
  const [listaSubsetores, setListaSubsetores] = useState([]);
  const [modalSubsetorVisivel, setModalSubsetorVisivel] = useState(false);
  const [salvandoSubsetor, setSalvandoSubsetor] = useState(false);
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

  const setores = useMemo(() => {
    const mapa = new Map();
    itens.forEach(item => {
      const key = getSetorKey(item);
      const nome = getSetorNome(item, listaSubsetores);
      if (!mapa.has(key)) mapa.set(key, { key, nome });
    });
    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [itens, listaSubsetores]);

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
      const nome = getSetorNome(item, listaSubsetores);
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
  }, [itens, busca, ordenacao, setorSelecionado, listaSubsetores]);

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

    const subSetorSelecionado = listaSubsetores.find(sub => String(sub.id) === String(formProduto.setorId));
    const setorPrincipalSelecionado = listaSetores.find(setor => String(setor.id) === String(formProduto.setorId));

    if (subSetorSelecionado) {
      const paiId = subSetorSelecionado.setor_pai || subSetorSelecionado.setorPaiId || subSetorSelecionado.setor_id;
      formData.append('setor', paiId);
      formData.append('subsetor', subSetorSelecionado.id);
    } else if (setorPrincipalSelecionado) {
      formData.append('setor', setorPrincipalSelecionado.id);
    }

    if (imagem) formData.append('imagem', imagem);

    try {
      // 1. Salva o produto
      const response = await axios.post(`${API_URL}/itens/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const novoProduto = response.data; // Pega os dados do produto recém-criado

      // 2. Cria a movimentação de ENTRADA automaticamente (se a qtd for maior que 0)
      if (Number(formProduto.quantidade) > 0) {
        await axios.post(`${API_URL}/movimentacoes/`, {
          item: novoProduto.id, // Usa o ID do produto que acabou de ser criado
          tipo: 'ENTRADA',
          quantidade: Number(formProduto.quantidade),
          observacao: 'NOVO PRODUTO CADASTRADO', // Alterado aqui!
        }, {
          headers: { Authorization: `Token ${token}` },
        });
      }

      alert('Produto cadastrado com sucesso!');
      setFormProduto(initialProductForm);
      setImagem(null);
      setModalProdutoVisivel(false);
      carregarItens();
      carregarMovimentacoes(); // Isso vai atualizar a tela de histórico na mesma hora!
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
        await axios.patch(`${API_URL}/setores/${formSetor.id}/`, payload, {
          headers: { Authorization: `Token ${token}` },
        });
        alert('Setor atualizado com sucesso!');
      } else {
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
        await axios.patch(`${API_URL}/subsetores/${formSubsetor.id}/`, payload, {
          headers: { Authorization: `Token ${token}` },
        });
        alert('Sub-setor atualizado!');
      } else {
        await axios.post(`${API_URL}/subsetores/`, payload, {
          headers: { Authorization: `Token ${token}` },
        });
        alert('Sub-setor criado com sucesso!');
      }
      setFormSubsetor(initialSubsetorForm);
      setModalSubsetorVisivel(false);
      carregarSubsetores();
      carregarItens();
    } catch (error) {
      alert('Erro ao salvar sub-setor.');
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
      alert('Erro ao excluir o setor.');
    }
  };

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
      alert('Erro ao excluir the produto.');
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
      alert('Erro ao salvar movimentação.');
    }
  };

  return (
  <SafeAreaView style={modernStyles.container}>
    
    {/* 1. COMPONENTE HEADER */}
    <ManagerHeader 
      listaItensCriticos={listaItensCriticos} 
      onAbrirAlertas={() => setModalAlertasVisivel(true)} 
    />

    <View style={{ flex: 1, flexDirection: 'row' }}>
      
      {/* 2. COMPONENTE SIDEBAR */}
      <ManagerSidebar 
        sidebarAberta={sidebarAberta}
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        perfil={perfil}
        handleLogout={handleLogout}
      />

      {/* ÁREA CENTRAL */}
      <View style={{ flex: 1, flexDirection: 'column' }}>
        
        {/* Barra de Título */}
        <View style={modernStyles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => setSidebarAberta(!sidebarAberta)} style={modernStyles.toggleButton}>
              <Text style={modernStyles.toggleButtonText}>{sidebarAberta ? '✕' : '☰'}</Text>
            </TouchableOpacity>
            <Text style={modernStyles.pageHeading}>
              Painel Geral / {
                abaAtiva === 'dashboard' ? 'Visão Geral' : 
                abaAtiva === 'produtos' ? 'Inventário' :
                abaAtiva === 'setores' ? 'Setores' :
                abaAtiva === 'movimentacoes' ? 'Movimentações' :
                abaAtiva === 'funcionarios' ? 'Equipe' : abaAtiva
              }
            </Text>
          </View>
          <View style={modernStyles.badgeStatus}>
            <Text style={modernStyles.badgeStatusText}>Gestor Ativo</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={modernStyles.scrollContent}>
          
          {/* 3. COMPONENTE DE FILTROS (Só aparece no Dashboard) */}
          {abaAtiva === 'dashboard' && (
            <DashboardFilters 
              setores={setores}
              setorSelecionado={setorSelecionado}
              setSetorSelecionado={setSetorSelecionado}
              listaItensCriticos={listaItensCriticos}
              onAbrirAlertas={() => setModalAlertasVisivel(true)}
            />
          )}

          {/* GRIDS DE MÉTRICAS (Só aparece no Dashboard) */}
          {abaAtiva === 'dashboard' && (
            <View style={[modernStyles.metricsGrid, { marginBottom: 24 }]}>
              <MetricCard label="Produtos" value={indicadores.totalItens} hint="itens encontrados" />
              <MetricCard
                label="Críticos"
                value={indicadores.itensCriticos}
                hint="abaixo do mínimo"
                danger={indicadores.itensCriticos > 0}
              />
              <MetricCard label="Setores" value={indicadores.setores} hint="areas envolvidas" />
              <MetricCard label="Volume" value={indicadores.volume} hint="unidades registradas" />
            </View>
          )}

          {/* RENDERIZAÇÃO CONDICIONAL DAS ABAS */}
          <View style={{ width: '100%', marginTop: 8 }}>
            
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
              <SectorList 
                setores={listaSetores} 
                subsetores={listaSubsetores} 
                itens={itens} 
                onNovoSetor={() => {
                  setFormSetor(initialSectorForm);
                  setModalSetorVisivel(true);
                }}
                onEditarSetor={abrirModalEdicaoSetor}
                onExcluirSetor={handleExcluirSetor}
                onNovoSubsetor={() => {
                  setFormSubsetor({ id: null, nome: '', setorPaiId: '' }); 
                  setModalSubsetorVisivel(true);
                }}
                onEditarSubsetor={abrirModalEdicaoSubsetor}
                onExcluirSubsetor={handleExcluirSubsetor}
              />
            )}

            {abaAtiva === 'movimentacoes' && (
              <MovementHistory movimentacoes={movimentacoes} itens={itens} />
            )}

            {/* 👥 CORREÇÃO: Injetado o FuncionariosScreen mapeado ao id 'funcionarios' */}
            {abaAtiva === 'funcionarios' && (
              <FuncionariosScreen token={token} />
            )}

          </View>
        </ScrollView>
      </View>
    </View>

    {/* COMPONENTES DE MODAIS AQUI */}

    <CriticalAlertsModal
      visible={modalAlertasVisivel}
      onClose={() => setModalAlertasVisivel(false)}
      itensCriticos={listaItensCriticos}
      getSetorNome={getSetorNome}
      listaSubsetores={listaSubsetores}
    />
    
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
      listaSubsetores={listaSubsetores}
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

    <QuickMovementModal
      visible={modalRapidoVisivel}
      onClose={() => setModalRapidoVisivel(false)}
      tipoRapido={tipoRapido}
      itemSelecionado={itemRapidoSelecionado}
      quantidadeRapida={quantidadeRapida}
      onQuantidadeChange={setQuantidadeRapida}
      onConfirmar={confirmarMovimentacaoRapida}
    />

  </SafeAreaView>
)};