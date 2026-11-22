import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
      {
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        flexWrap: 'wrap',
        gap: 10,
      }
    ]}>
      <View style={[modernStyles.productLeft, { flex: 1, minWidth: 140, gap: 10 }]}>
        <View style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: '#E2E8F0',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Feather name="corner-down-right" size={14} color="#475569" />
        </View>
        <View style={modernStyles.productInfo}>
          <Text style={[modernStyles.productName, { fontSize: 14 }]}>{sub.nome}</Text>
          <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>Subdivisão operacional</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {/* Pill horizontal de quantidade de produtos neste sub-setor */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#E2E8F0',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          marginRight: 4,
        }}>
          <Feather name="box" size={12} color="#475569" />
          <Text style={{ color: '#1E293B', fontSize: 12, fontWeight: '800' }}>{totalProdutos}</Text>
          <Text style={{ color: '#475569', fontSize: 11, fontWeight: '700' }}>
            {totalProdutos === 1 ? 'PRODUTO' : 'PRODUTOS'}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => onEditar(sub)} 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingVertical: 6,
            paddingHorizontal: 10,
            backgroundColor: '#F0FDF4',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#BBF7D0',
          }}
          activeOpacity={0.75}
        >
          <Feather name="edit-2" size={11} color="#16A34A" />
          <Text style={{ color: '#16A34A', fontWeight: '700', fontSize: 11 }}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => onExcluir(sub.id)} 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingVertical: 6,
            paddingHorizontal: 10,
            backgroundColor: '#FEF2F2',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#FECACA',
          }}
          activeOpacity={0.75}
        >
          <Feather name="trash-2" size={11} color="#DC2626" />
          <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 11 }}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
