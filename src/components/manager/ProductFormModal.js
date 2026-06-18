import React, { useState, useRef } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
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
  const [setorDropdownAberto, setSetorDropdownAberto] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleEscolhaImagem = () => {
    if (salvando) return;
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else if (onSelecionarImagem) {
      onSelecionarImagem();
    }
  };

  // Encontra o nome do setor selecionado atualmente para exibir no botão do dropdown
  const setorSelecionado = listaSetores.find(s => s.id === form.setorId);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modernStyles.modalOverlay}>
        <View style={modernStyles.modalContainer}>
          
          {/* HEADER */}
          <View style={modernStyles.modalHeader}>
            <Text style={modernStyles.modalTitle}>Cadastrar Novo Produto</Text>
            <TouchableOpacity
              style={modernStyles.modalCloseBtn}
              onPress={onClose}
              disabled={salvando}
            >
              <Text style={modernStyles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* BODY */}
          <ScrollView contentContainerStyle={modernStyles.modalBody} showsVerticalScrollIndicator={false}>
            
            {/* NOME DO PRODUTO */}
            <Text style={modernStyles.formLabel}>Nome do Produto</Text>
            <TextInput
              style={[
                modernStyles.formInput,
                focusedField === 'nome' && modernStyles.formInputFocus,
                erros.nome && modernStyles.formInputError,
              ]}
              placeholder="Ex: estopa cinza"
              placeholderTextColor="#94A3B8"
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
                <Text style={modernStyles.formLabel}>Quantidade Real</Text>
                <TextInput
                  style={[
                    modernStyles.formInput,
                    focusedField === 'quantidade' && modernStyles.formInputFocus,
                    erros.quantidade && modernStyles.formInputError,
                  ]}
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
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
                  placeholderTextColor="#94A3B8"
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
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={form.minimo}
              onChangeText={(val) => handleInputChange('minimo', val)}
              onFocus={() => setFocusedField('minimo')}
              onBlur={() => setFocusedField(null)}
              editable={!salvando}
            />
            {erros.minimo && <Text style={modernStyles.formError}>{erros.minimo}</Text>}

            {/* SETOR DE DESTINO - DROPDOWN CUSTOMIZADO (ZERO DEPENDÊNCIAS) */}
            <Text style={modernStyles.formLabel}>Setor de Destino</Text>
            <TouchableOpacity
              style={[
                modernStyles.formInput,
                focusedField === 'setor' && modernStyles.formInputFocus,
                erros.setorId && modernStyles.formInputError,
                { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
              ]}
              onPress={() => !salvando && setSetorDropdownAberto(!setorDropdownAberto)}
              activeOpacity={0.7}
            >
              <Text style={{ color: form.setorId ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '500' }}>
                {setorSelecionado ? setorSelecionado.nome : "Selecione um setor..."}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 10 }}>{setorDropdownAberto ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {setorDropdownAberto && (
              <View style={{ 
                backgroundColor: '#FFFFFF', 
                borderWidth: 1, 
                borderColor: '#CBD5E1', 
                borderRadius: 10, 
                marginTop: 6, 
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2
              }}>
                {listaSetores.length === 0 ? (
                  <View style={{ padding: 12 }}>
                    <Text style={{ color: '#94A3B8', fontSize: 13 }}>Nenhum setor cadastrado</Text>
                  </View>
                ) : (
                  listaSetores.map((setor) => (
                    <TouchableOpacity
                      key={setor.id}
                      style={{ 
                        paddingHorizontal: 14, 
                        paddingVertical: 12, 
                        borderBottomWidth: 1, 
                        borderBottomColor: '#F1F5F9', 
                        backgroundColor: form.setorId === setor.id ? '#F8FAFC' : '#FFFFFF' 
                      }}
                      onPress={() => {
                        handleInputChange('setorId', setor.id);
                        setSetorDropdownAberto(false);
                      }}
                    >
                      <Text style={{ 
                        color: '#0F172A', 
                        fontSize: 14, 
                        fontWeight: form.setorId === setor.id ? '700' : '500' 
                      }}>
                        {setor.nome}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
            {erros.setorId && <Text style={modernStyles.formError}>{erros.setorId}</Text>}

            {/* IMAGEM DO PRODUTO */}
            <Text style={modernStyles.formLabel}>Imagem do Produto (Opcional)</Text>
            <TouchableOpacity
              style={modernStyles.imageUploadBox}
              onPress={handleEscolhaImagem}
              disabled={salvando}
              activeOpacity={0.6}
            >
              <Text style={modernStyles.imageUploadText}>
                {imagem ? '✓ Imagem Selecionada' : 'Clique para selecionar imagem'}
              </Text>
            </TouchableOpacity>

            {Platform.select({
              web: (
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={onSelecionarImagem}
                  disabled={salvando}
                  style={{ display: 'none' }}
                />
              ),
              default: null
            })}

            {/* BOTÃO SUBMIT */}
            <TouchableOpacity
              style={[
                modernStyles.btnSubmit,
                salvando && modernStyles.btnSubmitLoading,
              ]}
              onPress={validarEEnviar}
              disabled={salvando}
              activeOpacity={0.8}
            >
              {salvando ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={modernStyles.btnSubmitText}>Salvando...</Text>
                </>
              ) : (
                <Text style={modernStyles.btnSubmitText}>Salvar no Estoque</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}