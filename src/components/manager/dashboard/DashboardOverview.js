import React from 'react';
import { View } from 'react-native';
import modernStyles from '../modernStyles';
import DashboardFilters from '../DashboardFilters';
import MetricCard from '../MetricCard';
import ManagerCharts from '../ManagerCharts';

export default function DashboardOverview({
  setores = [],
  setorSelecionado,
  setSetorSelecionado,
  listaItensCriticos = [],
  onAbrirAlertas,
  indicadores = {},
  gruposPorSetor = [],
  itensFiltrados = [],
}) {
  return (
    <View style={{ width: '100%' }}>
      {/* 1. FILTROS ANALÍTICOS E ALERTA DE RUPTURA */}
      <DashboardFilters 
        setores={setores}
        setorSelecionado={setorSelecionado}
        setSetorSelecionado={setSetorSelecionado}
        listaItensCriticos={listaItensCriticos}
        onAbrirAlertas={onAbrirAlertas}
      />

      {/* 2. GRID DE MÉTRICAS */}
      <View style={[modernStyles.metricsGrid, { marginBottom: 24 }]}>
        <MetricCard 
          label="Produtos" 
          value={indicadores.totalItens || 0} 
          hint="itens encontrados" 
        />
        <MetricCard
          label="Críticos"
          value={indicadores.itensCriticos || 0}
          hint="abaixo do mínimo"
          danger={(indicadores.itensCriticos || 0) > 0}
        />
        <MetricCard 
          label="Setores" 
          value={indicadores.setores || 0} 
          hint="áreas envolvidas" 
        />
        <MetricCard 
          label="Volume" 
          value={indicadores.volume || 0} 
          hint="unidades registradas" 
        />
      </View>

      {/* 3. GRÁFICOS ANALÍTICOS */}
      <ManagerCharts 
        gruposPorSetor={gruposPorSetor} 
        itens={itensFiltrados} 
      />
    </View>
  );
}
