import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MovementCard from './movements/MovementCard';
import { exportarArquivoCsv } from '../../utils/csvExporter';

export default function MovementHistory({ movimentacoes = [], itens = [] }) {
  
  // 1. Funções de formatação
  const formatarData = (mov) => {
    const dataRaw = mov.criado_em || mov.created_at || mov.data_movimentacao || mov.data_hora || mov.data || mov.timestamp;
    if (!dataRaw) return 'Data não encontrada';
    
    const dateObj = new Date(dataRaw);
    if (isNaN(dateObj.getTime())) return 'Data inválida'; 
    return dateObj.toLocaleString('pt-BR');
  };

  const getQuantidade = (mov) => {
    const val = mov.quantidade ?? mov.quantidade_movimentada ?? mov.qtd ?? mov.valor ?? 0;
    const numeroFinal = Number(val);
    return isNaN(numeroFinal) ? 0 : Math.abs(numeroFinal);
  };

  // 2. Filtro Anti-Fantasmas (Remove os "0" que o banco duplica)
  const movimentacoesUteis = movimentacoes.filter(mov => {
    const qtd = getQuantidade(mov);
    const ehNovoProduto = mov.observacao === 'NOVO PRODUTO CADASTRADO';
    return !(qtd === 0 && !ehNovoProduto);
  });

  // 3. Filtro Anti-Duplicatas
  const movimentacoesUnicas = movimentacoesUteis.filter((mov, index, self) =>
    index === self.findIndex((t) => {
      if (t.id && mov.id) {
        return t.id === mov.id;
      }
      return t.item === mov.item && getQuantidade(t) === getQuantidade(mov) && formatarData(t) === formatarData(mov);
    })
  );

  // 4. Junta Nome + Setor + Subsetor
  const getProdutoDetalhado = (mov) => {
    const produto = itens.find(i => String(i.id) === String(mov.item));
    if (!produto) {
      return mov.item_nome || `Produto (ID: ${mov.item})`;
    }
    
    const setor = produto.setor_nome || produto.setor || '';
    const subsetor = produto.subsetor_nome || '';
    
    let local = '';
    if (setor && subsetor) local = `(${setor} ➔ ${subsetor})`;
    else if (setor) local = `(${setor})`;
    
    return `${produto.nome} ${local}`.trim();
  };

  // 5. Tipo de Movimentação
  const getTipoMovimentacao = (mov) => {
    if (mov.observacao === 'NOVO PRODUTO CADASTRADO') return 'NOVO PRODUTO CADASTRADO';
    if (mov.tipo === 'SAIDA') return 'SAIDA';
    return 'ENTRADA';
  };

  // 6. Relatório CSV via utilitário universal
  const gerarRelatorioCSV = async () => {
    if (!movimentacoesUnicas || movimentacoesUnicas.length === 0) {
      alert('Não há movimentações para gerar relatório.');
      return;
    }

    let csvContent = "Data e Hora,Produto,Tipo,Quantidade\n";
    movimentacoesUnicas.forEach(mov => {
      const dataFormatada = formatarData(mov);
      const nomeProduto = getProdutoDetalhado(mov);
      const tipo = getTipoMovimentacao(mov);
      const qtd = getQuantidade(mov);
      csvContent += `"${dataFormatada}","${nomeProduto}","${tipo}","${qtd}"\n`;
    });

    try {
      await exportarArquivoCsv(
        csvContent,
        'relatorio_movimentacoes.csv',
        'Exportar Relatório de Movimentações'
      );
    } catch (error) {
      alert('Não foi possível exportar o relatório.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* CABEÇALHO */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827' }}>Histórico de Movimentações</Text>
        
        <TouchableOpacity 
          onPress={gerarRelatorioCSV}
          style={{ backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>📄 Exportar Relatório</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE MOVIMENTAÇÕES */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {movimentacoesUnicas.map((mov, index) => (
          <MovementCard
            key={mov.id || index}
            produtoNome={getProdutoDetalhado(mov)}
            dataFormatada={formatarData(mov)}
            tipoTexto={getTipoMovimentacao(mov)}
            quantidade={getQuantidade(mov)}
          />
        ))}

        {movimentacoesUnicas.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 40 }}>
            Nenhuma movimentação registrada ainda.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}