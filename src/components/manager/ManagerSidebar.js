import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import modernStyles from './modernStyles';

export default function ManagerSidebar({ 
  sidebarAberta, 
  abaAtiva, 
  setAbaAtiva, 
  perfil, 
  handleLogout 
}) {
  if (!sidebarAberta) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', desc: 'Métricas e Gráficos' },
    { id: 'produtos', label: 'Inventário', desc: 'Gestão de estoque' },
    { id: 'setores', label: 'Setores', desc: 'Gestão de áreas' },
    { id: 'movimentacoes', label: 'Movimentações', desc: 'Histórico de auditoria' },
    // 👥 ADICIONADO: Nova aba de funcionários integrada ao design
    { id: 'funcionarios', label: 'Equipe', desc: 'Gestão de acessos' }, 
  ];

  return (
    <View style={modernStyles.sidebar}>
      <View style={modernStyles.sidebarSection}>
        <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
          Módulos do Sistema
        </Text>

        {menuItems.map((item) => {
          const ativo = abaAtiva === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setAbaAtiva(item.id)}
              style={[
                modernStyles.sidebarItem,
                ativo && modernStyles.sidebarItemActive,
              ]}
            >
              <Text style={[modernStyles.sidebarItemTitle, ativo && { color: '#FFFFFF' }]}>{item.label}</Text>
              <Text style={[modernStyles.sidebarItemDesc, ativo && { color: '#9FC5F8' }]}>{item.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={modernStyles.sidebarProfile}>
        <Text style={modernStyles.sidebarUsername} numberOfLines={1}>
          {perfil?.username || 'Carregando...'}
        </Text>
        <Text style={modernStyles.sidebarCompany} numberOfLines={1}>
          {perfil?.empresa || 'Corporativo'}
        </Text>
        <TouchableOpacity onPress={handleLogout} style={modernStyles.sidebarLogout}>
          <Text style={modernStyles.sidebarLogoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}