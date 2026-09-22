import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import modernStyles from '../modernStyles';

export default function SubsectorItem({
  sub,
  totalProdutos = 0,
  onEditar,
  onExcluir,
}) {
  return (
    <View style={[
      modernStyles.productCard, 
      { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, marginTop: 8, backgroundColor: '#F8FAFC', flexWrap: 'wrap', gap: 8 }
    ]}>
      <View style={[modernStyles.productLeft, { flex: 1, minWidth: 130 }]}>
        <View style={modernStyles.productInfo}>
          <Text style={[modernStyles.productName, { fontSize: 14 }]}>↳ {sub.nome}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {/* Quantidade de produtos neste sub-setor */}
        <View style={[modernStyles.productStock, { marginRight: 4, backgroundColor: '#E2E8F0' }]}>
          <Text style={[modernStyles.stockQty, { color: '#475569' }]}>{totalProdutos}</Text>
          <Text style={[modernStyles.stockUnit, { color: '#64748B' }]}>PRODUTOS</Text>
        </View>

        <TouchableOpacity 
          onPress={() => onEditar(sub)} 
          style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#F0FDF4', borderRadius: 6, borderWidth: 1, borderColor: '#BBF7D0' }}
          activeOpacity={0.7}
        >
          <Text style={{ color: '#16A34A', fontWeight: '600', fontSize: 11 }}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => onExcluir(sub.id)} 
          style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#FEF2F2', borderRadius: 6, borderWidth: 1, borderColor: '#FECACA' }}
          activeOpacity={0.7}
        >
          <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 11 }}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
