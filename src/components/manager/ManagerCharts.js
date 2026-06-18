import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function ManagerCharts({ gruposPorSetor = [], itens = [] }) {
  // --- 1. PROCESSAMENTO DE DADOS (A INTELIGÊNCIA POR TRÁS DOS GRÁFICOS) ---
  
  const totalItensCat = itens.length;

  // Cálculo do Termômetro de Saúde
  const qteCriticos = itens.filter(item => Number(item.quantidade_atual) <= Number(item.estoque_minimo)).length;
  const qteSaudaveis = totalItensCat - qteCriticos;

  const pctCriticos = totalItensCat > 0 ? Math.round((qteCriticos / totalItensCat) * 100) : 0;
  const pctSaudaveis = totalItensCat > 0 ? 100 - pctCriticos : 0;

  // Cálculo do Volume Global para a distribuição por setores
  const volumeTotalGlobal = gruposPorSetor.reduce((acc, grupo) => {
    const volGrupo = grupo.itens.reduce((sum, item) => sum + Number(item.quantidade_atual || 0), 0);
    return acc + volGrupo;
  }, 0);

  // Filtro do Top 5 Itens mais urgentes (menor estoque absoluto em estado crítico)
  const topItensCriticos = [...itens]
    .filter(item => Number(item.quantidade_atual) <= Number(item.estoque_minimo))
    .sort((a, b) => Number(a.quantidade_atual) - Number(b.quantidade_atual))
    .slice(0, 5);

  return (
    <View style={{ gap: 20, marginBottom: 24 }}>
      
      {/* 📊 GRÁFICO 1: TERMÔMETRO DE SAÚDE DO ESTOQUE */}
      <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#DDE5EF' }}>
        <Text style={{ color: '#0F766E', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Saúde do Inventário
        </Text>
        <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '800', marginTop: 2, marginBottom: 12 }}>
          Equilíbrio de Criticidade
        </Text>

        {/* Barra Empilhada Dinâmica */}
        <View style={{ height: 24, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 6, flexDirection: 'row', overflow: 'hidden' }}>
          {qteSaudaveis > 0 && (
            <View style={{ width: `${pctSaudaveis}%`, backgroundColor: '#10B981', justifyContent: 'center', paddingHorizontal: 8 }}>
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>{pctSaudaveis}% OK</Text>
            </View>
          )}
          {qteCriticos > 0 && (
            <View style={{ width: `${pctCriticos}%`, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 8 }}>
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>{pctCriticos}% ALERTA</Text>
            </View>
          )}
        </View>

        {/* Legenda do Gráfico */}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#10B981' }} />
            <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600' }}>Saudável ({qteSaudaveis} itens)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#EF4444' }} />
            <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600' }}>Crítico ({qteCriticos} itens)</Text>
          </View>
        </View>
      </View>

      {/* GRID DE DOIS GRÁFICOS INFERIORES */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
        
        {/* 🏢 GRÁFICO 2: DISTRIBUIÇÃO DE VOLUME POR SETOR */}
        <View style={{ flex: 1, minWidth: 300, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#DDE5EF' }}>
          <Text style={{ color: '#0F766E', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Ocupação Física
          </Text>
          <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '800', marginTop: 2, marginBottom: 16 }}>
            Volume por Setor (Unidades)
          </Text>

          <View style={{ gap: 12 }}>
            {gruposPorSetor.map((grupo) => {
              const volumeSetor = grupo.itens.reduce((sum, item) => sum + Number(item.quantidade_atual || 0), 0);
              const pctSetor = volumeTotalGlobal > 0 ? Math.round((volumeSetor / volumeTotalGlobal) * 100) : 0;

              return (
                <View key={grupo.key}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#334155', fontSize: 12, fontWeight: '700' }}>{grupo.nome}</Text>
                    <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '800' }}>
                      {volumeSetor} un <Text style={{ color: '#0EA5E9' }}>({pctSetor}%)</Text>
                    </Text>
                  </View>
                  {/* Linha preenchida via CSS proporcional */}
                  <View style={{ height: 8, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                    <View style={{ width: `${pctSetor}%`, height: '100%', backgroundColor: '#0EA5E9', borderRadius: 99 }} />
                  </View>
                </View>
              );
            })}
            {gruposPorSetor.length === 0 && (
              <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>
                Nenhum setor para mapear volume.
              </Text>
            )}
          </View>
        </View>

        {/* 🚨 GRÁFICO 3: TOP 5 PRODUTOS MAIS CRÍTICOS */}
        <View style={{ flex: 1, minWidth: 300, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#DDE5EF' }}>
          <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Prioridade Máxima de Compra
          </Text>
          <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '800', marginTop: 2, marginBottom: 16 }}>
            Top 5 Urgências de Estoque
          </Text>

          <View style={{ gap: 10 }}>
            {topItensCriticos.map((item, index) => {
              const deficitPct = Math.min(100, Math.round((Number(item.quantidade_atual) / Number(item.estoque_minimo)) * 100));
              
              return (
                <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, backgroundColor: '#FEF2F2', borderRadius: 6, borderWidth: 1, borderColor: '#FCA5A5' }}>
                  <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '900' }}>{index + 1}</Text>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#1E293B', fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
                      {item.nome}
                    </Text>
                    <Text style={{ color: '#7F1D1D', fontSize: 11, fontWeight: '500' }}>
                      Status: {item.quantidade_atual} de {item.estoque_minimo} {item.unidade_medida} mínimos
                    </Text>
                  </View>

                  {/* Mostrador de capacidade crítica */}
                  <Text style={{ color: '#B91C1C', fontSize: 12, fontWeight: '900' }}>
                    {deficitPct}% restando
                  </Text>
                </View>
              );
            })}

            {topItensCriticos.length === 0 && (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800' }}>🎉 Operação Segura!</Text>
                <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>Nenhum produto está abaixo do mínimo.</Text>
              </View>
            )}
          </View>
        </View>

      </View>
    </View>
  );
}