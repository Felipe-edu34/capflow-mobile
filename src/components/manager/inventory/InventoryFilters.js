import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from '../modernStyles';

const OPCOES_ORDENACAO = [
  { id: 'alfabetica', label: 'Nome (A-Z)' },
  { id: 'maior_estoque', label: 'Maior Estoque' },
  { id: 'menor_estoque', label: 'Menor Estoque' },
  { id: 'criticos', label: 'Apenas Críticos' },
];

export default function InventoryFilters({
  busca,
  onBuscaChange,
  ordenacao,
  onOrdenacaoChange,
  setores,
  setorSelecionado,
  onSelecionarSetor,
}) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const labelOrdenacaoAtual = OPCOES_ORDENACAO.find(op => op.id === ordenacao)?.label || 'Ordenar';

  return (
    <View>
      {/* LINHA DE BUSCA E BOTÃO DE ORDENAÇÃO */}
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
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterButtonText,
            filtrosAbertos && styles.filterButtonTextActive,
          ]}>
            Ordenação: <Text style={filtrosAbertos ? styles.filterButtonTextActive : { color: '#0F766E' }}>{labelOrdenacaoAtual}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* PAINEL EXPANSÍVEL DE CRITÉRIOS DE ORDENAÇÃO */}
      {filtrosAbertos && (
        <View style={styles.filterPanel}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 10, textTransform: 'uppercase' }}>
            Selecione o critério de ordenação da lista:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {OPCOES_ORDENACAO.map((opcao) => (
                <TouchableOpacity
                  key={opcao.id}
                  onPress={() => onOrdenacaoChange(opcao.id)}
                  style={[
                    styles.sortOption,
                    ordenacao === opcao.id && styles.sortOptionActive,
                  ]}
                  activeOpacity={0.7}
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

      {/* ABAS DE SETORES */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4, paddingBottom: 8 }}>
        <View style={[styles.sectorTabs, { flexWrap: 'nowrap' }]}>
          <TouchableOpacity
            style={[styles.sectorTab, setorSelecionado === 'todos' && styles.sectorTabActive]}
            onPress={() => onSelecionarSetor('todos')}
            activeOpacity={0.7}
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
              activeOpacity={0.7}
            >
              <Text style={[styles.sectorTabText, setorSelecionado === setor.key && styles.sectorTabTextActive]}>
                {setor.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
