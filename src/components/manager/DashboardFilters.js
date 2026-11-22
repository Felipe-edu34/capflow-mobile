import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function DashboardFilters({ 
  setores, 
  setorSelecionado, 
  setSetorSelecionado, 
  listaItensCriticos, 
  onAbrirAlertas 
}) {
  return (
    <View>
      {/* Barra de Filtros Inteligentes por Setor */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Feather name="filter" size={12} color="#64748B" />
          <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Filtro Analítico por Área
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
          <TouchableOpacity
            onPress={() => setSetorSelecionado('todos')}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: setorSelecionado === 'todos' ? '#0F172A' : '#FFFFFF',
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: setorSelecionado === 'todos' ? '#0F172A' : '#E2E8F0',
            }}
          >
            <Feather name="globe" size={13} color={setorSelecionado === 'todos' ? '#38BDF8' : '#64748B'} />
            <Text style={{ color: setorSelecionado === 'todos' ? '#FFF' : '#475569', fontWeight: '700', fontSize: 13 }}>
              Visão Global
            </Text>
          </TouchableOpacity>
          
          {setores.map(setor => {
            const ativo = setorSelecionado === setor.key;
            return (
              <TouchableOpacity
                key={setor.key}
                onPress={() => setSetorSelecionado(setor.key)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: ativo ? '#0EA5E9' : '#FFFFFF',
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: ativo ? '#0EA5E9' : '#E2E8F0',
                }}
              >
                <Feather name="folder" size={13} color={ativo ? '#FFFFFF' : '#64748B'} />
                <Text style={{ color: ativo ? '#FFF' : '#475569', fontWeight: '700', fontSize: 13 }}>
                  {setor.nome}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Alerta de Ruptura na Tela Principal */}
      {listaItensCriticos.length > 0 && (
        <View style={{
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="alert-triangle" size={20} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#991B1B', fontWeight: '800', fontSize: 14, marginBottom: 2 }}>
                Ruptura Iminente de Estoque
              </Text>
              <Text style={{ color: '#7F1D1D', fontSize: 13 }}>
                Há {listaItensCriticos.length} produtos operando abaixo do limite mínimo {setorSelecionado !== 'todos' ? 'neste setor' : 'configurado'}.
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={onAbrirAlertas}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#EF4444',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>Ver Itens</Text>
            <Feather name="arrow-right" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}