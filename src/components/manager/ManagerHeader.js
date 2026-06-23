import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import modernStyles from './modernStyles';

export default function ManagerHeader({ listaItensCriticos, onAbrirAlertas }) {
  return (
    <View style={modernStyles.header}>
      <View style={modernStyles.headerBrand}>
        <View style={modernStyles.brandMark}>
          <Text style={modernStyles.brandMarkText}>CF</Text>
        </View>
        <View>
          <Text style={modernStyles.headerTitle}>CapFlow</Text>
          <Text style={modernStyles.headerSubtitle}>Control Tower</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {listaItensCriticos.length > 0 && (
          <TouchableOpacity 
            onPress={onAbrirAlertas}
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' }} />
            <Text style={{ color: '#991B1B', fontSize: 12, fontWeight: '700' }}>
              {listaItensCriticos.length} Alertas
            </Text>
          </TouchableOpacity>
        )}
        <View style={modernStyles.badgeStatus}>
          <Text style={modernStyles.badgeStatusText}>Painel Corporativo</Text>
        </View>
      </View>
    </View>
  );
}