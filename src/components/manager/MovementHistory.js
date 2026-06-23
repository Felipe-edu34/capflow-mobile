import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';

export default function MovementHistory({ movimentacoes, itens = [] }) {
  
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
    
    // Se a quantidade for 0 e NÃO for a criação de um novo produto, nós apagamos da lista.
    if (qtd === 0 && !ehNovoProduto) {
      return false; 
    }
    return true;
  });

  // 3. Filtro Anti-Duplicatas normal (com a lista já limpa dos zeros)
  const movimentacoesUnicas = movimentacoesUteis.filter((mov, index, self) =>
    index === self.findIndex((t) => {
      if (t.id && mov.id) {
        return t.id === mov.id;
      }
      return t.item === mov.item && getQuantidade(t) === getQuantidade(mov) && formatarData(t) === formatarData(mov);
    })
  );

  // 4. Função que junta Nome + Setor + Subsetor
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

  // 5. Função para definir o Tipo de Movimentação
  const getTipoMovimentacao = (mov) => {
    if (mov.observacao === 'NOVO PRODUTO CADASTRADO') return 'NOVO PRODUTO CADASTRADO';
    if (mov.tipo === 'SAIDA') return 'SAIDA';
    
    return 'ENTRADA';
  };

  // 6. Relatório CSV
  const gerarRelatorioCSV = () => {
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

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio_movimentacoes.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Para baixar no celular nativo, é necessário configurar uma biblioteca de arquivos.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827' }}>Histórico de Movimentações</Text>
        
        <TouchableOpacity 
          onPress={gerarRelatorioCSV}
          style={{ backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>📄 Exportar Relatório</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {movimentacoesUnicas.map((mov, index) => {
          const tipoTexto = getTipoMovimentacao(mov);
          const dataMovimentacao = formatarData(mov);
          const quantidadeExata = getQuantidade(mov);
          
          let corSinal = '#10b981'; // Verde padrão
          let sinal = '+';
          if (tipoTexto === 'SAIDA') {
            corSinal = '#ef4444'; // Vermelho
            sinal = '-';
          } else if (tipoTexto === 'NOVO PRODUTO CADASTRADO') {
            corSinal = '#3b82f6'; // Azul
          }
          
          return (
            <View 
              key={mov.id || index} 
              style={{ 
                backgroundColor: '#fff', 
                padding: 16, 
                marginBottom: 12, 
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#e5e7eb'
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#374151' }}>
                  {getProdutoDetalhado(mov)}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {dataMovimentacao}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end', minWidth: 100 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: corSinal }}>
                  {sinal}{quantidadeExata}
                </Text>
                <Text style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 2, fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {tipoTexto}
                </Text>
              </View>
            </View>
          );
        })}

        {movimentacoesUnicas.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 40 }}>
            Nenhuma movimentação registrada ainda.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}