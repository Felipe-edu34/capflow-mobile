import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';

export default function ProductDetailModal({ item, visible, onClose, onExcluir, onAtualizar, listaSetores = [], baseUrl }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formEdit, setFormEdit] = useState({});
  const [novaImagem, setNovaImagem] = useState(null);

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
    }
  }, [item]);

  if (!visible || !item) return null;

  const handleSalvar = () => {
    onAtualizar(item.id, formEdit, novaImagem);
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

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        
        <View style={{ width: '100%', maxWidth: 500, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}>
          
          {/* CABEÇALHO DO MODAL */}
          <View style={{ backgroundColor: '#06111F', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
              {isEditing ? 'Editar Produto' : 'Detalhes do Produto'}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
              <Text style={{ color: '#94A3B8', fontSize: 16, fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: '80vh', padding: 20 }}>
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
                {/* Abstração segura para renderizar o elemento HTML select sem quebrar o Metro Bundler */}
                <View style={{ 
                  backgroundColor: '#F8FAFC', 
                  borderWidth: 1, 
                  borderColor: '#CBD5E1', 
                  borderRadius: 8, 
                  overflow: 'hidden',
                  height: 40,
                  justifyContent: 'center',
                  marginBottom: 4
                }}>
                  <select
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      backgroundColor: 'transparent',
                      color: '#0F172A', 
                      border: 'none',
                      outline: 'none',
                      paddingLeft: 12,
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                    value={formEdit.setor}
                    onChange={(e) => setFormEdit({ ...formEdit, setor: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {listaSetores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </View>

                <Label>Atualizar Imagem (Opcional)</Label>
                <input type="file" accept="image/*" onChange={(e) => setNovaImagem(e.target.files[0])} style={{ marginTop: 5 }} />
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