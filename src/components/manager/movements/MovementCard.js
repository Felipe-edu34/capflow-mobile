import React from 'react';
import { Text, View } from 'react-native';

export default function MovementCard({
  produtoNome,
  dataFormatada,
  tipoTexto,
  quantidade,
}) {
  let corSinal = '#10B981'; // Verde (Entrada)
  let sinal = '+';

  if (tipoTexto === 'SAIDA') {
    corSinal = '#EF4444'; // Vermelho (Saída)
    sinal = '-';
  } else if (tipoTexto === 'NOVO PRODUTO CADASTRADO') {
    corSinal = '#3B82F6'; // Azul (Cadastro inicial)
  }

  return (
    <View 
      style={{ 
        backgroundColor: '#FFFFFF', 
        padding: 14, 
        marginBottom: 10, 
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <View style={{ flex: 1, minWidth: 140, paddingRight: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#374151' }}>
          {produtoNome}
        </Text>
        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
          {dataFormatada}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', minWidth: 100 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: corSinal }}>
          {sinal}{quantidade}
        </Text>
        <Text style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 2, fontWeight: '700', textTransform: 'uppercase' }}>
          {tipoTexto}
        </Text>
      </View>
    </View>
  );
}
