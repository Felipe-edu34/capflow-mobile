import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
  const [buscaFocada, setBuscaFocada] = useState(false);

  const labelOrdenacaoAtual = OPCOES_ORDENACAO.find(op => op.id === ordenacao)?.label || 'Ordenar';

  return (
    <View>
      {/* LINHA DE BUSCA E BOTÃO DE ORDENAÇÃO */}
      <View style={styles.filterRow}>
        <View style={{
          flex: 1,
          minWidth: 220,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: buscaFocada ? '#FFFFFF' : '#F8FAFC',
          borderWidth: 1.5,
          borderColor: buscaFocada ? '#0EA5E9' : '#CBD5E1',
          borderRadius: 12,
          paddingHorizontal: 14,
        }}>
          <Feather name="search" size={16} color={buscaFocada ? '#0EA5E9' : '#64748B'} style={{ marginRight: 10 }} />
          <TextInput
            style={{
              flex: 1,
              color: '#0F172A',
              fontSize: 13,
              paddingVertical: 11,
              fontWeight: '600',
              ...Platform.select({ web: { outlineStyle: 'none' } }),
            }}
            placeholder="Pesquisar produto pelo nome..."
            placeholderTextColor="#94A3B8"
            value={busca}
            onChangeText={onBuscaChange}
            onFocus={() => setBuscaFocada(true)}
            onBlur={() => setBuscaFocada(false)}
            accessibilityLabel="Pesquisar produto pelo nome"
          />
          {Boolean(busca) && (
            <TouchableOpacity onPress={() => onBuscaChange('')} style={{ padding: 4 }}>
              <Feather name="x-circle" size={15} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setFiltrosAbertos(!filtrosAbertos)}
          style={[
            styles.filterButton,
            { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12 },
            filtrosAbertos && styles.filterButtonActive,
          ]}
          activeOpacity={0.75}
        >
          <Feather name="sliders" size={14} color={filtrosAbertos ? '#0284C7' : '#64748B'} />
          <Text style={[
            styles.filterButtonText,
            filtrosAbertos && styles.filterButtonTextActive,
          ]}>
            Ordenação: <Text style={filtrosAbertos ? styles.filterButtonTextActive : { color: '#0F766E' }}>{labelOrdenacaoAtual}</Text>
          </Text>
          <Feather name={filtrosAbertos ? 'chevron-up' : 'chevron-down'} size={14} color={filtrosAbertos ? '#0284C7' : '#64748B'} />
        </TouchableOpacity>
      </View>

      {/* PAINEL EXPANSÍVEL DE CRITÉRIOS DE ORDENAÇÃO */}
      {filtrosAbertos && (
        <View style={styles.filterPanel}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
