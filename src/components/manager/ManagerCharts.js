import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ManagerCharts({ gruposPorSetor = [], itens = [] }) {
  const totalItensCat = itens.length;

  // Cálculo do Termômetro de Saúde
  const qteCriticos = itens.filter(item => Number(item.quantidade_atual) <= Number(item.estoque_minimo)).length;
  const qteSaudaveis = totalItensCat - qteCriticos;

  const pctCriticos = totalItensCat > 0 ? Math.round((qteCriticos / totalItensCat) * 100) : 0;
  const pctSaudaveis = totalItensCat > 0 ? 100 - pctCriticos : 100;

  // Cálculo do Volume Global para a distribuição por setores
  const volumeTotalGlobal = gruposPorSetor.reduce((acc, grupo) => {
    const volGrupo = grupo.itens.reduce((sum, item) => sum + Number(item.quantidade_atual || 0), 0);
    return acc + volGrupo;
  }, 0);

  // Filtro do Top 5 Itens mais urgentes
  const topItensCriticos = [...itens]
    .filter(item => Number(item.quantidade_atual) <= Number(item.estoque_minimo))
    .sort((a, b) => Number(a.quantidade_atual) - Number(b.quantidade_atual))
    .slice(0, 5);

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  };

  return (
    <View style={{ gap: 20, marginBottom: 24 }}>
      
      {/* GRÁFICO 1: TERMÔMETRO DE SAÚDE DO ESTOQUE */}
      <View style={cardStyle}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <View>
            <Text style={{ color: '#0D9488', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Saúde do Inventário
            </Text>
            <Text style={{ color: '#0F172A', fontSize: 17, fontWeight: '800', marginTop: 2 }}>
              Equilíbrio de Criticidade
            </Text>
          </View>
          <View style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            backgroundColor: qteCriticos > 0 ? '#FEF2F2' : '#ECFDF5',
            borderWidth: 1,
            borderColor: qteCriticos > 0 ? '#FECACA' : '#A7F3D0',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Feather
              name={qteCriticos > 0 ? 'activity' : 'shield'}
              size={18}
              color={qteCriticos > 0 ? '#EF4444' : '#10B981'}
            />
          </View>
        </View>

        {/* Barra Empilhada Dinâmica */}
        <View style={{ height: 28, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 8, flexDirection: 'row', overflow: 'hidden' }}>
          {(qteSaudaveis > 0 || totalItensCat === 0) && (
            <View style={{ width: `${pctSaudaveis}%`, backgroundColor: '#10B981', justifyContent: 'center', paddingHorizontal: 12 }}>
              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{pctSaudaveis}% OK</Text>
            </View>
          )}
          {qteCriticos > 0 && (
            <View style={{ width: `${pctCriticos}%`, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 12 }}>
              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{pctCriticos}% ALERTA</Text>
            </View>
          )}
        </View>

        {/* Legenda do Gráfico */}
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' }} />
            <Text style={{ color: '#475569', fontSize: 12, fontWeight: '700' }}>Saudável ({qteSaudaveis} itens)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' }} />
            <Text style={{ color: '#475569', fontSize: 12, fontWeight: '700' }}>Crítico ({qteCriticos} itens)</Text>
          </View>
        </View>
      </View>

      {/* GRID DE DOIS GRÁFICOS INFERIORES */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
        
        {/* GRÁFICO 2: DISTRIBUIÇÃO DE VOLUME POR SETOR */}
        <View style={[cardStyle, { flex: 1, minWidth: 300 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ color: '#0284C7', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Ocupação Física
              </Text>
              <Text style={{ color: '#0F172A', fontSize: 17, fontWeight: '800', marginTop: 2 }}>
                Volume por Setor (Unidades)
              </Text>
            </View>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#E0F2FE', borderWidth: 1, borderColor: '#BAE6FD', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="pie-chart" size={16} color="#0284C7" />
            </View>
          </View>

          <View style={{ gap: 14 }}>
            {gruposPorSetor.map((grupo) => {
              const volumeSetor = grupo.itens.reduce((sum, item) => sum + Number(item.quantidade_atual || 0), 0);
              const pctSetor = volumeTotalGlobal > 0 ? Math.round((volumeSetor / volumeTotalGlobal) * 100) : 0;

              return (
                <View key={grupo.key}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#1E293B', fontSize: 13, fontWeight: '700' }}>{grupo.nome}</Text>
                    <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '800' }}>
                      {volumeSetor} un <Text style={{ color: '#0EA5E9' }}>({pctSetor}%)</Text>
                    </Text>
                  </View>
                  <View style={{ height: 10, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                    <View style={{ width: `${pctSetor}%`, height: '100%', backgroundColor: '#0EA5E9', borderRadius: 99 }} />
                  </View>
                </View>
              );
            })}
            {gruposPorSetor.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Feather name="inbox" size={24} color="#94A3B8" />
                <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 8, fontWeight: '600' }}>
                  Nenhum setor para mapear volume.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* GRÁFICO 3: TOP 5 PRODUTOS MAIS CRÍTICOS */}
        <View style={[cardStyle, { flex: 1, minWidth: 300 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Prioridade Máxima de Compra
              </Text>
              <Text style={{ color: '#0F172A', fontSize: 17, fontWeight: '800', marginTop: 2 }}>
                Top 5 Urgências de Estoque
              </Text>
            </View>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="trending-down" size={16} color="#EF4444" />
            </View>
          </View>

          <View style={{ gap: 10 }}>
            {topItensCriticos.map((item, index) => {
              const deficitPct = Math.min(100, Math.round((Number(item.quantidade_atual) / Number(item.estoque_minimo)) * 100));
              
              return (
                <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: '#FEF2F2', borderRadius: 10, borderWidth: 1, borderColor: '#FECACA' }}>
                  <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '900' }}>{index + 1}</Text>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#1E293B', fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
                      {item.nome}
                    </Text>
                    <Text style={{ color: '#7F1D1D', fontSize: 11, fontWeight: '600', marginTop: 1 }}>
                      Estoque: {item.quantidade_atual} / Mínimo: {item.estoque_minimo} {item.unidade_medida}
                    </Text>
                  </View>

                  <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ color: '#B91C1C', fontSize: 11, fontWeight: '800' }}>
                      {deficitPct}%
                    </Text>
                  </View>
                </View>
              );
            })}

            {topItensCriticos.length === 0 && (
              <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 24,
                backgroundColor: '#F0FDF4',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#BBF7D0',
              }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Feather name="check-circle" size={20} color="#16A34A" />
                </View>
                <Text style={{ color: '#15803D', fontSize: 14, fontWeight: '800' }}>Operação Segura!</Text>
                <Text style={{ color: '#166534', fontSize: 12, marginTop: 2, opacity: 0.85 }}>
                  Nenhum produto está abaixo do mínimo configurado.
                </Text>
              </View>
            )}
          </View>
        </View>

      </View>
    </View>
  );
}