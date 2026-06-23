import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';

export default function QuickMovementModal({
  visible,
  onClose,
  tipoRapido,
  itemSelecionado,
  quantidadeRapida,
  onQuantidadeChange,
  onConfirmar,
}) {
  if (!visible || !itemSelecionado) return null;

  const isEntrada = tipoRapido === 'ENTRADA';

  // 🚨 TRAVA DE SEGURANÇA 🚨
  const handleConfirmarSeguro = () => {
    const qtdDesejada = Number(quantidadeRapida);
    
    // Verifica se o usuário digitou um número válido e maior que zero
    if (isNaN(qtdDesejada) || qtdDesejada <= 0) {
      alert('Por favor, digite uma quantidade válida maior que zero.');
      return;
    }

    // Se for SAÍDA, verifica se tem estoque suficiente
    if (!isEntrada) {
      // Pega o estoque atual (garante que seja número, se vier vazio vira 0)
      const estoqueAtual = Number(itemSelecionado.quantidade || 0); 
      
      if (qtdDesejada > estoqueAtual) {
        alert(`❌ Operação bloqueada!\n\nVocê tentou retirar ${qtdDesejada}, mas o estoque atual é de apenas ${estoqueAtual} UN.`);
        return; // O return cancela a ação e não deixa ir para o banco de dados
      }
    }

    // Se passou por todas as verificações, chama a função original do seu sistema!
    onConfirmar();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={{ backgroundColor: '#FFF', width: '85%', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
          
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isEntrada ? '#E0F2FE' : '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 24, color: isEntrada ? '#0EA5E9' : '#EF4444', fontWeight: '800' }}>
                {isEntrada ? '+' : '-'}
              </Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
              {isEntrada ? 'Entrada de Estoque' : 'Saída de Estoque'}
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
              Ajuste rápido para <Text style={{ fontWeight: '700', color: '#1E293B' }}>{itemSelecionado.nome}</Text>
            </Text>
            {/* Mostra o estoque atual para o usuário saber quanto pode tirar */}
            {!isEntrada && (
              <Text style={{ fontSize: 12, color: '#EF4444', marginTop: 4, fontWeight: 'bold' }}>
                Estoque atual: {itemSelecionado.quantidade || 0}
              </Text>
            )}
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Quantidade a {isEntrada ? 'adicionar' : 'remover'}
            </Text>
            <TextInput
              style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#0F172A', fontWeight: '600' }}
              placeholder="Ex: 10"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={quantidadeRapida}
              onChangeText={onQuantidadeChange}
              autoFocus
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={onClose} 
              style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' }}
            >
              <Text style={{ color: '#475569', fontWeight: '700', fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleConfirmarSeguro} /* AGORA PASSA PELO NOSSO GUARDA-COSTAS ANTES */
              style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: isEntrada ? '#0EA5E9' : '#EF4444', alignItems: 'center' }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Confirmar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}