import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import styles from '../modernStyles';

export default function ProductCard({ item, baseUrl, onPress, onMovimentacaoRapida }) {
  const estoqueBaixo = Number(item.quantidade_atual) <= Number(item.estoque_minimo);
  const imageUri = item.imagem?.startsWith('http') ? item.imagem : `${baseUrl}${item.imagem}`;

  return (
    <View
      style={[
        styles.productCard, 
        estoqueBaixo && styles.productCardAlert,
        estoqueBaixo && {
          borderLeftWidth: 5,
          borderLeftColor: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#FCA5A5',
        },
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }
      ]}
    >
      {/* LADO ESQUERDO: Informações e foto do produto */}
      <TouchableOpacity
        style={{ flex: 1, minWidth: 180, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.productLeft}>
          <View style={styles.imageContainer}>
            {item.imagem ? (
              <Image source={{ uri: imageUri }} style={styles.productImage} />
            ) : (
              <View style={styles.noImagePlaceholder}>
                <Text style={styles.noImageText}>IMG</Text>
              </View>
            )}
          </View>

          <View style={[styles.productInfo, { flex: 1, flexShrink: 1 }]}>
            <View style={[styles.productTitleRow, { flexShrink: 1 }]}>
              <Text style={[styles.productName, { flexShrink: 1 }]} numberOfLines={1}>
                {item.nome}
              </Text>
              {estoqueBaixo && (
                <View style={{ 
                  backgroundColor: '#EF4444', 
                  paddingHorizontal: 8, 
                  paddingVertical: 2, 
                  borderRadius: 4,
                  marginLeft: 8
                }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
                    CRÍTICO
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={styles.productMeta} numberOfLines={1}>
              📍 {item.subsetor_nome ? `Subsetor ${item.subsetor_nome}` : `Setor ${item.setor_nome || item.setor || 'Sem setor'}`} | Mínimo {item.estoque_minimo} {item.unidade_medida || 'UN'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* LADO DIREITO: Controles de movimentação rápida */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
        
        {/* Botão de Saída (-) */}
        <TouchableOpacity
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: '#F1F5F9',
            borderWidth: 1,
            borderColor: '#CBD5E1',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => onMovimentacaoRapida(item, 'SAIDA')}
          activeOpacity={0.6}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#475569', marginTop: -2 }}>-</Text>
        </TouchableOpacity>

        {/* Quantidade em estoque */}
        <View style={[styles.productStock, { minWidth: 55, alignItems: 'center', marginHorizontal: 2 }]}>
          <Text style={[
            styles.stockQty, 
            estoqueBaixo && { color: '#B91C1C', fontWeight: '900' }
          ]}>
            {item.quantidade_atual}
          </Text>
          <Text style={[
            styles.stockUnit, 
            estoqueBaixo && { color: '#EF4444', fontWeight: '600' }
          ]}>
            {item.unidade_medida}
          </Text>
        </View>

        {/* Botão de Entrada (+) */}
        <TouchableOpacity
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: '#E0F2FE',
            borderWidth: 1,
            borderColor: '#BAE6FD',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => onMovimentacaoRapida(item, 'ENTRADA')}
          activeOpacity={0.6}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0369A1', marginTop: -2 }}>+</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
