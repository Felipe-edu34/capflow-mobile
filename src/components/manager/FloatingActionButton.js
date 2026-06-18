import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import modernStyles from './modernStyles';

export default function FloatingActionButton({ onPress }) {
  const [showLabel, setShowLabel] = useState(false);

  return (
    <View style={modernStyles.btnNovoContainer}>
      {/* Engenharia de UI: Renderização limpa do Tooltip (Ativada via Hover na Web) */}
      {showLabel && (
        <Text style={modernStyles.btnNovoProdutoLabel}>Novo Produto</Text>
      )}

      <TouchableOpacity
        style={modernStyles.btnNovoProduto}
        onPress={onPress}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        activeOpacity={0.7}
      >
        <Text style={modernStyles.btnNovoProdutoText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}