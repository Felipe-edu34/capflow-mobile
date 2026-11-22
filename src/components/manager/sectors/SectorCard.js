import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import modernStyles from '../modernStyles';
import SubsectorItem from './SubsectorItem';

export default function SectorCard({
  setor,
  subsetores = [],
  itens = [],
  funcionarios = [],
  onEditarSetor,
  onExcluirSetor,
  onEditarSubsetor,
  onExcluirSubsetor,
}) {
  const subsetoresDoSetor = subsetores.filter(
    (sub) => String(sub.setor_pai) === String(setor.id)
  );

  // Resolve os nomes dos funcionários responsáveis atribuídos a este setor
  const idsResponsaveis = Array.isArray(setor.responsaveis)
    ? setor.responsaveis
    : setor.responsavel
    ? [setor.responsavel]
    : [];

  const nomesResponsaveis = idsResponsaveis.map((resp) => {
    if (typeof resp === 'object' && resp !== null) {
      return resp.nome || resp.username || `ID #${resp.id}`;
    }
    const encontrado = funcionarios.find((f) => String(f.id) === String(resp));
    return encontrado ? (encontrado.nome || encontrado.username) : `ID #${resp}`;
  });

  const textoResponsaveis =
    nomesResponsaveis.length > 0
      ? nomesResponsaveis.join(', ')
      : 'Nenhum responsável específico atribuído';

  return (
    <View style={{ marginBottom: 20 }}>
      {/* 1. CARTÃO DO SETOR PAI */}
      <View style={[
        modernStyles.productCard,
        {
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 0,
          flexWrap: 'wrap',
          gap: 12,
          padding: 18,
          borderRadius: 16,
        }
      ]}>
        <View style={[modernStyles.productLeft, { flex: 1, minWidth: 180, gap: 14 }]}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: '#E0F2FE',
            borderWidth: 1,
            borderColor: '#BAE6FD',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Feather name="folder" size={20} color="#0284C7" />
          </View>

          <View style={modernStyles.productInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={modernStyles.productName}>{setor.nome}</Text>
              <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                <Text style={{ color: '#475569', fontSize: 11, fontWeight: '700' }}>
                  {subsetoresDoSetor.length} {subsetoresDoSetor.length === 1 ? 'sub-setor' : 'sub-setores'}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
              <Feather name="user-check" size={12} color={nomesResponsaveis.length > 0 ? '#0284C7' : '#64748B'} />
              <Text style={[
                modernStyles.productMeta,
                nomesResponsaveis.length > 0 && { color: '#0F172A', fontWeight: '700' }
              ]}>
                {nomesResponsaveis.length > 1 ? 'Responsáveis: ' : 'Responsável: '}
                <Text style={{ color: nomesResponsaveis.length > 0 ? '#0284C7' : '#64748B', fontWeight: nomesResponsaveis.length > 0 ? '700' : '500' }}>
                  {textoResponsaveis}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity 
            onPress={() => onEditarSetor(setor)} 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: '#F0F9FF',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#BAE6FD',
            }}
            activeOpacity={0.75}
          >
            <Feather name="edit-2" size={13} color="#0284C7" />
            <Text style={{ color: '#0284C7', fontWeight: '700', fontSize: 12 }}>Editar Setor</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => onExcluirSetor(setor.id)} 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: '#FEF2F2',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#FECACA',
            }}
            activeOpacity={0.75}
          >
            <Feather name="trash-2" size={13} color="#DC2626" />
            <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 12 }}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. LISTA DE SUB-SETORES ANINHADOS */}
      {subsetoresDoSetor.length > 0 && (
        <View style={{ 
          marginLeft: 24, 
          borderLeftWidth: 2, 
          borderLeftColor: '#CBD5E1', 
          paddingLeft: 16, 
          marginTop: 6 
        }}>
          {subsetoresDoSetor.map((sub) => {
            const produtosDoSub = itens.filter(
              (i) => String(i.subsetor) === String(sub.id)
            );

            return (
              <SubsectorItem
                key={sub.id}
                sub={sub}
                totalProdutos={produtosDoSub.length}
                onEditar={onEditarSubsetor}
                onExcluir={onExcluirSubsetor}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
