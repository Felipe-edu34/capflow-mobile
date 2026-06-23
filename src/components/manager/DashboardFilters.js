import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

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
        <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
          Filtro Analítico
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
          <TouchableOpacity
            onPress={() => setSetorSelecionado('todos')}
            style={{
              backgroundColor: setorSelecionado === 'todos' ? '#0F172A' : '#FFFFFF',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: setorSelecionado === 'todos' ? '#0F172A' : '#E2E8F0',
            }}
          >
            <Text style={{ color: setorSelecionado === 'todos' ? '#FFF' : '#475569', fontWeight: '600', fontSize: 13 }}>
              Visão Global
            </Text>
          </TouchableOpacity>
          
          {setores.map(setor => (
            <TouchableOpacity
              key={setor.key}
              onPress={() => setSetorSelecionado(setor.key)}
              style={{
                backgroundColor: setorSelecionado === setor.key ? '#0EA5E9' : '#FFFFFF',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: setorSelecionado === setor.key ? '#0EA5E9' : '#E2E8F0',
              }}
            >
              <Text style={{ color: setorSelecionado === setor.key ? '#FFF' : '#475569', fontWeight: '600', fontSize: 13 }}>
                {setor.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Alerta de Ruptura na Tela Principal */}
      {listaItensCriticos.length > 0 && (
        <View style={{ backgroundColor: '#FEF2F2', borderColor: '#FEE2E2', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={{ color: '#991B1B', fontWeight: '700', fontSize: 14, marginBottom: 2 }}>
              Ruptura Iminente de Estoque
            </Text>
            <Text style={{ color: '#7F1D1D', fontSize: 13, opacity: 0.9 }}>
              Há {listaItensCriticos.length} produtos operando abaixo do limite mínimo {setorSelecionado !== 'todos' ? 'neste setor' : 'configurado'}.
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onAbrirAlertas}
            style={{ backgroundColor: '#EF4444', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 }}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Ver Itens</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}