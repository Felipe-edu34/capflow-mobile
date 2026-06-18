import React, { useState } from 'react'; // Adicionado o useState aqui para controlar a abertura
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './managerStyles';

function ProductCard({ item, baseUrl, onPress }) {
  const estoqueBaixo = Number(item.quantidade_atual) <= Number(item.estoque_minimo);
  const imageUri = item.imagem?.startsWith('http') ? item.imagem : `${baseUrl}${item.imagem}`;

  return (
    <TouchableOpacity
      style={[
        styles.productCard, 
        estoqueBaixo && styles.productCardAlert,
        // Engenharia de UI: Injeção de Alerta Enterprise se o estoque for baixo
        estoqueBaixo && {
          borderLeftWidth: 5,
          borderLeftColor: '#EF4444',     // Borda lateral vermelha viva
          backgroundColor: '#FEF2F2',    // Fundo vermelho extremamente suave
          borderColor: '#FCA5A5',        // Borda externa levemente avermelhada
        }
      ]}
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
            Setor {item.setor_nome || item.setor || 'Sem setor'} | Mínimo {item.estoque_minimo} {item.unidade_medida}
          </Text>
        </View>
      </View>

      <View style={styles.productStock}>
        {/* O número da quantidade fica vermelho escuro e em negrito pesado se estiver crítico */}
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
    </TouchableOpacity>
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
  onOrdenacaoChange
}) {
  // Estado local para controlar se a gaveta de filtros está aberta ou fechada
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const gruposVisiveis =
    setorSelecionado === 'todos' ? grupos : grupos.filter((grupo) => grupo.key === setorSelecionado);

  // Mapeamento de rótulos amigáveis para mostrar qual ordenação está ativa no botão principal
  const labelOrdenacaoAtual = {
    alfabetica: 'Nome (A-Z)',
    maior_estoque: 'Maior Estoque',
    menor_estoque: 'Menor Estoque',
    criticos: 'Apenas Críticos',
  }[ordenacao] || 'Ordenar';

  return (
    <View style={styles.listPanel}>
      {/* CABEÇALHO DO INVENTÁRIO */}
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>Inventário</Text>
          <Text style={styles.sectionTitle}>Produtos por setor</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{totalItens} itens</Text>
        </View>
      </View>

      {/* LINHA DE BUSCA COM BOTÃO INTELIGENTE DE FILTROS */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={[
              styles.input,
              {
                marginBottom: 0,
                backgroundColor: '#F8FAFC',
                color: '#0F172A',
                borderColor: '#CBD5E1',
                fontSize: 13,
                paddingVertical: 10,
                fontWeight: '500',
              },
            ]}
            placeholder="Pesquisar produto pelo nome..."
            placeholderTextColor="#94A3B8"
            value={busca}
            onChangeText={onBuscaChange}
          />
        </View>

        {/* BOTÃO PRINCIPAL DE FILTROS/ORDENAÇÃO */}
        <TouchableOpacity
          onPress={() => setFiltrosAbertos(!filtrosAbertos)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 6,
            borderWidth: 1,
            backgroundColor: filtrosAbertos ? '#0F172A' : '#FFFFFF',
            borderColor: '#CBD5E1',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Text style={{ 
            fontSize: 13, 
            fontWeight: '600', 
            color: filtrosAbertos ? '#FFFFFF' : '#334155' 
          }}>
            Ordenação: <Text style={{ color: filtrosAbertos ? '#38BDF8' : '#0F766E' }}>{labelOrdenacaoAtual}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* GAVETA RETRÁTIL: SÓ APARECE SE "filtrosAbertos" FOR TRUE */}
      {filtrosAbertos && (
        <View style={{ 
          backgroundColor: '#F1F5F9', 
          padding: 10, 
          borderRadius: 8, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E2E8F0'
        }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 8, textTransform: 'uppercase' }}>
            Selecione o critério de ordenação da lista:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { id: 'alfabetica', label: 'Nome (A-Z)' },
                { id: 'maior_estoque', label: 'Maior Estoque' },
                { id: 'menor_estoque', label: 'Menor Estoque' },
                { id: 'criticos', label: 'Apenas Críticos' },
              ].map((opcao) => (
                <TouchableOpacity
                  key={opcao.id}
                  onPress={() => onOrdenacaoChange(opcao.id)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    backgroundColor: ordenacao === opcao.id ? '#1E293B' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: ordenacao === opcao.id ? '#0F172A' : '#CBD5E1',
                  }}
                >
                  <Text style={{ 
                    fontSize: 12, 
                    fontWeight: '600',
                    color: ordenacao === opcao.id ? '#FFFFFF' : '#64748B' 
                  }}>
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
          {/* SELEÇÃO DE ABAS DE SETORES */}
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

          {/* RENDERIZAÇÃO DOS BLOCOS DE SETOR */}
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