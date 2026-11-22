import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }
      ]}
    >
      {/* LADO ESQUERDO: Informações e foto do produto */}
      <TouchableOpacity
        style={{ flex: 1, minWidth: 180, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => onPress(item)}
        activeOpacity={0.75}
      >
        <View style={styles.productLeft}>
          <View style={[styles.imageContainer, { borderRadius: 12, width: 52, height: 52 }]}>
            {item.imagem ? (
              <Image source={{ uri: imageUri }} style={styles.productImage} />
            ) : (
              <View style={[styles.noImagePlaceholder, { backgroundColor: '#F1F5F9' }]}>
                <Feather name="package" size={20} color="#94A3B8" />
              </View>
            )}
          </View>

          <View style={[styles.productInfo, { flex: 1, flexShrink: 1 }]}>
            <View style={[styles.productTitleRow, { flexShrink: 1, gap: 8 }]}>
              <Text style={[styles.productName, { flexShrink: 1 }]} numberOfLines={1}>
                {item.nome}
              </Text>
              {estoqueBaixo && (
                <View style={{ 
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: '#EF4444', 
                  paddingHorizontal: 8, 
                  paddingVertical: 3, 
                  borderRadius: 6,
                }}>
                  <Feather name="alert-circle" size={10} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
                    CRÍTICO
                  </Text>
                </View>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
              <Feather name="map-pin" size={12} color="#64748B" />
              <Text style={styles.productMeta} numberOfLines={1}>
                {item.subsetor_nome ? `Subsetor ${item.subsetor_nome}` : `Setor ${item.setor_nome || item.setor || 'Sem setor'}`} • Mínimo {item.estoque_minimo} {item.unidade_medida || 'UN'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* LADO DIREITO: Controles de movimentação rápida */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: estoqueBaixo ? 'rgba(255,255,255,0.7)' : '#F8FAFC',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: estoqueBaixo ? '#FECACA' : '#E2E8F0',
      }}>
        
        {/* Botão de Saída (-) */}
        <TouchableOpacity
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#CBD5E1',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => onMovimentacaoRapida(item, 'SAIDA')}
          activeOpacity={0.65}
          accessibilityRole="button"
          accessibilityLabel={`Registrar saída rápida de ${item.nome}`}
        >
          <Feather name="minus" size={15} color="#475569" />
        </TouchableOpacity>

        {/* Quantidade em estoque */}
        <View style={{ minWidth: 58, alignItems: 'center', paddingHorizontal: 4 }}>
          <Text style={[
            styles.stockQty, 
            estoqueBaixo && { color: '#B91C1C', fontWeight: '900' }
          ]}>
            {item.quantidade_atual}
          </Text>
          <Text style={[
            styles.stockUnit, 
            estoqueBaixo && { color: '#EF4444', fontWeight: '700' }
          ]}>
            {item.unidade_medida}
          </Text>
        </View>

        {/* Botão de Entrada (+) */}
        <TouchableOpacity
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            backgroundColor: '#0EA5E9',
            borderWidth: 1,
            borderColor: '#0284C7',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => onMovimentacaoRapida(item, 'ENTRADA')}
          activeOpacity={0.65}
          accessibilityRole="button"
          accessibilityLabel={`Registrar entrada rápida de ${item.nome}`}
        >
          <Feather name="plus" size={15} color="#FFFFFF" />
        </TouchableOpacity>

      </View>
    </View>
  );
}
