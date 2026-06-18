import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import modernStyles from './modernStyles';

export default function SectorList({ setores, itens, onNovoSetor }) {
  return (
    <View style={modernStyles.listPanel}>
      <View style={modernStyles.listHeader}>
        <View>
          <Text style={modernStyles.sectionEyebrow}>Mapeamento Operacional</Text>
          <Text style={modernStyles.sectionTitle}>Setores Cadastrados</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={modernStyles.countBadge}>
            <Text style={modernStyles.countBadgeText}>{setores.length} Setores</Text>
          </View>
          
          {/* BOTÃO QUE ABRE O MODAL FLUTUANTE */}
          <TouchableOpacity
            style={{ backgroundColor: '#0EA5E9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
            onPress={onNovoSetor}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Novo Setor</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ maxHeight: 600 }} showsVerticalScrollIndicator={false}>
        {setores.length === 0 ? (
          <View style={modernStyles.emptyState}>
            <Text style={modernStyles.emptyTitle}>Nenhum setor cadastrado</Text>
            <Text style={modernStyles.emptyText}>Clique em "+ Novo Setor" para mapear a primeira área do seu armazém.</Text>
          </View>
        ) : (
          setores.map((setor) => {
            const produtosDoSetor = itens.filter(
              (i) => String(i.setor) === String(setor.id) || String(i.setor_id) === String(setor.id)
            );

            return (
              <View key={setor.id} style={[modernStyles.productCard, { alignItems: 'flex-start' }]}>
                <View style={modernStyles.productLeft}>
                  <View style={modernStyles.productInfo}>
                    <Text style={modernStyles.productName}>{setor.nome}</Text>
                    <Text style={modernStyles.productMeta}>
                      Responsável: {setor.responsavel ? `ID Funcional: ${setor.responsavel}` : 'Nenhum responsável atribuído'}
                    </Text>
                  </View>
                </View>
                <View style={modernStyles.productStock}>
                  <Text style={modernStyles.stockQty}>{produtosDoSetor.length}</Text>
                  <Text style={modernStyles.stockUnit}>PRODUTOS</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}