import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './managerStyles';

export default function ProductForm({
  form,
  setFormValue,
  imagem,
  onSelecionarImagem,
  onSubmit,
  salvando,
  listaSetores = []
}) {
  
  // Rótulos escuros para aparecerem perfeitamente sobre o fundo branco do card!
  const Label = ({ children }) => (
    <Text style={{ color: '#1E293B', fontSize: 13, fontWeight: '700', marginBottom: 4, marginTop: 12 }}>
      {children}
    </Text>
  );

  return (
    <View style={styles.formPanel}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>ESTOQUE</Text>
        <Text style={styles.sectionTitle}>Registrar Item</Text>
      </View>

      <Label>Nome do produto</Label>
      <TextInput
        style={[styles.input, { marginBottom: 4, backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }]}
        value={form.nome}
        onChangeText={(val) => setFormValue('nome', val)}
      />

      <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
        <View style={{ flex: 2 }}>
          <Label>Quantidade atual</Label>
          <TextInput
            style={[styles.input, { marginBottom: 4, backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }]}
            keyboardType="numeric"
            value={form.quantidade}
            onChangeText={(val) => setFormValue('quantidade', val)}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <Label>Unidade</Label>
          <TextInput
            style={[styles.input, { marginBottom: 4, backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }]}
            value={form.unidade}
            onChangeText={(val) => setFormValue('unidade', val)}
          />
        </View>
      </View>

      <Label>Estoque mínimo de segurança</Label>
      <TextInput
        style={[styles.input, { marginBottom: 4, backgroundColor: '#F8FAFC', color: '#0F172A', borderColor: '#CBD5E1' }]}
        keyboardType="numeric"
        value={form.minimo}
        onChangeText={(val) => setFormValue('minimo', val)}
      />

      <Label>Setor de destino</Label>
      <select
        style={{
          width: '100%',
          backgroundColor: '#F8FAFC',
          color: '#0F172A',
          borderWidth: 1,
          borderColor: '#CBD5E1',
          borderRadius: 8,
          paddingHorizontal: 12,
          height: 45,
          fontSize: 14,
          outline: 'none',
          marginBottom: 4
        }}
        value={form.setorId}
        onChange={(e) => setFormValue('setorId', e.target.value)}
      >
        <option value="">Selecione um setor...</option>
        {listaSetores.map((setor) => (
          <option key={setor.id} value={setor.id}>
            {setor.nome}
          </option>
        ))}
      </select>

      <Label>Imagem do produto (Opcional)</Label>
      <input 
        type="file" 
        accept="image/*" 
        onChange={onSelecionarImagem}
        style={{ color: '#475569', fontSize: 13, marginTop: 4, marginBottom: 16 }}
      />

      <TouchableOpacity 
        style={[styles.btnSalvar, { marginTop: 8 }]} 
        onPress={onSubmit}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#06111F" />
        ) : (
          <Text style={styles.btnSalvarText}>Salvar no estoque</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}