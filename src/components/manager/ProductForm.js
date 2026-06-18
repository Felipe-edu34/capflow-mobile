import React, { useState } from 'react';
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
  // Estado local para rastrear quais campos o usuário esqueceu de preencher ao tentar salvar
  const [erros, setErros] = useState({});

  // Rótulos consistentes sobre o fundo branco
  const Label = ({ children }) => (
    <Text style={{ color: '#1E293B', fontSize: 13, fontWeight: '700', marginBottom: 4, marginTop: 12 }}>
      {children}
    </Text>
  );

  // Validador local antes de disparar a função de salvar do Dashboard
  const validarEEnviar = () => {
    const novosErros = {};

    if (!form.nome?.trim()) novosErros.nome = 'O nome do produto é obrigatório';
    if (!form.quantidade?.toString().trim()) novosErros.quantidade = 'Defina a quantidade inicial';
    if (!form.minimo?.toString().trim()) novosErros.minimo = 'Defina o estoque mínimo de segurança';
    if (!form.setorId) novosErros.setorId = 'Selecione o setor responsável';

    setErros(novosErros);

    // Se não houver nenhum erro mapeado, libera o envio dos dados para a API
    if (Object.keys(novosErros).length === 0) {
      onSubmit();
    }
  };

  return (
    <View style={styles.formPanel}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>ESTOQUE</Text>
        <Text style={styles.sectionTitle}>Registrar Item</Text>
      </View>

      {/* CAMPO: NOME DO PRODUTO */}
      <Label>Nome do produto</Label>
      <TextInput
        style={[
          styles.input, 
          { marginBottom: 4, backgroundColor: '#F8FAFC', color: '#0F172A' },
          erros.nome ? { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: '#FEF2F2' } : { borderColor: '#CBD5E1' }
        ]}
        placeholder="Ex: Teclado Mecânico RGB"
        placeholderTextColor="#94A3B8"
        value={form.nome}
        onChangeText={(val) => {
          setFormValue('nome', val);
          if (erros.nome) setErros(prev => ({ ...prev, nome: null })); // Limpa o erro ao digitar
        }}
      />
      {erros.nome && <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600', marginTop: 2 }}>{erros.nome}</Text>}

      {/* CAMPO DUPLO: QUANTIDADE E UNIDADE */}
      <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
        <View style={{ flex: 2 }}>
          <Label>Quantidade atual</Label>
          <TextInput
            style={[
              styles.input, 
              { marginBottom: 4, backgroundColor: '#F8FAFC', color: '#0F172A' },
              erros.quantidade ? { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: '#FEF2F2' } : { borderColor: '#CBD5E1' }
            ]}
            placeholder="0"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={form.quantidade}
            onChangeText={(val) => {
              setFormValue('quantidade', val);
              if (erros.quantidade) setErros(prev => ({ ...prev, quantidade: null }));
            }}
          />
          {erros.quantidade && <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600', marginTop: 2 }}>{erros.quantidade}</Text>}
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

      {/* CAMPO: ESTOQUE MÍNIMO */}
      <Label>Estoque mínimo de segurança</Label>
      <TextInput
        style={[
          styles.input, 
          { marginBottom: 4, backgroundColor: '#F8FAFC', color: '#0F172A' },
          erros.minimo ? { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: '#FEF2F2' } : { borderColor: '#CBD5E1' }
        ]}
        placeholder="Ex: 5"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={form.minimo}
        onChangeText={(val) => {
          setFormValue('minimo', val);
          if (erros.minimo) setErros(prev => ({ ...prev, minimo: null }));
        }}
      />
      {erros.minimo && <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600', marginTop: 2 }}>{erros.minimo}</Text>}

      {/* CAMPO: SELETOR DE SETOR */}
      <Label>Setor de destino</Label>
      <select
        style={{
          width: '100%',
          backgroundColor: form.setorId ? '#F8FAFC' : '#FFFFFF',
          color: '#0F172A',
          borderWidth: 1,
          borderColor: erros.setorId ? '#EF4444' : '#CBD5E1',
          borderRadius: 8,
          paddingHorizontal: 12,
          height: 45,
          fontSize: 14,
          outline: 'none',
          marginBottom: 4,
          boxShadow: erros.setorId ? '0 0 0 1px #EF4444' : 'none',
          transition: 'all 0.2s ease'
        }}
        value={form.setorId}
        onChange={(e) => {
          setFormValue('setorId', e.target.value);
          if (erros.setorId) setErros(prev => ({ ...prev, setorId: null }));
        }}
      >
        <option value="">Selecione um setor...</option>
        {listaSetores.map((setor) => (
          <option key={setor.id} value={setor.id}>
            {setor.nome}
          </option>
        ))}
      </select>
      {erros.setorId && <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600', marginTop: 4, display: 'block' }}>{erros.setorId}</Text>}

      {/* CAMPO: IMAGEM */}
      <Label>Imagem do produto (Opcional)</Label>
      <input 
        type="file" 
        accept="image/*" 
        onChange={onSelecionarImagem}
        style={{ color: '#475569', fontSize: 13, marginTop: 4, marginBottom: 16, cursor: 'pointer' }}
      />

      {/* BOTÃO DE SUBMIT INTERATIVO */}
      <TouchableOpacity 
        style={[
          styles.btnSalvar, 
          { marginTop: 8 },
          salvando && { backgroundColor: '#94A3B8', opacity: 0.7 } // Muda de cor e desativa visualmente se estiver salvando
        ]} 
        onPress={validarEEnviar}
        disabled={salvando}
      >
        {salvando ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator color="#06111F" size="small" />
            <Text style={[styles.btnSalvarText, { color: '#06111F' }]}>Processando...</Text>
          </View>
        ) : (
          <Text style={styles.btnSalvarText}>Salvar no estoque</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}