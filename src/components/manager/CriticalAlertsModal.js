import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function CriticalAlertsModal({
  visible,
  onClose,
  itensCriticos,
  getSetorNome,
  listaSubsetores
}) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', padding: 24 }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18 }}>⚠️</Text>
              </View>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>Atenção Necessária</Text>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Estoque mínimo atingido</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#64748B' }}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {itensCriticos.map(item => (
              <View key={item.id} style={{ padding: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#FEE2E2', borderRadius: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B', flex: 1 }}>{item.nome}</Text>
                  <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#EF4444' }}>
                      {item.quantidade_atual} / {item.estoque_minimo}
                    </Text>
                  </View>
                </View>
                
                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>
                  📍 {getSetorNome(item, listaSubsetores)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity 
            onPress={onClose}
            style={{ backgroundColor: '#0F172A', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 }}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Ciente, fechar alertas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}