import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

import InventorySection from '../components/manager/InventorySection';
import MetricCard from '../components/manager/MetricCard';
import ProductDetailModal from '../components/manager/ProductDetailModal';
import ProductForm from '../components/manager/ProductForm';
import styles from '../components/manager/managerStyles';

const API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

const initialForm = {
  nome: '',
  quantidade: '',
  unidade: 'UN',
  minimo: '',
  setorId: '',
};

function getSetorKey(item) {
  return String(item.setor || item.setor_id || item.setor_nome || 'sem-setor');
}

function getSetorNome(item) {
  if (item.setor_nome) {
    return item.setor_nome;
  }

  if (item.setor || item.setor_id) {
    return `Setor ${item.setor || item.setor_id}`;
  }

  return 'Sem setor definido';
}

export default function ManagerDashboard({ perfil, token, handleLogout }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [imagem, setImagem] = useState(null);
  const [setorSelecionado, setSetorSelecionado] = useState('todos');
  const [itemSelecionado, setItemSelecionado] = useState(null);

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

  const { indicadores, gruposPorSetor, setores } = useMemo(() => {
    const mapaSetores = new Map();
    let volume = 0;
    let itensCriticos = 0;

    itens.forEach((item) => {
      const key = getSetorKey(item);
      const nome = getSetorNome(item);
      const estoqueBaixo = Number(item.quantidade_atual) <= Number(item.estoque_minimo);

      volume += Number(item.quantidade_atual || 0);
      if (estoqueBaixo) {
        itensCriticos += 1;
      }

      if (!mapaSetores.has(key)) {
        mapaSetores.set(key, { key, nome, itens: [], criticos: 0 });
      }

      const grupo = mapaSetores.get(key);
      grupo.itens.push(item);
      if (estoqueBaixo) {
        grupo.criticos += 1;
      }
    });

    const grupos = Array.from(mapaSetores.values()).sort((a, b) => a.nome.localeCompare(b.nome));

    return {
      indicadores: {
        totalItens: itens.length,
        itensCriticos,
        setores: grupos.length,
        volume,
      },
      gruposPorSetor: grupos,
      setores: grupos.map(({ key, nome }) => ({ key, nome })),
    };
  }, [itens]);

  const setFormValue = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSelecionarImagem = (event) => {
    const arquivo = event.target.files[0];
    if (arquivo) {
      setImagem(arquivo);
    }
  };

  const handleCadastrarProduto = async () => {
    if (!form.nome || !form.quantidade || !form.minimo || !form.setorId) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setSalvando(true);

    const formData = new FormData();
    formData.append('nome', form.nome);
    formData.append('quantidade_atual', form.quantidade);
    formData.append('unidade_medida', form.unidade);
    formData.append('estoque_minimo', form.minimo);
    formData.append('setor', form.setorId);

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
      setForm(initialForm);
      setImagem(null);
      carregarItens();
    } catch (error) {
      console.log('Erro ao cadastrar:', error.response?.data || error.message);
      alert('Erro ao salvar o produto.');
    } finally {
      setSalvando(false);
    }
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
              Consulte itens por setor, abra a ficha completa de cada produto e monitore níveis críticos com leitura executiva.
            </Text>
          </View>

          <View style={styles.heroConsole}>
            <Text style={styles.consoleLabel}>API STATUS</Text>
            <Text style={styles.consoleValue}>ONLINE</Text>
            <Text style={styles.consoleHint}>Agrupamento por setor calculado no app com os dados atuais da API</Text>
          </View>
        </View>

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

        <View style={styles.workspace}>
          <ProductForm
            form={form}
            setFormValue={setFormValue}
            imagem={imagem}
            onSelecionarImagem={handleSelecionarImagem}
            onSubmit={handleCadastrarProduto}
            salvando={salvando}
          />

          <InventorySection
            grupos={gruposPorSetor}
            setores={setores}
            setorSelecionado={setorSelecionado}
            onSelecionarSetor={setSetorSelecionado}
            loading={loading}
            totalItens={itens.length}
            baseUrl={BASE_URL}
            onOpenItem={setItemSelecionado}
          />
        </View>
      </ScrollView>

      <ProductDetailModal
        item={itemSelecionado}
        visible={Boolean(itemSelecionado)}
        baseUrl={BASE_URL}
        onClose={() => setItemSelecionado(null)}
      />
    </SafeAreaView>
  );
}
