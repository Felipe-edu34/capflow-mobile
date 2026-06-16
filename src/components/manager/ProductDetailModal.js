import React from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import styles from './managerStyles';

const FIELD_LABELS = {
  id: 'ID',
  nome: 'Nome',
  quantidade_atual: 'Quantidade atual',
  unidade_medida: 'Unidade',
  estoque_minimo: 'Estoque mínimo',
  setor: 'ID do setor',
  setor_nome: 'Setor',
  imagem: 'Imagem',
};

const MAIN_FIELDS = ['id', 'setor_nome', 'setor', 'quantidade_atual', 'unidade_medida', 'estoque_minimo'];

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Não informado';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

export default function ProductDetailModal({ item, visible, baseUrl, onClose }) {
  if (!item) {
    return null;
  }

  const estoqueBaixo = Number(item.quantidade_atual) <= Number(item.estoque_minimo);
  const imageUri = item.imagem?.startsWith('http') ? item.imagem : `${baseUrl}${item.imagem}`;
  const extraFields = Object.entries(item).filter(([key]) => !['nome', 'imagem', ...MAIN_FIELDS].includes(key));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.detailOverlay}>
        <View style={styles.detailPanel}>
          <View style={styles.detailHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailTitle}>{item.nome}</Text>
              <Text style={styles.detailSubtitle}>Ficha completa do item selecionado</Text>
            </View>
            <TouchableOpacity style={styles.detailClose} onPress={onClose}>
              <Text style={styles.detailCloseText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.detailBody}>
            <View style={styles.detailTop}>
              <View style={styles.detailImage}>
                {item.imagem ? (
                  <Image source={{ uri: imageUri }} style={styles.detailImageFill} />
                ) : (
                  <View style={styles.noImagePlaceholder}>
                    <Text style={styles.noImageText}>Sem imagem</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailSummary}>
                <View style={[styles.detailStatus, estoqueBaixo && styles.detailStatusAlert]}>
                  <Text style={[styles.detailStatusText, estoqueBaixo && styles.detailStatusTextAlert]}>
                    {estoqueBaixo ? 'Estoque crítico' : 'Estoque saudável'}
                  </Text>
                </View>

                <View style={styles.detailGrid}>
                  {MAIN_FIELDS.map((field) => (
                    <View key={field} style={styles.detailField}>
                      <Text style={styles.detailLabel}>{FIELD_LABELS[field] || field}</Text>
                      <Text style={styles.detailValue}>{formatValue(item[field])}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.rawInfoPanel}>
              <Text style={styles.rawInfoTitle}>Todas as informações recebidas da API</Text>
              {extraFields.length === 0 ? (
                <Text style={styles.emptyText}>Não há campos extras para este item.</Text>
              ) : (
                extraFields.map(([key, value]) => (
                  <View key={key} style={styles.rawInfoRow}>
                    <Text style={styles.rawInfoKey}>{FIELD_LABELS[key] || key}</Text>
                    <Text style={styles.rawInfoValue}>{formatValue(value)}</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
