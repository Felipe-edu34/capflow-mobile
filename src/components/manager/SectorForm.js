import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './managerStyles'; // Reutilizando seus estilos

export default function SectorForm({
  form,
  setFormValue,
  onSubmit,
  salvando,
}) {
  return (
    <View style={styles.formPanel}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>Configuração</Text>
        <Text style={styles.sectionTitle}>Novo Setor</Text>
        <Text style={styles.sectionSubtitle}>Crie áreas operacionais para agrupar e organizar seus estoques.</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nome do setor (ex: Almoxarifado)"
        placeholderTextColor="#8A97A8"
        value={form.nome}
        onChangeText={(value) => setFormValue('nome', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="ID do funcionário responsável (opcional)"
        placeholderTextColor="#8A97A8"
        keyboardType="numeric"
        value={form.responsavelId}
        onChangeText={(value) => setFormValue('responsavelId', value)}
      />

      <TouchableOpacity 
        style={[styles.btnSalvar, { marginTop: 10 }]} 
        onPress={onSubmit} 
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#06111F" />
        ) : (
          <Text style={styles.btnSalvarText}>Criar Setor</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}