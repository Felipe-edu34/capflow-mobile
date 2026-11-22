import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import modernStyles from './modernStyles';
import SectorCard from './sectors/SectorCard';

export default function SectorList({ 
  setores = [], 
  subsetores = [],
  itens = [], 
  funcionarios = [],
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
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <View style={[modernStyles.countBadge, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
            <Feather name="grid" size={12} color="#475569" />
            <Text style={modernStyles.countBadgeText}>{setores.length} Setores</Text>
          </View>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#10B981',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.18,
              shadowRadius: 6,
              elevation: 3,
            }}
            onPress={onNovoSubsetor}
            activeOpacity={0.8}
          >
            <Feather name="git-branch" size={14} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Novo Sub-setor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#0EA5E9',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
              shadowColor: '#0EA5E9',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.18,
              shadowRadius: 6,
              elevation: 3,
            }}
            onPress={onNovoSetor}
            activeOpacity={0.8}
          >
            <Feather name="folder-plus" size={14} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Novo Setor</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTAGEM DE SETORES */}
      <ScrollView style={{ maxHeight: 620 }} showsVerticalScrollIndicator={false}>
        {setores.length === 0 ? (
          <View style={modernStyles.emptyState}>
            <Feather name="folder" size={32} color="#94A3B8" style={{ marginBottom: 10 }} />
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
              funcionarios={funcionarios}
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