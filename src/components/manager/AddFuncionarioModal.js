import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function AddFuncionarioModal({ visible, onClose, onSalvar }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('OPERADOR');

  useEffect(() => {
    if (!visible) {
      setNome('');
      setEmail('');
      setSenha('');
      setCargo('OPERADOR');
    }
  }, [visible]);

  const handleSubmeter = () => {
    if (!nome || !email || !senha) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // 3. APENAS ENVIA OS DADOS. Removemos os "setNome('')" daqui de baixo!
    onSalvar({
      nome,
      email,
      senha,
      cargo,
      status: 'ATIVO'
    });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)', // Backdrop escurecido elegante
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16
      }}>
        
        {/* CONTAINER DO CARD (Limitado e centralizado na Web) */}
        <View style={{
          backgroundColor: '#FFF',
          width: '100%',
          maxWidth: 580, // 🛠️ Impede que estique na Web, mantendo perfeito no PC
          borderRadius: 20,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          
          {/* Cabeçalho */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>Novo Funcionário</Text>
              <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>O e-mail informado será o login de acesso dele.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#94A3B8' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* Campo Nome */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Nome Completo</Text>
              <TextInput
                style={inputStyle}
                placeholder="Ex: Carlos Silva"
                placeholderTextColor="#94A3B8"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            {/* Campo E-mail */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>E-mail de Acesso</Text>
              <TextInput
                style={inputStyle}
                placeholder="carlos@empresa.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Campo Senha */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Senha Provisória</Text>
              <TextInput
                style={inputStyle}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                autoCapitalize="none"
                value={senha}
                onChangeText={setSenha}
              />
            </View>

            {/* Seleção de Nível de Acesso (Apenas Gestor e Operador) */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 10, textTransform: 'uppercase' }}>Nível de Acesso (Cargo)</Text>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                
                {/* Opção Gestor */}
                <TouchableOpacity 
                  onPress={() => setCargo('GESTOR')}
                  style={[cargoCardStyle, cargo === 'GESTOR' && { borderColor: '#0EA5E9', backgroundColor: '#F0F9FF' }]}
                >
                  <Text style={[cargoTitleStyle, cargo === 'GESTOR' && { color: '#0EA5E9' }]}>Gestor</Text>
                  <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 4 }}>Pode ver gráficos, gerenciar setores e produtos.</Text>
                </TouchableOpacity>

                {/* Opção Operador */}
                <TouchableOpacity 
                  onPress={() => setCargo('OPERADOR')}
                  style={[cargoCardStyle, cargo === 'OPERADOR' && { borderColor: '#F59E0B', backgroundColor: '#FEF3C7' }]}
                >
                  <Text style={[cargoTitleStyle, cargo === 'OPERADOR' && { color: '#D97706' }]}>Operador</Text>
                  <Text style={{ fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 4 }}>Apenas realiza movimentações rápidas de estoque.</Text>
                </TouchableOpacity>

              </View>
            </View>

            {/* Botões de Ação */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity 
                onPress={onClose}
                style={{ flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#475569', fontWeight: '600', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSubmeter}
                style={{ flex: 1, backgroundColor: '#0EA5E9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Cadastrar</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Estilos Reutilizáveis para limpar o escopo do código
const inputStyle = {
  backgroundColor: '#F8FAFC',
  borderWidth: 1,
  borderColor: '#E2E8F0',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 14,
  color: '#0F172A'
};

const cargoCardStyle = {
  flex: 1,
  borderWidth: 2,
  borderColor: '#E2E8F0',
  backgroundColor: '#FFF',
  borderRadius: 14,
  padding: 14,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 90
};

const cargoTitleStyle = {
  fontSize: 15,
  fontWeight: '700',
  color: '#475569'
};