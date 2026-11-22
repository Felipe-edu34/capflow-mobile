import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
    { id: 'dashboard', label: 'Visão Geral', desc: 'Métricas e Gráficos', icon: 'pie-chart' },
    { id: 'produtos', label: 'Inventário', desc: 'Gestão de estoque', icon: 'package' },
    { id: 'setores', label: 'Setores', desc: 'Gestão de áreas', icon: 'grid' },
    { id: 'movimentacoes', label: 'Movimentações', desc: 'Histórico de auditoria', icon: 'repeat' },
    { id: 'funcionarios', label: 'Equipe', desc: 'Gestão de acessos', icon: 'users' }, 
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
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
  ];

  const iniciais = (perfil?.username || 'CF')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={sidebarStyle}>
      <View style={modernStyles.sidebarSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 }}>
          <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Módulos do Sistema
          </Text>
          {isMobile && (
            <TouchableOpacity onPress={onCloseMobile} style={{ padding: 6, borderRadius: 8, backgroundColor: '#1E293B' }}>
              <Feather name="x" size={16} color="#94A3B8" />
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
                { flexDirection: 'row', alignItems: 'center', gap: 12 },
                ativo && modernStyles.sidebarItemActive,
              ]}
              activeOpacity={0.75}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: ativo ? 'rgba(14, 165, 233, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                borderWidth: 1,
                borderColor: ativo ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.05)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Feather name={item.icon} size={17} color={ativo ? '#38BDF8' : '#94A3B8'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[modernStyles.sidebarItemTitle, ativo && { color: '#FFFFFF' }]}>{item.label}</Text>
                <Text style={[modernStyles.sidebarItemDesc, ativo && { color: '#7DD3FC' }]}>{item.desc}</Text>
              </View>
              {ativo && (
                <Feather name="chevron-right" size={15} color="#38BDF8" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* RODAPÉ DE PERFIL CORPORATIVO */}
      <View style={modernStyles.sidebarProfile}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          padding: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}>
          <View style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            backgroundColor: '#0EA5E9',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>{iniciais}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={modernStyles.sidebarUsername} numberOfLines={1}>
              {perfil?.username || 'Carregando...'}
            </Text>
            <Text style={modernStyles.sidebarCompany} numberOfLines={1}>
              {perfil?.empresa || 'Administração CapFlow'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.3)',
            paddingVertical: 11,
            borderRadius: 12,
            marginTop: 12,
          }}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={15} color="#F87171" />
          <Text style={{ color: '#FCA5A5', fontWeight: '800', fontSize: 13 }}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}