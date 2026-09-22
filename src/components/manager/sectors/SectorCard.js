import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import modernStyles from '../modernStyles';
import SubsectorItem from './SubsectorItem';

export default function SectorCard({
  setor,
  subsetores = [],
  itens = [],
  onEditarSetor,
  onExcluirSetor,
  onEditarSubsetor,
  onExcluirSubsetor,
}) {
  const subsetoresDoSetor = subsetores.filter(
    (sub) => String(sub.setor_pai) === String(setor.id)
  );

  return (
    <View style={{ marginBottom: 20 }}>
      {/* 1. CARTÃO DO SETOR PAI */}
      <View style={[modernStyles.productCard, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, flexWrap: 'wrap', gap: 8 }]}>
        <View style={[modernStyles.productLeft, { flex: 1, minWidth: 150 }]}>
          <View style={modernStyles.productInfo}>
            <Text style={modernStyles.productName}>📁 {setor.nome}</Text>
            <Text style={modernStyles.productMeta}>
              Responsável: {setor.responsavel ? `ID Funcional: ${setor.responsavel}` : 'Nenhum responsável atribuído'}
            </Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity 
            onPress={() => onEditarSetor(setor)} 
            style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F0F9FF', borderRadius: 6, borderWidth: 1, borderColor: '#BAE6FD' }}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#0284C7', fontWeight: '600', fontSize: 12 }}>Editar Setor</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => onExcluirSetor(setor.id)} 
            style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#FEF2F2', borderRadius: 6, borderWidth: 1, borderColor: '#FECACA' }}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 12 }}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. LISTA DE SUB-SETORES ANINHADOS */}
      {subsetoresDoSetor.length > 0 && (
        <View style={{ 
          marginLeft: 24, 
          borderLeftWidth: 2, 
          borderLeftColor: '#CBD5E1', 
          paddingLeft: 16, 
          marginTop: 8 
        }}>
          {subsetoresDoSetor.map((sub) => {
            const produtosDoSub = itens.filter(
              (i) => String(i.subsetor) === String(sub.id)
            );

            return (
              <SubsectorItem
                key={sub.id}
                sub={sub}
                totalProdutos={produtosDoSub.length}
                onEditar={onEditarSubsetor}
                onExcluir={onExcluirSubsetor}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
