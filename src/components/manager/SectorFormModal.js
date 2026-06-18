import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import modernStyles from './modernStyles';

export default function SectorFormModal({
  visible,
  onClose,
  form,
  setFormValue,
  onSubmit,
  salvando
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
            <Text style={modernStyles.modalTitle}>Novo Setor</Text>
            <TouchableOpacity onPress={onClose} style={modernStyles.modalCloseBtn}>
              <Text style={modernStyles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={modernStyles.modalBody}>
            <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>
              Crie áreas operacionais para agrupar e organizar seus estoques.
            </Text>

            <View style={modernStyles.inputGroup}>
              <Text style={modernStyles.label}>Nome do setor</Text>
              <TextInput
                style={modernStyles.formInput}
                placeholder="Ex: Almoxarifado Central"
                placeholderTextColor="#94A3B8"
                value={form.nome}
                onChangeText={(text) => setFormValue('nome', text)}
              />
            </View>

            <View style={modernStyles.inputGroup}>
              <Text style={modernStyles.label}>ID do Responsável (Opcional)</Text>
              <TextInput
                style={modernStyles.formInput}
                placeholder="Ex: 12"
                placeholderTextColor="#94A3B8"
                value={form.responsavelId}
                onChangeText={(text) => setFormValue('responsavelId', text)}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[modernStyles.primaryButton, salvando && modernStyles.btnSubmitLoading]}
              onPress={onSubmit}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={modernStyles.primaryButtonText}>Criar Setor</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}