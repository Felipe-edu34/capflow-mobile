import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import modernStyles from './modernStyles';

export default function SectorList({ 
  setores, 
  subsetores = [], // Inicializado como vazio para evitar erros
  itens, 
  onNovoSetor, 
  onEditarSetor, 
  onExcluirSetor,
  // Recebendo os novos poderes dos sub-setores:
  onNovoSubsetor,
  onEditarSubsetor,
  onExcluirSubsetor
}) {
  return (
    <View style={modernStyles.listPanel}>
      
      {/* CABEÇALHO DO PAINEL */}
      <View style={modernStyles.listHeader}>
        <View>
          <Text style={modernStyles.sectionEyebrow}>Mapeamento Operacional</Text>
          <Text style={modernStyles.sectionTitle}>Setores e Sub-setores</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={modernStyles.countBadge}>
            <Text style={modernStyles.countBadgeText}>{setores.length} Setores</Text>
          </View>
          
          {/* BOTÃO DE NOVO SUB-SETOR (Verdinho para diferenciar) */}
          <TouchableOpacity
            style={{ backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
            onPress={onNovoSubsetor}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Novo Sub-setor</Text>
          </TouchableOpacity>

          {/* BOTÃO DE NOVO SETOR (Azul) */}
          <TouchableOpacity
            style={{ backgroundColor: '#0EA5E9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
            onPress={onNovoSetor}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>+ Novo Setor</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTAGEM PRINCIPAL */}
      <ScrollView style={{ maxHeight: 600 }} showsVerticalScrollIndicator={false}>
        {setores.length === 0 ? (
          <View style={modernStyles.emptyState}>
            <Text style={modernStyles.emptyTitle}>Nenhum setor cadastrado</Text>
            <Text style={modernStyles.emptyText}>Clique em "+ Novo Setor" para começar a estruturar seu armazém.</Text>
          </View>
        ) : (
          setores.map((setor) => {
            // A MÁGICA: Filtramos na hora apenas os sub-setores que pertencem a este setor específico
            const subsetoresDoSetor = subsetores.filter(
              (sub) => String(sub.setor_pai) === String(setor.id)
            );

            return (
              <View key={setor.id} style={{ marginBottom: 20 }}>
                
                {/* 1. CARTÃO DO SETOR PAI (A Gaveta Principal) */}
                <View style={[modernStyles.productCard, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }]}>
                  <View style={[modernStyles.productLeft, { flex: 1 }]}>
                    <View style={modernStyles.productInfo}>
                      <Text style={modernStyles.productName}>📁 {setor.nome}</Text>
                      <Text style={modernStyles.productMeta}>
                        Responsável: {setor.responsavel ? `ID Funcional: ${setor.responsavel}` : 'Nenhum responsável atribuído'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => onEditarSetor(setor)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F0F9FF', borderRadius: 6, borderWidth: 1, borderColor: '#BAE6FD' }}>
                      <Text style={{ color: '#0284C7', fontWeight: '600', fontSize: 12 }}>Editar Setor</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onExcluirSetor(setor.id)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#FEF2F2', borderRadius: 6, borderWidth: 1, borderColor: '#FECACA' }}>
                      <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 12 }}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 2. LISTA DE SUB-SETORES (O Aninhamento) */}
                {subsetoresDoSetor.length > 0 && (
                  <View style={{ 
                    marginLeft: 24, // Dá aquele recuo para a direita
                    borderLeftWidth: 2, // Cria a linha visual de conexão
                    borderLeftColor: '#CBD5E1', 
                    paddingLeft: 16, 
                    marginTop: 8 
                  }}>
                    {subsetoresDoSetor.map((sub) => {
                      // Agora os produtos pertencem ao sub-setor, não mais ao setor!
                      const produtosDoSub = itens.filter(
                        (i) => String(i.subsetor) === String(sub.id)
                      );

                      return (
                        <View key={sub.id} style={[modernStyles.productCard, { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, marginTop: 8, backgroundColor: '#F8FAFC' }]}>
                          
                          <View style={[modernStyles.productLeft, { flex: 1 }]}>
                            <View style={modernStyles.productInfo}>
                              <Text style={[modernStyles.productName, { fontSize: 14 }]}>↳ {sub.nome}</Text>
                            </View>
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            {/* Produtos dentro deste sub-setor */}
                            <View style={[modernStyles.productStock, { marginRight: 8, backgroundColor: '#E2E8F0' }]}>
                              <Text style={[modernStyles.stockQty, { color: '#475569' }]}>{produtosDoSub.length}</Text>
                              <Text style={[modernStyles.stockUnit, { color: '#64748B' }]}>PRODUTOS</Text>
                            </View>

                            <TouchableOpacity onPress={() => onEditarSubsetor(sub)} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#F0FDF4', borderRadius: 6, borderWidth: 1, borderColor: '#BBF7D0' }}>
                              <Text style={{ color: '#16A34A', fontWeight: '600', fontSize: 11 }}>Editar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => onExcluirSubsetor(sub.id)} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#FEF2F2', borderRadius: 6, borderWidth: 1, borderColor: '#FECACA' }}>
                              <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 11 }}>Excluir</Text>
                            </TouchableOpacity>
                          </View>

                        </View>
                      );
                    })}
                  </View>
                )}

              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}