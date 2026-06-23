import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import modernStyles from './modernStyles';

export default function SubSectorFormModal({
  visible,
  onClose,
  form,
  setFormValue,
  onSubmit,
  salvando,
  setores
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modernStyles.modalOverlay}>
        <View style={[modernStyles.modalContainer, { maxWidth: 450, width: '100%' }]}>
          
          <View style={modernStyles.modalHeader}>
            <Text style={modernStyles.modalTitle}>{form.id ? 'Editar' : 'Novo'} Sub-setor</Text>
            <TouchableOpacity onPress={onClose} style={modernStyles.modalCloseBtn}>
              <Text style={modernStyles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={modernStyles.modalBody}>
            <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>
              Crie subdivisões dentro dos seus setores principais.
            </Text>

            <View style={modernStyles.inputGroup}>
              <Text style={modernStyles.label}>Nome do Sub-setor</Text>
              <TextInput
                style={modernStyles.formInput}
                placeholder="Ex: Prateleira A, Freezer 2..."
                placeholderTextColor="#94A3B8"
                value={form.nome}
                onChangeText={(text) => setFormValue('nome', text)}
              />
            </View>

            <View style={modernStyles.inputGroup}>
              <Text style={modernStyles.label}>Pertence ao Setor:</Text>
              <View style={{
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: 8, 
                marginTop: 8 
              }}>
                {setores.map((setor) => (
                  <TouchableOpacity
                    key={setor.id}
                    // AQUI: Alterado de 'setor_pai' para 'setorPaiId'
                    onPress={() => setFormValue('setorPaiId', setor.id)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 6,
                      borderWidth: 1,
                      // AQUI: Lógica visual ajustada para 'setorPaiId'
                      borderColor: form.setorPaiId === setor.id ? '#10B981' : '#E2E8F0',
                      backgroundColor: form.setorPaiId === setor.id ? '#ECFDF5' : '#FFFFFF',
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      // AQUI: Lógica visual ajustada para 'setorPaiId'
                      fontWeight: form.setorPaiId === setor.id ? '600' : '400',
                      color: form.setorPaiId === setor.id ? '#047857' : '#475569'
                    }}>
                      {setor.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                modernStyles.primaryButton, 
                { backgroundColor: '#10B981', marginTop: 12 },
                salvando && modernStyles.btnSubmitLoading
              ]}
              onPress={onSubmit}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={modernStyles.primaryButtonText}>Salvar Sub-setor</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}