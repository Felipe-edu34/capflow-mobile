import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import modernStyles from './modernStyles';

export default function SectorFormModal({
  visible,
  onClose,
  form,
  setFormValue,
  onSubmit,
  salvando,
  funcionarios = [] // 👈 1. Nova prop: Recebe a lista de funcionários do Dashboard
}) {

  // 🛠️ 2. Função mágica que marca/desmarca o checklist
  const toggleFuncionario = (id) => {
    // Garante que sempre seja um array
    const selecionados = form.responsaveisIds || [];
    
    if (selecionados.includes(id)) {
      // Se já está marcado, tira da lista (desmarca)
      setFormValue('responsaveisIds', selecionados.filter(item => item !== id));
    } else {
      // Se não está, adiciona na lista (marca)
      setFormValue('responsaveisIds', [...selecionados, id]);
    }
  };

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
            <Text style={modernStyles.modalTitle}>{form.id ? 'Editar Setor' : 'Novo Setor'}</Text>
            <TouchableOpacity onPress={onClose} style={modernStyles.modalCloseBtn}>
              <Text style={modernStyles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modernStyles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>
              Crie áreas operacionais e atribua responsáveis.
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

            {/* 🛠️ 3. O NOVO CHECKLIST DE FUNCIONÁRIOS */}
            <View style={modernStyles.inputGroup}>
              <Text style={modernStyles.label}>Responsáveis (Opcional)</Text>
              
              <View style={{ 
                maxHeight: 180, // Limita a altura para não quebrar a tela se tiver muita gente
                borderWidth: 1, 
                borderColor: '#E2E8F0', 
                borderRadius: 8,
                backgroundColor: '#F8FAFC',
                overflow: 'hidden'
              }}>
                <ScrollView nestedScrollEnabled={true}>
                  {funcionarios.length === 0 ? (
                    <Text style={{ padding: 12, color: '#94A3B8', textAlign: 'center' }}>
                      Nenhum funcionário encontrado.
                    </Text>
                  ) : (
                    funcionarios.map((func) => {
                      // Verifica se o ID deste funcionário está dentro do nosso array de selecionados
                      const isSelected = (form.responsaveisIds || []).includes(func.id);
                      
                      return (
                        <TouchableOpacity
                          key={func.id}
                          onPress={() => toggleFuncionario(func.id)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: '#F1F5F9',
                            backgroundColor: isSelected ? '#EFF6FF' : 'transparent' // Fundo azulzinho se selecionado
                          }}
                        >
                          {/* O Quadrado do Checkbox */}
                          <View style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: isSelected ? '#3B82F6' : '#CBD5E1',
                            backgroundColor: isSelected ? '#3B82F6' : 'transparent',
                            marginRight: 12,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {isSelected && <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                          </View>
                          
                          {/* Nome (usando username ou nome, dependendo de como o backend envia) */}
                          <Text style={{ 
                            color: isSelected ? '#1E293B' : '#64748B',
                            fontWeight: isSelected ? '600' : '400'
                          }}>
                            {func.username || func.nome}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={[modernStyles.primaryButton, salvando && modernStyles.btnSubmitLoading, { marginTop: 10 }]}
              onPress={onSubmit}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={modernStyles.primaryButtonText}>{form.id ? 'Salvar Alterações' : 'Criar Setor'}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}