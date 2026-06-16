import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import styles from './managerStyles';

function ProductCard({ item, baseUrl, onPress }) {
  const estoqueBaixo = Number(item.quantidade_atual) <= Number(item.estoque_minimo);
  const imageUri = item.imagem?.startsWith('http') ? item.imagem : `${baseUrl}${item.imagem}`;

  return (
    <TouchableOpacity
      style={[styles.productCard, estoqueBaixo && styles.productCardAlert]}
      onPress={() => onPress(item)}
      activeOpacity={0.78}
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

        <View style={styles.productInfo}>
          <View style={styles.productTitleRow}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.nome}
            </Text>
            {estoqueBaixo && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>Crítico</Text>
              </View>
            )}
          </View>
          <Text style={styles.productMeta} numberOfLines={1}>
            Setor {item.setor_nome || item.setor || 'Sem setor'} | Mínimo {item.estoque_minimo} {item.unidade_medida}
          </Text>
        </View>
      </View>

      <View style={styles.productStock}>
        <Text style={styles.stockQty}>{item.quantidade_atual}</Text>
        <Text style={styles.stockUnit}>{item.unidade_medida}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function InventorySection({
  grupos,
  setores,
  setorSelecionado,
  onSelecionarSetor,
  loading,
  totalItens,
  baseUrl,
  onOpenItem,
}) {
  const gruposVisiveis =
    setorSelecionado === 'todos' ? grupos : grupos.filter((grupo) => grupo.key === setorSelecionado);

  return (
    <View style={styles.listPanel}>
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>Inventário</Text>
          <Text style={styles.sectionTitle}>Produtos por setor</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{totalItens} itens</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#0F766E" />
          <Text style={styles.loadingText}>Carregando inventário...</Text>
        </View>
      ) : totalItens === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhum produto cadastrado</Text>
          <Text style={styles.emptyText}>Assim que novos itens forem salvos, eles aparecerão neste painel.</Text>
        </View>
      ) : (
        <>
          <View style={styles.sectorTabs}>
            <TouchableOpacity
              style={[styles.sectorTab, setorSelecionado === 'todos' && styles.sectorTabActive]}
              onPress={() => onSelecionarSetor('todos')}
            >
              <Text style={[styles.sectorTabText, setorSelecionado === 'todos' && styles.sectorTabTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>

            {setores.map((setor) => (
              <TouchableOpacity
                key={setor.key}
                style={[styles.sectorTab, setorSelecionado === setor.key && styles.sectorTabActive]}
                onPress={() => onSelecionarSetor(setor.key)}
              >
                <Text style={[styles.sectorTabText, setorSelecionado === setor.key && styles.sectorTabTextActive]}>
                  {setor.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {gruposVisiveis.map((grupo) => (
            <View key={grupo.key} style={styles.sectorBlock}>
              <View style={styles.sectorHeader}>
                <View>
                  <Text style={styles.sectorTitle}>{grupo.nome}</Text>
                  <Text style={styles.sectorMeta}>{grupo.itens.length} produtos neste setor</Text>
                </View>
                {grupo.criticos > 0 && <Text style={styles.sectorCritical}>{grupo.criticos} críticos</Text>}
              </View>

              {grupo.itens.map((item) => (
                <ProductCard key={item.id} item={item} baseUrl={baseUrl} onPress={onOpenItem} />
              ))}
            </View>
          ))}
        </>
      )}
    </View>
  );
}
