import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import modernStyles from './modernStyles';
import SectorCard from './sectors/SectorCard';

export default function SectorList({ 
  setores = [], 
  subsetores = [],
  itens = [], 
  onNovoSetor, 
  onEditarSetor, 
  onExcluirSetor,
  onNovoSubsetor,
  onEditarSubsetor,
  onExcluirSubsetor
}) {
  return (
    <View style={modernStyles.listPanel}>
      {/* CABEÇALHO DO PAINEL */}
      <View style={modernStyles.listHeader}>
        <View>
          <Text style={modernStyles.sectionEyebrow}>Mapeamento Operacional</Text>
          <Text style={modernStyles.sectionTitle}>Setores e Sub-setores</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={modernStyles.countBadge}>
            <Text style={modernStyles.countBadgeText}>{setores.length} Setores</Text>
          </View>
          
          <TouchableOpacity
            style={{ backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
            onPress={onNovoSubsetor}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Novo Sub-setor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ backgroundColor: '#0EA5E9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
            onPress={onNovoSetor}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Novo Setor</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTAGEM DE SETORES */}
      <ScrollView style={{ maxHeight: 600 }} showsVerticalScrollIndicator={false}>
        {setores.length === 0 ? (
          <View style={modernStyles.emptyState}>
            <Text style={modernStyles.emptyTitle}>Nenhum setor cadastrado</Text>
            <Text style={modernStyles.emptyText}>Clique em "+ Novo Setor" para começar a estruturar seu armazém.</Text>
          </View>
        ) : (
          setores.map((setor) => (
            <SectorCard
              key={setor.id}
              setor={setor}
              subsetores={subsetores}
              itens={itens}
              onEditarSetor={onEditarSetor}
              onExcluirSetor={onExcluirSetor}
              onEditarSubsetor={onEditarSubsetor}
              onExcluirSubsetor={onExcluirSubsetor}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}