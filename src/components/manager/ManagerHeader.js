import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import modernStyles from './modernStyles';

export default function ManagerHeader({ listaItensCriticos = [], onAbrirAlertas }) {
  return (
    <View style={modernStyles.header}>
      <View style={modernStyles.headerBrand}>
        <View style={[modernStyles.brandMark, { shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }]}>
          <Feather name="layers" size={20} color="#FFFFFF" />
        </View>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={modernStyles.headerTitle}>CapFlow</Text>
            <View style={{ backgroundColor: 'rgba(14, 165, 233, 0.18)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' }}>
              <Text style={{ color: '#38BDF8', fontSize: 9, fontWeight: '900', letterSpacing: 0.6 }}>CONTROL TOWER</Text>
            </View>
          </View>
          <Text style={modernStyles.headerSubtitle}>Plataforma Corporativa de Operações</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {listaItensCriticos.length > 0 && (
          <TouchableOpacity 
            onPress={onAbrirAlertas}
            activeOpacity={0.8}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderColor: 'rgba(248, 113, 113, 0.4)',
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Feather name="alert-triangle" size={13} color="#F87171" />
            <Text style={{ color: '#FCA5A5', fontSize: 12, fontWeight: '800' }}>
              {listaItensCriticos.length} {listaItensCriticos.length === 1 ? 'Alerta' : 'Alertas'}
            </Text>
          </TouchableOpacity>
        )}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          borderWidth: 1,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
        }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' }} />
          <Text style={{ color: '#E2E8F0', fontSize: 11, fontWeight: '700' }}>Painel Corporativo</Text>
        </View>
      </View>
    </View>
  );
}