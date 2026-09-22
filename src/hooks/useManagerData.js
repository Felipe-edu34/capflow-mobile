import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export function getSetorKey(item) {
  return String(item.setor || item.setor_id || item.setor_nome || 'sem-setor');
}

export function getSetorNome(item, listaSubsetores = []) {
  let nomePai = item.setor_nome;
  if (!nomePai && (item.setor || item.setor_id)) {
    nomePai = `Setor ${item.setor || item.setor_id}`;
  }
  if (!nomePai) nomePai = 'Sem setor definido';
  return nomePai;
}

export default function useManagerData(token) {
  const [itens, setItens] = useState([]);
  const [listaSetores, setListaSetores] = useState([]);
  const [listaSubsetores, setListaSubsetores] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [listaFuncionarios, setListaFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de visualização
  const [setorSelecionado, setSetorSelecionado] = useState('todos');
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState('alfabetica');

  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Token ${token}` },
  }), [token]);

  const carregarFuncionariosCombo = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/funcionarios/`, authHeaders);
      setListaFuncionarios(response.data);
    } catch (error) {
      console.log('Erro ao buscar funcionários para o checklist:', error);
    }
  }, [token, authHeaders]);

  const carregarItens = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/itens/`, authHeaders);
      setItens(response.data);
    } catch (error) {
      console.log('Erro ao buscar itens:', error);
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  const carregarSetores = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/setores/`, authHeaders);
      setListaSetores(response.data);
    } catch (error) {
      console.log('Erro ao buscar setores:', error);
    }
  }, [token, authHeaders]);

  const carregarSubsetores = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/subsetores/`, authHeaders);
      setListaSubsetores(response.data);
    } catch (error) {
      console.log('Erro ao carregar sub-setores:', error);
    }
  }, [token, authHeaders]);

  const carregarMovimentacoes = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/movimentacoes/`, authHeaders);
      setMovimentacoes(response.data);
    } catch (error) {
      console.log('Erro ao buscar movimentações:', error);
    }
  }, [token, authHeaders]);

  const recarregarTudo = useCallback(() => {
    if (token) {
      carregarItens();
      carregarSetores();
      carregarMovimentacoes();
      carregarSubsetores();
      carregarFuncionariosCombo();
    }
  }, [token, carregarItens, carregarSetores, carregarMovimentacoes, carregarSubsetores, carregarFuncionariosCombo]);

  useEffect(() => {
    recarregarTudo();
  }, [recarregarTudo]);

  // Lista única de setores para tabs e dropdowns
  const setores = useMemo(() => {
    const mapa = new Map();
    itens.forEach(item => {
      const key = getSetorKey(item);
      const nome = getSetorNome(item, listaSubsetores);
      if (!mapa.has(key)) mapa.set(key, { key, nome });
    });
    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [itens, listaSubsetores]);

  // Indicadores e agrupamentos calculados
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

  return {
    itens,
    setItens,
    listaSetores,
    setListaSetores,
    listaSubsetores,
    setListaSubsetores,
    movimentacoes,
    setMovimentacoes,
    listaFuncionarios,
    setListaFuncionarios,
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
    carregarFuncionariosCombo,
    recarregarTudo,
    getSetorKey,
    getSetorNome,
  };
}
