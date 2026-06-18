import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import modernStyles from './modernStyles'; 

export default function SectorForm({ form, setFormValue, onSubmit, salvando }) {
  return (
    <View style={modernStyles.formCard}>
      <Text style={modernStyles.formEyebrow}>Configuração</Text>
      <Text style={modernStyles.formTitle}>Novo Setor</Text>
      <Text style={modernStyles.formDescription}>
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
  );
}