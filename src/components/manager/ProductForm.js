import React from 'react';
import { ActivityIndicator, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './managerStyles';

export default function ProductForm({
  form,
  setFormValue,
  imagem,
  onSelecionarImagem,
  onSubmit,
  salvando,
}) {
  return (
    <View style={styles.formPanel}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>Cadastro</Text>
        <Text style={styles.sectionTitle}>Novo produto</Text>
        <Text style={styles.sectionSubtitle}>Inclua dados padronizados para manter o estoque auditável.</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nome do produto"
        placeholderTextColor="#8A97A8"
        value={form.nome}
        onChangeText={(value) => setFormValue('nome', value)}
      />

      <View style={styles.formRow}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Quantidade"
          placeholderTextColor="#8A97A8"
          keyboardType="numeric"
          value={form.quantidade}
          onChangeText={(value) => setFormValue('quantidade', value)}
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Unidade"
          placeholderTextColor="#8A97A8"
          value={form.unidade}
          onChangeText={(value) => setFormValue('unidade', value)}
        />
      </View>

      <View style={styles.formRow}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="Estoque mínimo"
          placeholderTextColor="#8A97A8"
          keyboardType="numeric"
          value={form.minimo}
          onChangeText={(value) => setFormValue('minimo', value)}
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          placeholder="ID do setor"
          placeholderTextColor="#8A97A8"
          keyboardType="numeric"
          value={form.setorId}
          onChangeText={(value) => setFormValue('setorId', value)}
        />
      </View>

      <View style={styles.uploadBox}>
        <Text style={styles.uploadTitle}>Imagem do produto</Text>
        <Text style={styles.uploadText}>
          {imagem ? imagem.name : 'Anexe uma foto para facilitar identificação visual.'}
        </Text>
        {Platform.OS === 'web' && (
          <input
            type="file"
            accept="image/*"
            onChange={onSelecionarImagem}
            style={{
              color: '#475569',
              fontSize: 13,
              marginTop: 12,
              width: '100%',
            }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={onSubmit} disabled={salvando}>
        {salvando ? <ActivityIndicator color="#06111F" /> : <Text style={styles.btnSalvarText}>Salvar no estoque</Text>}
      </TouchableOpacity>
    </View>
  );
}
