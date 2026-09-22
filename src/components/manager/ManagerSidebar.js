import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import modernStyles from './modernStyles';

export default function ManagerSidebar({ 
  sidebarAberta, 
  abaAtiva, 
  setAbaAtiva, 
  perfil, 
  handleLogout,
  isMobile,
  onCloseMobile,
}) {
  if (!sidebarAberta) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', desc: 'Métricas e Gráficos' },
    { id: 'produtos', label: 'Inventário', desc: 'Gestão de estoque' },
    { id: 'setores', label: 'Setores', desc: 'Gestão de áreas' },
    { id: 'movimentacoes', label: 'Movimentações', desc: 'Histórico de auditoria' },
    { id: 'funcionarios', label: 'Equipe', desc: 'Gestão de acessos' }, 
  ];

  const sidebarStyle = [
    modernStyles.sidebar,
    isMobile && {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 100,
      elevation: 100,
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
  ];

  return (
    <View style={sidebarStyle}>
      <View style={modernStyles.sidebarSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
            Módulos do Sistema
          </Text>
          {isMobile && (
            <TouchableOpacity onPress={onCloseMobile} style={{ padding: 4 }}>
              <Text style={{ color: '#94A3B8', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

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
              activeOpacity={0.7}
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
        <TouchableOpacity onPress={handleLogout} style={modernStyles.sidebarLogout} activeOpacity={0.8}>
          <Text style={modernStyles.sidebarLogoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}