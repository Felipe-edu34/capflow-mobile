import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from './modernStyles';
import InventoryFilters from './inventory/InventoryFilters';
import InventoryGroupList from './inventory/InventoryGroupList';

export default function InventorySection({
  grupos = [],
  setores = [],
  setorSelecionado,
  onSelecionarSetor,
  busca,            
  onBuscaChange,     
  loading,
  totalItens,
  baseUrl,
  onOpenItem,
  ordenacao, 
  onOrdenacaoChange,
  onNovoProduto,
  onMovimentacaoRapida
}) {
  const gruposVisiveis =
    setorSelecionado === 'todos' ? grupos : grupos.filter((grupo) => grupo.key === setorSelecionado);

  return (
    <View style={styles.listPanel}>
      {/* CABEÇALHO DO PAINEL */}
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>Inventário</Text>
          <Text style={styles.sectionTitle}>Produtos por setor</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            style={{
              backgroundColor: '#0EA5E9',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
              shadowColor: '#0EA5E9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4
            }}
            onPress={onNovoProduto}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Novo Produto</Text>
          </TouchableOpacity>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{totalItens} itens</Text>
          </View>
        </View>
      </View>

      {/* FILTROS: BUSCA, ORDENAÇÃO E TABS DE SETOR */}
      <InventoryFilters
        busca={busca}
        onBuscaChange={onBuscaChange}
        ordenacao={ordenacao}
        onOrdenacaoChange={onOrdenacaoChange}
        setores={setores}
        setorSelecionado={setorSelecionado}
        onSelecionarSetor={onSelecionarSetor}
      />

      {/* LISTA DE PRODUTOS AGRUPADOS */}
      <InventoryGroupList
        gruposVisiveis={gruposVisiveis}
        loading={loading}
        totalItens={totalItens}
        baseUrl={baseUrl}
        onOpenItem={onOpenItem}
        onMovimentacaoRapida={onMovimentacaoRapida}
      />
    </View>
  );
}