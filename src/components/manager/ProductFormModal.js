import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Picker } from 'react-native';
import modernStyles from './modernStyles';

export default function ProductFormModal({
  visible,
  onClose,
  form,
  setFormValue,
  imagem,
  onSelecionarImagem,
  onSubmit,
  salvando,
  listaSetores = [],
}) {
  const [erros, setErros] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const validarEEnviar = () => {
    const novosErros = {};

    if (!form.nome?.trim()) novosErros.nome = 'O nome do produto é obrigatório';
    if (!form.quantidade?.toString().trim()) novosErros.quantidade = 'Defina a quantidade inicial';
    if (!form.minimo?.toString().trim()) novosErros.minimo = 'Defina o estoque mínimo de segurança';
    if (!form.setorId) novosErros.setorId = 'Selecione o setor responsável';

    setErros(novosErros);

    if (Object.keys(novosErros).length === 0) {
      onSubmit();
    }
  };

  const handleInputChange = (field, value) => {
    setFormValue(field, value);
    if (erros[field]) setErros(prev => ({ ...prev, [field]: null }));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modernStyles.modalOverlay}>
        <ScrollView style={modernStyles.modalContainer}>
          {/* HEADER */}
          <View style={modernStyles.modalHeader}>
            <Text style={modernStyles.modalTitle}>Novo Produto</Text>
            <TouchableOpacity
              style={modernStyles.modalCloseBtn}
              onPress={onClose}
              disabled={salvando}
            >
              <Text style={modernStyles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* BODY */}
          <View style={modernStyles.modalBody}>
            {/* NOME */}
            <Text style={modernStyles.formLabel}>Nome do Produto</Text>
            <TextInput
              style={[
                modernStyles.formInput,
                focusedField === 'nome' && modernStyles.formInputFocus,
                erros.nome && modernStyles.formInputError,
              ]}
              placeholder="Ex: Teclado Mecânico RGB"
              placeholderTextColor="rgba(224, 242, 254, 0.4)"
              value={form.nome}
              onChangeText={(val) => handleInputChange('nome', val)}
              onFocus={() => setFocusedField('nome')}
              onBlur={() => setFocusedField(null)}
              editable={!salvando}
            />
            {erros.nome && <Text style={modernStyles.formError}>{erros.nome}</Text>}

            {/* QUANTIDADE E UNIDADE */}
            <View style={modernStyles.inputRow}>
              <View style={modernStyles.inputColumn}>
                <Text style={modernStyles.formLabel}>Quantidade Atual</Text>
                <TextInput
                  style={[
                    modernStyles.formInput,
                    focusedField === 'quantidade' && modernStyles.formInputFocus,
                    erros.quantidade && modernStyles.formInputError,
                  ]}
                  placeholder="0"
                  placeholderTextColor="rgba(224, 242, 254, 0.4)"
                  keyboardType="numeric"
                  value={form.quantidade}
                  onChangeText={(val) => handleInputChange('quantidade', val)}
                  onFocus={() => setFocusedField('quantidade')}
                  onBlur={() => setFocusedField(null)}
                  editable={!salvando}
                />
                {erros.quantidade && <Text style={modernStyles.formError}>{erros.quantidade}</Text>}
              </View>

              <View style={modernStyles.inputColumn}>
                <Text style={modernStyles.formLabel}>Unidade</Text>
                <TextInput
                  style={[
                    modernStyles.formInput,
                    focusedField === 'unidade' && modernStyles.formInputFocus,
                  ]}
                  placeholder="UN"
                  placeholderTextColor="rgba(224, 242, 254, 0.4)"
                  value={form.unidade}
                  onChangeText={(val) => handleInputChange('unidade', val)}
                  onFocus={() => setFocusedField('unidade')}
                  onBlur={() => setFocusedField(null)}
                  editable={!salvando}
                />
              </View>
            </View>

            {/* ESTOQUE MÍNIMO */}
            <Text style={modernStyles.formLabel}>Estoque Mínimo de Segurança</Text>
            <TextInput
              style={[
                modernStyles.formInput,
                focusedField === 'minimo' && modernStyles.formInputFocus,
                erros.minimo && modernStyles.formInputError,
              ]}
              placeholder="Ex: 5"
              placeholderTextColor="rgba(224, 242, 254, 0.4)"
              keyboardType="numeric"
              value={form.minimo}
              onChangeText={(val) => handleInputChange('minimo', val)}
              onFocus={() => setFocusedField('minimo')}
              onBlur={() => setFocusedField(null)}
              editable={!salvando}
            />
            {erros.minimo && <Text style={modernStyles.formError}>{erros.minimo}</Text>}

            {/* SETOR */}
            <Text style={modernStyles.formLabel}>Setor de Destino</Text>
            <View style={[
              modernStyles.formInput,
              { paddingHorizontal: 0, paddingVertical: 0, marginBottom: 12 },
              erros.setorId && modernStyles.formInputError,
            ]}>
              <Picker
                selectedValue={form.setorId}
                onValueChange={(value) => handleInputChange('setorId', value)}
                enabled={!salvando}
                style={{ color: '#E0F2FE' }}
              >
                <Picker.Item label="Selecione um setor..." value="" />
                {listaSetores.map((setor) => (
                  <Picker.Item key={setor.id} label={setor.nome} value={setor.id} />
                ))}
              </Picker>
            </View>
            {erros.setorId && <Text style={modernStyles.formError}>{erros.setorId}</Text>}

            {/* IMAGEM */}
            <Text style={modernStyles.formLabel}>Imagem do Produto (Opcional)</Text>
            <TouchableOpacity
              style={modernStyles.imageUploadBox}
              onPress={onSelecionarImagem}
              disabled={salvando}
            >
              <Text style={modernStyles.imageUploadText}>
                {imagem ? 'Imagem selecionada' : 'Clique para selecionar imagem'}
              </Text>
            </TouchableOpacity>
            <input
              type="file"
              accept="image/*"
              onChange={onSelecionarImagem}
              disabled={salvando}
              style={{ display: 'none' }}
            />

            {/* BOTÃO SUBMIT */}
            <TouchableOpacity
              style={[
                modernStyles.btnSubmit,
                salvando && modernStyles.btnSubmitLoading,
              ]}
              onPress={validarEEnviar}
              disabled={salvando}
            >
              {salvando ? (
                <>
                  <ActivityIndicator color="#00D9FF" size="small" />
                  <Text style={modernStyles.btnSubmitText}>Processando...</Text>
                </>
              ) : (
                <Text style={modernStyles.btnSubmitText}>Salvar no Estoque</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
