import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './modernStyles'; 

function ProductCard({ item, baseUrl, onPress, onMovimentacaoRapida }) {
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
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
      ]}
    >
      {/* LADO ESQUERDO: Clique para abrir os detalhes do produto */}
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
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

          <View style={styles.productInfo}>
            <View style={styles.productTitleRow}>
              <Text style={[styles.productName, { maxWidth: 180 }]} numberOfLines={1}>
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
            
            {/* CORREÇÃO DO SETOR/SUBSETOR AQUI */}
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

        {/* Exibição do Estoque Centralizado */}
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

export default function InventorySection({
  grupos,
  setores,
  setorSelecionado,
  onSelecionarSetor,
  busca,            
  onBuscaChange,     
  loading,
  totalItens,
  baseUrl,
  onOpenItem,
  ordenacao, 
  onOrdenacaoChange,
  onNovoProduto,
  onMovimentacaoRapida
}) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // CORREÇÃO DO ERRO 'g is not defined' (linha abaixo)
  const gruposVisiveis =
    setorSelecionado === 'todos' ? grupos : grupos.filter((grupo) => grupo.key === setorSelecionado);

  const labelOrdenacaoAtual = {
    alfabetica: 'Nome (A-Z)',
    maior_estoque: 'Maior Estoque',
    menor_estoque: 'Menor Estoque',
    criticos: 'Apenas Críticos',
  }[ordenacao] || 'Ordenar';

  return (
    <View style={styles.listPanel}>
      
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>Inventário</Text>
          <Text style={styles.sectionTitle}>Produtos por setor</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            style={{
              backgroundColor: '#0EA5E9',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
              shadowColor: '#0EA5E9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4
            }}
            onPress={onNovoProduto}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Novo Produto</Text>
          </TouchableOpacity>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{totalItens} itens</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={[
              styles.input,
              {
                marginBottom: 0,
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                borderColor: '#CBD5E1',
                fontSize: 13,
                paddingVertical: 12,
                fontWeight: '600',
              },
            ]}
            placeholder="Pesquisar produto pelo nome..."
            placeholderTextColor="#94A3B8"
            value={busca}
            onChangeText={onBuscaChange}
          />
        </View>

        <TouchableOpacity
          onPress={() => setFiltrosAbertos(!filtrosAbertos)}
          style={[
            styles.filterButton,
            filtrosAbertos && styles.filterButtonActive,
          ]}
        >
          <Text style={[
            styles.filterButtonText,
            filtrosAbertos && styles.filterButtonTextActive,
          ]}>
            Ordenação: <Text style={filtrosAbertos ? styles.filterButtonTextActive : { color: '#0F766E' }}>{labelOrdenacaoAtual}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {filtrosAbertos && (
        <View style={styles.filterPanel}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 10, textTransform: 'uppercase' }}>
            Selecione o critério de ordenação da lista:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { id: 'alfabetica', label: 'Nome (A-Z)' },
                { id: 'maior_estoque', label: 'Maior Estoque' },
                { id: 'menor_estoque', label: 'Menor Estoque' },
                { id: 'criticos', label: 'Apenas Críticos' },
              ].map((opcao) => (
                <TouchableOpacity
                  key={opcao.id}
                  onPress={() => onOrdenacaoChange(opcao.id)}
                  style={[
                    styles.sortOption,
                    ordenacao === opcao.id && styles.sortOptionActive,
                  ]}
                >
                  <Text style={[
                    styles.sortOptionText,
                    ordenacao === opcao.id && styles.sortOptionTextActive,
                  ]}>
                    {opcao.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

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
                <ProductCard 
                  key={item.id} 
                  item={item} 
                  baseUrl={baseUrl} 
                  onPress={onOpenItem} 
                  onMovimentacaoRapida={onMovimentacaoRapida}
                />
              ))}
            </View>
          ))}
        </>
      )}
    </View>
  );
}