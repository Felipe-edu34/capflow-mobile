import React, { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Platform, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

// --- ESTILOS ---
import modernStyles from '../components/manager/modernStyles';

// --- COMPONENTES DE ESTRUTURA ---
import ManagerHeader from '../components/manager/ManagerHeader';
import ManagerSidebar from '../components/manager/ManagerSidebar';

// --- COMPONENTES DE ABAS ---
import DashboardOverview from '../components/manager/dashboard/DashboardOverview';
import InventorySection from '../components/manager/InventorySection';
import SectorList from '../components/manager/SectorList'; 
import MovementHistory from '../components/manager/MovementHistory';
import FuncionariosScreen from '../screens/FuncionariosScreen'; 

// --- COMPONENTES DE MODAL ---
import ProductDetailModal from '../components/manager/ProductDetailModal';
import SectorFormModal from '../components/manager/SectorFormModal';
import SubSectorFormModal from '../components/manager/SubSectorFormModal';
import ProductFormModal from '../components/manager/ProductFormModal';
import QuickMovementModal from '../components/manager/QuickMovementModal';
import CriticalAlertsModal from '../components/manager/CriticalAlertsModal';

// --- CUSTOM HOOK DE DADOS ---
import useManagerData, { getSetorNome } from '../hooks/useManagerData';

const BASE_URL = 'http://localhost:8000';
const API_URL = 'http://localhost:8000/api';

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
  responsaveisIds: [],
};

const initialSubsetorForm = {
  id: null,
  nome: '',
  setorPaiId: '',
};

