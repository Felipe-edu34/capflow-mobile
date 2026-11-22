import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MovementCard({
  produtoNome,
  dataFormatada,
  tipoTexto,
  quantidade,
}) {
  let corSinal = '#10B981';
  let corBg = '#ECFDF5';
  let corBorda = '#A7F3D0';
  let icone = 'arrow-down-left';
  let sinal = '+';

  if (tipoTexto === 'SAIDA') {
    corSinal = '#EF4444';
    corBg = '#FEF2F2';
    corBorda = '#FECACA';
    icone = 'arrow-up-right';
    sinal = '-';
  } else if (tipoTexto === 'NOVO PRODUTO CADASTRADO') {
    corSinal = '#0284C7';
    corBg = '#E0F2FE';
    corBorda = '#BAE6FD';
    icone = 'package';
    sinal = '+';
  }

  return (
    <View 
      style={{ 
        backgroundColor: '#FFFFFF', 
        padding: 16, 
        marginBottom: 12, 
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, minWidth: 180 }}>
        <View style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: corBg,
          borderWidth: 1,
          borderColor: corBorda,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Feather name={icone} size={18} color={corSinal} />
        </View>

        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>
            {produtoNome}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <Feather name="clock" size={11} color="#64748B" />
            <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>
              {dataFormatada}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end', minWidth: 100 }}>
        <Text style={{ fontSize: 19, fontWeight: '900', color: corSinal }}>
          {sinal}{quantidade}
        </Text>
        <View style={{
          backgroundColor: corBg,
          borderColor: corBorda,
          borderWidth: 1,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 6,
          marginTop: 4,
        }}>
          <Text style={{ fontSize: 10, color: corSinal, fontWeight: '800', textTransform: 'uppercase' }}>
            {tipoTexto}
          </Text>
        </View>
      </View>
    </View>
  );
}
