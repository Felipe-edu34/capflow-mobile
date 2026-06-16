import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';

export default function ManagerDashboard({ perfil, token, handleLogout }) {
  const API_URL = 'http://127.0.0.1:8000/api';
  const BASE_URL = 'http://127.0.0.1:8000';

  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('UN');
  const [minimo, setMinimo] = useState('');
  const [setorId, setSetorId] = useState('');
  const [imagem, setImagem] = useState(null);

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

  useEffect(() => {
    carregarItens();
  }, []);

  const indicadores = useMemo(() => {
    const itensCriticos = itens.filter((item) => Number(item.quantidade_atual) <= Number(item.estoque_minimo));
    const setores = new Set(itens.map((item) => item.setor_nome || item.setor).filter(Boolean));
    const volume = itens.reduce((total, item) => total + Number(item.quantidade_atual || 0), 0);

    return {
      totalItens: itens.length,
      itensCriticos: itensCriticos.length,
      setores: setores.size,
      volume,
    };
  }, [itens]);

  const handleSelecionarImagem = (event) => {
    const arquivo = event.target.files[0];
    if (arquivo) {
      setImagem(arquivo);
    }
  };

  const handleCadastrarProduto = async () => {
    if (!nome || !quantidade || !minimo || !setorId) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setSalvando(true);

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('quantidade_atual', quantidade);
    formData.append('unidade_medida', unidade);
    formData.append('estoque_minimo', minimo);
    formData.append('setor', setorId);

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
      setNome('');
      setQuantidade('');
      setUnidade('UN');
      setMinimo('');
      setSetorId('');
      setImagem(null);
      carregarItens();
    } catch (error) {
      console.log('Erro ao cadastrar:', error.response?.data || error.message);
      alert('Erro ao salvar o produto.');
    } finally {
      setSalvando(false);
    }
  };

  const renderProduto = ({ item }) => {
    const estoqueBaixo = Number(item.quantidade_atual) <= Number(item.estoque_minimo);
    const imageUri = item.imagem?.startsWith('http') ? item.imagem : `${BASE_URL}${item.imagem}`;

    return (
      <View style={[styles.productCard, estoqueBaixo && styles.productCardAlert]}>
        <View style={styles.productLeft}>
          <View style={styles.imageContainer}>
            {item.imagem ? (
              <Image source={{ uri: imageUri }} style={styles.productImage} />
            ) : (
              <View style={styles.noImagePlaceholder}>
                <Text style={styles.noImageText}>IMG</Text>
              </View>
            )}
          </View>

          <View style={styles.productInfo}>
            <View style={styles.productTitleRow}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.nome}
              </Text>
              {estoqueBaixo && (
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>Crítico</Text>
                </View>
              )}
            </View>
            <Text style={styles.productMeta} numberOfLines={1}>
              Setor {item.setor_nome || item.setor} | Mínimo {item.estoque_minimo} {item.unidade_medida}
            </Text>
          </View>
        </View>

        <View style={styles.productStock}>
          <Text style={styles.stockQty}>{item.quantidade_atual}</Text>
          <Text style={styles.stockUnit}>{item.unidade_medida}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Dados conectados</Text>
            </View>
            <Text style={styles.heroTitle}>Painel administrativo de estoque</Text>
            <Text style={styles.heroText}>
              Cadastre produtos, monitore níveis críticos e mantenha a operação com leitura clara para tomada de decisão.
            </Text>
          </View>

          <View style={styles.heroConsole}>
            <Text style={styles.consoleLabel}>API STATUS</Text>
            <Text style={styles.consoleValue}>ONLINE</Text>
            <Text style={styles.consoleHint}>Token autenticado e catálogo sincronizado</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Produtos</Text>
            <Text style={styles.metricValue}>{indicadores.totalItens}</Text>
            <Text style={styles.metricHint}>itens no catálogo</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Críticos</Text>
            <Text style={[styles.metricValue, indicadores.itensCriticos > 0 && styles.metricDanger]}>
              {indicadores.itensCriticos}
            </Text>
            <Text style={styles.metricHint}>abaixo do mínimo</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Setores</Text>
            <Text style={styles.metricValue}>{indicadores.setores}</Text>
            <Text style={styles.metricHint}>áreas mapeadas</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Volume</Text>
            <Text style={styles.metricValue}>{indicadores.volume}</Text>
            <Text style={styles.metricHint}>unidades registradas</Text>
          </View>
        </View>

        <View style={styles.workspace}>
          <View style={styles.formPanel}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>Cadastro</Text>
              <Text style={styles.sectionTitle}>Novo produto</Text>
              <Text style={styles.sectionSubtitle}>Inclua dados padronizados para manter o estoque auditável.</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome do produto"
              placeholderTextColor="#8A97A8"
              value={nome}
              onChangeText={setNome}
            />
            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Quantidade"
                placeholderTextColor="#8A97A8"
                keyboardType="numeric"
                value={quantidade}
                onChangeText={setQuantidade}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Unidade"
                placeholderTextColor="#8A97A8"
                value={unidade}
                onChangeText={setUnidade}
              />
            </View>
            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Estoque mínimo"
                placeholderTextColor="#8A97A8"
                keyboardType="numeric"
                value={minimo}
                onChangeText={setMinimo}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="ID do setor"
                placeholderTextColor="#8A97A8"
                keyboardType="numeric"
                value={setorId}
                onChangeText={setSetorId}
              />
            </View>

            <View style={styles.uploadBox}>
              <Text style={styles.uploadTitle}>Imagem do produto</Text>
              <Text style={styles.uploadText}>{imagem ? imagem.name : 'Anexe uma foto para facilitar identificação visual.'}</Text>
              {Platform.OS === 'web' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelecionarImagem}
                  style={{
                    color: '#475569',
                    fontSize: 13,
                    marginTop: 12,
                    width: '100%',
                  }}
                />
              )}
            </View>

            <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrarProduto} disabled={salvando}>
              {salvando ? <ActivityIndicator color="#06111F" /> : <Text style={styles.btnSalvarText}>Salvar no estoque</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.listPanel}>
            <View style={styles.listHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>Inventário</Text>
                <Text style={styles.sectionTitle}>Produtos cadastrados</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{itens.length} itens</Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color="#0F766E" />
                <Text style={styles.loadingText}>Carregando inventário...</Text>
              </View>
            ) : itens.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nenhum produto cadastrado</Text>
                <Text style={styles.emptyText}>Assim que novos itens forem salvos, eles aparecerão neste painel.</Text>
              </View>
            ) : (
              <FlatList
                data={itens}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProduto}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF3F8' },
  header: {
    backgroundColor: '#07111F',
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#5EEAD4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { color: '#07111F', fontWeight: '900', fontSize: 14 },
  brandCopy: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#9FB0C3', marginTop: 2 },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutText: { color: '#FCA5A5', fontWeight: '900', fontSize: 13 },
  scrollContent: { padding: 22, gap: 18 },
  hero: {
    backgroundColor: '#07111F',
    borderRadius: 8,
    padding: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 18,
  },
  heroCopy: { flex: 1, minWidth: 260 },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(94, 234, 212, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.26)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
  },
  statusDot: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#5EEAD4' },
  statusText: { color: '#A7F3D0', fontSize: 12, fontWeight: '900' },
  heroTitle: { color: '#FFFFFF', fontSize: 30, lineHeight: 36, fontWeight: '900', maxWidth: 620 },
  heroText: { color: '#B6C4D5', fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 650 },
  heroConsole: {
    minWidth: 230,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    padding: 18,
    justifyContent: 'center',
  },
  consoleLabel: { color: '#8EA4BC', fontSize: 11, fontWeight: '900' },
  consoleValue: { color: '#5EEAD4', fontSize: 28, fontWeight: '900', marginTop: 8 },
  consoleHint: { color: '#B6C4D5', fontSize: 12, lineHeight: 18, marginTop: 6 },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metricCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DDE5EF',
  },
  metricLabel: { color: '#64748B', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  metricValue: { color: '#0F172A', fontSize: 28, fontWeight: '900', marginTop: 8 },
  metricDanger: { color: '#DC2626' },
  metricHint: { color: '#7C8DA0', fontSize: 12, marginTop: 5, fontWeight: '700' },
  workspace: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    alignItems: 'flex-start',
  },
  formPanel: {
    flex: 1,
    minWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDE5EF',
  },
  listPanel: {
    flex: 2,
    minWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDE5EF',
  },
  sectionHeader: { marginBottom: 16 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  sectionEyebrow: { color: '#0F766E', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  sectionTitle: { color: '#0F172A', fontSize: 20, fontWeight: '900', marginTop: 4 },
  sectionSubtitle: { color: '#64748B', fontSize: 13, lineHeight: 19, marginTop: 6 },
  countBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  countBadgeText: { color: '#166534', fontSize: 12, fontWeight: '900' },
  formRow: { flexDirection: 'row', gap: 10 },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    paddingHorizontal: 13,
    paddingVertical: 13,
    marginBottom: 12,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  inputHalf: { flex: 1 },
  uploadBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    padding: 14,
    marginBottom: 14,
  },
  uploadTitle: { color: '#0F172A', fontSize: 13, fontWeight: '900' },
  uploadText: { color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: 5 },
  btnSalvar: {
    backgroundColor: '#5EEAD4',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSalvarText: { color: '#06111F', fontSize: 14, fontWeight: '900' },
  loadingState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 54 },
  loadingText: { color: '#64748B', fontSize: 13, fontWeight: '800', marginTop: 12 },
  emptyState: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: { color: '#0F172A', fontSize: 16, fontWeight: '900' },
  emptyText: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 6 },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5EBF2',
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCardAlert: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF7F7',
  },
  productLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  imageContainer: {
    width: 54,
    height: 54,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E8EEF6',
  },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  noImagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  noImageText: { color: '#7C8DA0', fontSize: 11, fontWeight: '900' },
  productInfo: { flex: 1 },
  productTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productName: { color: '#0F172A', fontSize: 15, fontWeight: '900', flex: 1 },
  productMeta: { color: '#64748B', fontSize: 12, marginTop: 6, fontWeight: '700' },
  alertBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  alertBadgeText: { color: '#B91C1C', fontSize: 11, fontWeight: '900' },
  productStock: { alignItems: 'flex-end', minWidth: 74 },
  stockQty: { color: '#0F172A', fontSize: 22, fontWeight: '900' },
  stockUnit: { color: '#64748B', fontSize: 11, fontWeight: '900', marginTop: 2 },
});
