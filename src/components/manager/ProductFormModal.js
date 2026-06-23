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
  listaSubsetores = [],
}) {
  const [erros, setErros] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [setorDropdownAberto, setSetorDropdownAberto] = useState(false);
  const [setorExpandido, setSetorExpandido] = useState(null); // NOVO: Controla qual setor está aberto
  const fileInputRef = useRef(null);

  const validarEEnviar = () => {
    const novosErros = {};

    if (!form.nome?.trim()) novosErros.nome = 'O nome do produto é obrigatório';
    if (!form.quantidade?.toString().trim()) novosErros.quantidade = 'Defina a quantidade inicial';
    if (!form.minimo?.toString().trim()) novosErros.minimo = 'Defina o estoque mínimo de segurança';
    if (!form.setorId) novosErros.setorId = 'Selecione o setor ou sub-setor de destino';

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

  // Encontra o nome para exibir no botão fechado
  let nomeSelecionadoExibicao = "Selecione um setor...";
  const setorPrincipalSelecionado = listaSetores.find(s => s.id === form.setorId);
  
  if (setorPrincipalSelecionado) {
    nomeSelecionadoExibicao = setorPrincipalSelecionado.nome;
  } else {
    const subSetorSelecionado = listaSubsetores.find(s => s.id === form.setorId);
    if (subSetorSelecionado) {
      const pai = listaSetores.find(s => s.id === (subSetorSelecionado.setorPaiId || subSetorSelecionado.setor_pai || subSetorSelecionado.setor_id));
      nomeSelecionadoExibicao = pai ? `${pai.nome} > ${subSetorSelecionado.nome}` : subSetorSelecionado.nome;
    }
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={modernStyles.modalOverlay}>
        <View style={modernStyles.modalContainer}>
          
          <View style={modernStyles.modalHeader}>
            <Text style={modernStyles.modalTitle}>Cadastrar Novo Produto</Text>
            <TouchableOpacity style={modernStyles.modalCloseBtn} onPress={onClose} disabled={salvando}>
              <Text style={modernStyles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modernStyles.modalBody} showsVerticalScrollIndicator={false}>
            
            <Text style={modernStyles.formLabel}>Nome do Produto</Text>
            <TextInput
              style={[ modernStyles.formInput, focusedField === 'nome' && modernStyles.formInputFocus, erros.nome && modernStyles.formInputError ]}
              placeholder="Ex: estopa cinza"
              placeholderTextColor="#94A3B8"
              value={form.nome}
              onChangeText={(val) => handleInputChange('nome', val)}
              onFocus={() => setFocusedField('nome')}
              onBlur={() => setFocusedField(null)}
              editable={!salvando}
            />
            {erros.nome && <Text style={modernStyles.formError}>{erros.nome}</Text>}

            <View style={modernStyles.inputRow}>
              <View style={modernStyles.inputColumn}>
                <Text style={modernStyles.formLabel}>Quantidade Real</Text>
                <TextInput
                  style={[ modernStyles.formInput, focusedField === 'quantidade' && modernStyles.formInputFocus, erros.quantidade && modernStyles.formInputError ]}
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
                  style={[ modernStyles.formInput, focusedField === 'unidade' && modernStyles.formInputFocus ]}
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

            <Text style={modernStyles.formLabel}>Estoque Mínimo de Segurança</Text>
            <TextInput
              style={[ modernStyles.formInput, focusedField === 'minimo' && modernStyles.formInputFocus, erros.minimo && modernStyles.formInputError ]}
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

            {/* SETOR DE DESTINO */}
            <Text style={modernStyles.formLabel}>Setor de Destino</Text>
            <TouchableOpacity
              style={[ modernStyles.formInput, focusedField === 'setor' && modernStyles.formInputFocus, erros.setorId && modernStyles.formInputError, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              onPress={() => !salvando && setSetorDropdownAberto(!setorDropdownAberto)}
              activeOpacity={0.7}
            >
              <Text style={{ color: form.setorId ? '#0F172A' : '#94A3B8', fontSize: 14, fontWeight: '500' }}>
                {nomeSelecionadoExibicao}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 10 }}>{setorDropdownAberto ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* SANFONA (ACCORDION) DOS SETORES E SUB-SETORES */}
            {setorDropdownAberto && (
              <ScrollView style={[modernStyles.dropdownContainer, { maxHeight: 220 }]} nestedScrollEnabled={true}>
                {listaSetores.length === 0 ? (
                  <View style={{ padding: 12 }}>
                    <Text style={{ color: '#94A3B8', fontSize: 13 }}>Nenhum setor cadastrado</Text>
                  </View>
                ) : (
                  listaSetores.map((setor) => {
                    const isSelected = form.setorId === setor.id;
                    const subsetoresDesteSetor = listaSubsetores.filter(
                      sub => sub.setorPaiId === setor.id || sub.setor_pai === setor.id || sub.setor_id === setor.id
                    );
                    const temSub = subsetoresDesteSetor.length > 0;
                    const isExpanded = setorExpandido === setor.id;

                    return (
                      <React.Fragment key={setor.id}>
                        {/* SETOR PRINCIPAL (CLIQUE PARA EXPANDIR OU SELECIONAR) */}
                        <TouchableOpacity
                          style={[
                            modernStyles.dropdownItem,
                            isSelected && !isExpanded && modernStyles.dropdownItemActive,
                            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
                          ]}
                          onPress={() => {
                            if (temSub) {
                              setSetorExpandido(isExpanded ? null : setor.id); // Abre/fecha a sanfona
                            } else {
                              handleInputChange('setorId', setor.id); // Seleciona direto
                              setSetorDropdownAberto(false);
                            }
                          }}
                        >
                          <Text style={[
                            modernStyles.dropdownItemText,
                            isSelected && !isExpanded && modernStyles.dropdownItemTextActive,
                            { fontWeight: '700' }
                          ]}>
                            {setor.nome}
                          </Text>
                          {temSub && (
                            <Text style={{ color: '#0369A1', fontSize: 18, fontWeight: 'bold' }}>
                              {isExpanded ? '−' : '+'}
                            </Text>
                          )}
                        </TouchableOpacity>

                        {/* LISTA DE SUB-SETORES (SÓ APARECE SE ESTIVER EXPANDIDO) */}
                        {isExpanded && (
                          <View style={{ backgroundColor: '#F8FAFC' }}>
                            {/* Opção para selecionar o Setor Principal em si */}
                            <TouchableOpacity
                              style={[
                                modernStyles.dropdownItem,
                                { paddingLeft: 32, borderTopWidth: 0, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
                                form.setorId === setor.id && modernStyles.dropdownItemActive
                              ]}
                              onPress={() => {
                                handleInputChange('setorId', setor.id);
                                setSetorDropdownAberto(false);
                              }}
                            >
                              <Text style={[modernStyles.dropdownItemText, form.setorId === setor.id && { color: '#0369A1', fontWeight: 'bold' }]}>
                                ↳ Geral ({setor.nome})
                              </Text>
                            </TouchableOpacity>

                            {/* Os Sub-setores verdadeiros */}
                            {subsetoresDesteSetor.map((sub) => {
                              const isSubSelected = form.setorId === sub.id;
                              return (
                                <TouchableOpacity
                                  key={sub.id}
                                  style={[
                                    modernStyles.dropdownItem,
                                    isSubSelected && modernStyles.dropdownItemActive,
                                    { paddingLeft: 32, borderTopWidth: 0 }
                                  ]}
                                  onPress={() => {
                                    handleInputChange('setorId', sub.id);
                                    setSetorDropdownAberto(false);
                                  }}
                                >
                                  <Text style={[
                                    modernStyles.dropdownItemText,
                                    isSubSelected && modernStyles.dropdownItemTextActive,
                                    { color: isSubSelected ? '#0369A1' : '#64748B', fontSize: 13 }
                                  ]}>
                                    ↳ {sub.nome}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </ScrollView>
            )}
            {erros.setorId && <Text style={modernStyles.formError}>{erros.setorId}</Text>}

            <Text style={modernStyles.formLabel}>Imagem do Produto (Opcional)</Text>
            <TouchableOpacity style={modernStyles.imageUploadBox} onPress={handleEscolhaImagem} disabled={salvando} activeOpacity={0.6}>
              <Text style={modernStyles.imageUploadText}>
                {imagem ? '✓ Imagem Selecionada' : 'Clique para selecionar imagem'}
              </Text>
            </TouchableOpacity>

            {Platform.select({
              web: <input type="file" ref={fileInputRef} accept="image/*" onChange={onSelecionarImagem} disabled={salvando} style={{ display: 'none' }} />,
              default: null
            })}

            <TouchableOpacity style={[modernStyles.btnSubmit, salvando && modernStyles.btnSubmitLoading]} onPress={validarEEnviar} disabled={salvando} activeOpacity={0.8}>
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