export default function ManagerDashboard({ perfil, token, handleLogout }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [sidebarAberta, setSidebarAberta] = useState(!isMobile);

  const handleSelectTab = (tab) => {
    setAbaAtiva(tab);
    if (isMobile) {
      setSidebarAberta(false);
    }
  };

  // Hook centralizado com dados, carregamentos e métricas
  const {
    itens,
    listaSetores,
    listaSubsetores,
    movimentacoes,
    listaFuncionarios,
    loading,
    setorSelecionado,
    setSetorSelecionado,
    busca,
    setBusca,
    ordenacao,
    setOrdenacao,
    setores,
    indicadores,
    gruposPorSetor,
    listaItensCriticos,
    itensFiltrados,
    carregarItens,
    carregarSetores,
    carregarSubsetores,
    carregarMovimentacoes,
  } = useManagerData(token);

  // Estados dos formulários de modal
  const [formProduto, setFormProduto] = useState(initialProductForm);
  const [formSetor, setFormSetor] = useState(initialSectorForm);
  const [formSubsetor, setFormSubsetor] = useState(initialSubsetorForm);
  const [imagem, setImagem] = useState(null);

  // Estados de controle dos modais
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [modalSetorVisivel, setModalSetorVisivel] = useState(false);
  const [modalSubsetorVisivel, setModalSubsetorVisivel] = useState(false);
  const [modalAlertasVisivel, setModalAlertasVisivel] = useState(false);
  const [alertaVisualizado, setAlertaVisualizado] = useState(false);
  const [modalRapidoVisivel, setModalRapidoVisivel] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [itemRapidoSelecionado, setItemRapidoSelecionado] = useState(null);
  const [tipoRapido, setTipoRapido] = useState('ENTRADA');
  const [quantidadeRapida, setQuantidadeRapida] = useState('');

  // Estados de loading de salvamento
  const [salvando, setSalvando] = useState(false);
  const [salvandoSubsetor, setSalvandoSubsetor] = useState(false);

  // Exibe alerta de ruptura na inicialização se houver itens críticos
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

  const handleSelecionarImagem = async (event) => {
    const arquivoWeb = event?.target?.files?.[0];
    if (arquivoWeb) {
      setImagem(arquivoWeb);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagem(result.assets[0]);
      }
    } catch (error) {
      console.log('Erro ao selecionar imagem:', error);
      alert('Não foi possível abrir a galeria.');
    }
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

    if (imagem) {
      if (Platform.OS === 'web' && typeof File !== 'undefined' && imagem instanceof File) {
        formData.append('imagem', imagem);
      } else if (imagem.uri) {
        const uriParts = imagem.uri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        formData.append('imagem', {
          uri: imagem.uri,
          name: imagem.fileName || `produto_${Date.now()}.${fileType}`,
          type: imagem.mimeType || `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      } else {
        formData.append('imagem', imagem);
      }
    }

    try {
      const response = await axios.post(`${API_URL}/itens/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const novoProduto = response.data;

      if (Number(formProduto.quantidade) > 0) {
        await axios.post(`${API_URL}/movimentacoes/`, {
          item: novoProduto.id,
          tipo: 'ENTRADA',
          quantidade: Number(formProduto.quantidade),
          observacao: 'NOVO PRODUTO CADASTRADO',
        }, {
          headers: { Authorization: `Token ${token}` },
        });
      }

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
    const payload = { 
      nome: formSetor.nome,
      responsaveis: formSetor.responsaveisIds || [] 
    };

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
      console.log("Erro ao salvar setor:", error.response?.data || error.message);
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

  const confirmarAcao = (mensagem, onConfirmar) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(mensagem)) {
        onConfirmar();
      }
    } else {
      Alert.alert(
        'Confirmar Exclusão',
        mensagem,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: onConfirmar },
        ],
        { cancelable: true }
      );
    }
  };

  const handleExcluirSubsetor = (idSubsetor) => {
    confirmarAcao('Deseja excluir este sub-setor?', async () => {
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
    });
  };

  const abrirModalEdicaoSetor = (setor) => {
    setFormSetor({
      id: setor.id,
      nome: setor.nome,
      responsaveisIds: setor.responsaveis || [],
    });
    setModalSetorVisivel(true);
  };

  const handleExcluirSetor = (idSetor) => {
    confirmarAcao('Deseja realmente excluir este setor? Atenção: Isso pode afetar os produtos vinculados a ele.', async () => {
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
    });
  };

  const abrirModalEdicaoSubsetor = (subsetor) => {
    setFormSubsetor({
      id: subsetor.id,
      nome: subsetor.nome,
      setorPaiId: subsetor.setor_pai || subsetor.setor_pai_id || '', 
    });
    setModalSubsetorVisivel(true);
  };

  const handleExcluirProduto = (idProduto) => {
    confirmarAcao('Deseja excluir permanentemente este produto?', async () => {
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
    });
  };

  const handleMaryPatch = async (idProduto, dadosAtualizados, novaImagem) => {
    try {
      const formData = new FormData();
      formData.append('nome', dadosAtualizados.nome);
      formData.append('quantidade_atual', dadosAtualizados.quantidade_atual);
      formData.append('unidade_medida', dadosAtualizados.unidade_medida);
      formData.append('estoque_minimo', dadosAtualizados.estoque_minimo);
      formData.append('setor', dadosAtualizados.setor);

      if (novaImagem) {
        if (Platform.OS === 'web' && typeof File !== 'undefined' && novaImagem instanceof File) {
          formData.append('imagem', novaImagem);
        } else if (novaImagem.uri) {
          const uriParts = novaImagem.uri.split('.');
          const fileType = uriParts[uriParts.length - 1] || 'jpg';
          formData.append('imagem', {
            uri: novaImagem.uri,
            name: novaImagem.fileName || `produto_${Date.now()}.${fileType}`,
            type: novaImagem.mimeType || `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
          });
        } else {
          formData.append('imagem', novaImagem);
        }
      }

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

    try {
      await axios.post(`${API_URL}/movimentacoes/`, {
        item: itemRapidoSelecionado.id,
        tipo: tipoRapido,
        quantidade: quantidadeNum,
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
      {/* 1. HEADER */}
      <ManagerHeader 
        listaItensCriticos={listaItensCriticos} 
        onAbrirAlertas={() => setModalAlertasVisivel(true)} 
      />

      {/* Backdrop de Fundo para Mobile quando Sidebar está aberta */}
      {isMobile && sidebarAberta && (
        <TouchableOpacity 
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            zIndex: 90,
          }}
          activeOpacity={1}
          onPress={() => setSidebarAberta(false)}
        />
      )}

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* 2. SIDEBAR */}
        <ManagerSidebar 
          sidebarAberta={sidebarAberta}
          abaAtiva={abaAtiva}
          setAbaAtiva={handleSelectTab}
          perfil={perfil}
          handleLogout={handleLogout}
          isMobile={isMobile}
          onCloseMobile={() => setSidebarAberta(false)}
        />

        {/* ÁREA CENTRAL */}
        <View style={{ flex: 1, flexDirection: 'column' }}>
          {/* Barra Superior */}
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
            <View style={{ width: '100%', marginTop: 8 }}>
              {/* ABA 1: DASHBOARD (VISÃO GERAL MODULAR) */}
              {abaAtiva === 'dashboard' && (
                <DashboardOverview
                  setores={setores}
                  setorSelecionado={setorSelecionado}
                  setSetorSelecionado={setSetorSelecionado}
                  listaItensCriticos={listaItensCriticos}
                  onAbrirAlertas={() => setModalAlertasVisivel(true)}
                  indicadores={indicadores}
                  gruposPorSetor={gruposPorSetor}
                  itensFiltrados={itensFiltrados}
                />
              )}

              {/* ABA 2: INVENTÁRIO */}
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

              {/* ABA 3: SETORES */}
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

              {/* ABA 4: MOVIMENTAÇÕES */}
              {abaAtiva === 'movimentacoes' && (
                <MovementHistory movimentacoes={movimentacoes} itens={itens} />
              )}

              {/* ABA 5: EQUIPE / FUNCIONÁRIOS */}
              {abaAtiva === 'funcionarios' && (
                <FuncionariosScreen token={token} />
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* MODAIS DO SISTEMA */}
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
        funcionarios={listaFuncionarios}
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
  );
}