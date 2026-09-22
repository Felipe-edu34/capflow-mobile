import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import styles from '../modernStyles';
import ProductCard from './ProductCard';

export default function InventoryGroupList({
  gruposVisiveis = [],
  loading,
  totalItens,
  baseUrl,
  onOpenItem,
  onMovimentacaoRapida,
}) {
  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={styles.loadingText}>Carregando inventário...</Text>
      </View>
    );
  }

  if (totalItens === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nenhum produto cadastrado</Text>
        <Text style={styles.emptyText}>Assim que novos itens forem salvos, eles aparecerão neste painel.</Text>
      </View>
    );
  }

  return (
    <View>
      {gruposVisiveis.map((grupo) => (
        <View key={grupo.key} style={styles.sectorBlock}>
          {/* CABEÇALHO DO GRUPO/SETOR */}
          <View style={styles.sectorHeader}>
            <View>
              <Text style={styles.sectorTitle}>{grupo.nome}</Text>
              <Text style={styles.sectorMeta}>{grupo.itens.length} produtos neste setor</Text>
            </View>
            {grupo.criticos > 0 && <Text style={styles.sectorCritical}>{grupo.criticos} críticos</Text>}
          </View>

          {/* LISTA DE CARDS DE PRODUTO */}
          {grupo.itens.map((item) => (
            <ProductCard 
              key={item.id} 
              item={item} 
              baseUrl={baseUrl} 
              onPress={onOpenItem} 
              onMovimentacaoRapida={onMovimentacaoRapida}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
