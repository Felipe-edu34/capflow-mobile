import React from 'react';
import { View, Text, FlatList } from 'react-native';
import styles from './managerStyles';

export default function MovementHistory({ movimentacoes }) {
  return (
    <View style={styles.listPanel}>
      <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Histórico de Movimentações</Text>
      <FlatList
        data={movimentacoes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.productCard, { padding: 15, marginBottom: 8 }]}>
            <View>
              <Text style={styles.productName}>{item.item_nome || 'Produto'}</Text>
              <Text style={styles.productMeta}>{new Date(item.data_movimentacao).toLocaleString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: item.tipo === 'ENTRADA' ? '#10B981' : '#EF4444' 
              }}>
                {item.tipo === 'ENTRADA' ? '+' : '-'}{item.quantidade_movimentada}
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B' }}>{item.tipo}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma movimentação registrada até o momento.</Text>}
      />
    </View>
  );
}