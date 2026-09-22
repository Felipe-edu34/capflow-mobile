import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ProductDetailModal({ item, visible, onClose, onExcluir, onAtualizar, onMaryPatch, listaSetores = [], baseUrl }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formEdit, setFormEdit] = useState({});
  const [novaImagem, setNovaImagem] = useState(null);
  const [dropdownSetorAberto, setDropdownSetorAberto] = useState(false);

  // Sincroniza o formulário local sempre que um novo item é selecionado
  useEffect(() => {
    if (item) {
      setFormEdit({
        nome: item.nome,
        quantidade_atual: String(item.quantidade_atual),
        unidade_medida: item.unidade_medida,
        estoque_minimo: String(item.estoque_minimo),
        setor: item.setor || item.setor_id || '',
      });
      setIsEditing(false);
      setNovaImagem(null);
      setDropdownSetorAberto(false);
    }
  }, [item]);

  if (!visible || !item) return null;

  const handleSalvar = () => {
    if (onMaryPatch) {
      onMaryPatch(item.id, formEdit, novaImagem);
    } else if (onAtualizar) {
      onAtualizar(item.id, formEdit, novaImagem);
    }
  };

  const handleEscolherNovaImagem = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNovaImagem(result.assets[0]);
      }
    } catch (error) {
      console.log('Erro ao selecionar imagem:', error);
      alert('Não foi possível abrir a galeria.');
    }
  };

  // Componente de rótulo para padronização de formulários corporativos
  const Label = ({ children }) => (
    <Text style={{ color: '#1E293B', fontSize: 12, fontWeight: '700', marginBottom: 4, marginTop: 12 }}>{children}</Text>
  );

  const inputStyle = {
    backgroundColor: '#F8FAFC', color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1', 
    borderRadius: 8, paddingHorizontal: 12, height: 40, fontSize: 14, marginBottom: 4
  };

  const imageUri = item.imagem?.startsWith('http') ? item.imagem : `${baseUrl}${item.imagem}`;

  const nomeSetorSelecionado = listaSetores.find(s => String(s.id) === String(formEdit.setor))?.nome || 'Selecione um setor...';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        
        <View style={{ width: '90%', maxWidth: 500, maxHeight: '90%', backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
          
          {/* CABEÇALHO DO MODAL */}
          <View style={{ backgroundColor: '#06111F', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
              {isEditing ? 'Editar Produto' : 'Detalhes do Produto'}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
              <Text style={{ color: '#94A3B8', fontSize: 16, fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 500, padding: 20 }}>
            {/* MODO DE EDIÇÃO */}
            {isEditing ? (
              <View>
                <Label>Nome do produto</Label>
                <TextInput style={inputStyle} value={formEdit.nome} onChangeText={(val) => setFormEdit({ ...formEdit, nome: val })} />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Label>Quantidade atual</Label>
                    <TextInput style={inputStyle} keyboardType="numeric" value={formEdit.quantidade_atual} onChangeText={(val) => setFormEdit({ ...formEdit, quantidade_atual: val })} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Label>Estoque mínimo</Label>
                    <TextInput style={inputStyle} keyboardType="numeric" value={formEdit.estoque_minimo} onChangeText={(val) => setFormEdit({ ...formEdit, estoque_minimo: val })} />
                  </View>
                  <View style={{ width: 80 }}>
                    <Label>Unidade</Label>
                    <TextInput style={inputStyle} value={formEdit.unidade_medida} onChangeText={(val) => setFormEdit({ ...formEdit, unidade_medida: val })} />
                  </View>
                </View>

                <Label>Setor responsável</Label>
                {/* Seletor nativo e universal compatível com Mobile e Web */}
                <TouchableOpacity
                  style={[inputStyle, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                  onPress={() => setDropdownSetorAberto(!dropdownSetorAberto)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: formEdit.setor ? '#0F172A' : '#94A3B8', fontSize: 14 }}>
                    {nomeSetorSelecionado}
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 10 }}>{dropdownSetorAberto ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {dropdownSetorAberto && (
                  <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, maxHeight: 150, marginBottom: 8, overflow: 'hidden' }}>
                    <ScrollView nestedScrollEnabled={true}>
                      {listaSetores.map((s) => {
                        const isSelected = String(formEdit.setor) === String(s.id);
                        return (
                          <TouchableOpacity
                            key={s.id}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 10,
                              borderBottomWidth: 1,
                              borderBottomColor: '#F1F5F9',
                              backgroundColor: isSelected ? '#E0F2FE' : 'transparent',
                            }}
                            onPress={() => {
                              setFormEdit({ ...formEdit, setor: s.id });
                              setDropdownSetorAberto(false);
                            }}
                          >
                            <Text style={{ color: isSelected ? '#0284C7' : '#334155', fontWeight: isSelected ? '700' : '400', fontSize: 13 }}>
                              {s.nome}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                <Label>Atualizar Imagem (Opcional)</Label>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: '#CBD5E1',
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                    marginTop: 4,
                    marginBottom: 8
                  }}
                  onPress={handleEscolherNovaImagem}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: novaImagem ? '#10B981' : '#64748B', fontSize: 13, fontWeight: '600' }}>
                    {novaImagem ? '✓ Nova Imagem Selecionada' : 'Clique para selecionar nova imagem'}
                  </Text>
                </TouchableOpacity>
              </View>

            ) : (
              /* MODO DE VISUALIZAÇÃO */
              <View>
                {item.imagem && (
                  <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Image 
                      source={{ uri: imageUri }} 
                      style={{ width: 150, height: 150, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }} 
                    />
                  </View>
                )}
                
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 15 }}>{item.nome}</Text>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                  <View style={{ backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, flex: 1, minWidth: 120 }}>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>Em estoque</Text>
                    <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: 'bold' }}>{item.quantidade_atual} {item.unidade_medida}</Text>
                  </View>
                  <View style={{ backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, flex: 1, minWidth: 120 }}>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>Mínimo ideal</Text>
                    <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: 'bold' }}>{item.estoque_minimo} {item.unidade_medida}</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* RODAPÉ COM BOTÕES DE AÇÃO */}
          <View style={{ padding: 20, borderTopWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={{ paddingVertical: 10, paddingHorizontal: 20 }}>
                  <Text style={{ color: '#64748B', fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSalvar} style={{ backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Salvar Alterações</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => onExcluir(item.id)} style={{ paddingVertical: 10, paddingHorizontal: 20 }}>
                  <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Excluir Produto</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditing(true)} style={{ backgroundColor: '#06111F', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Editar Produto</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}