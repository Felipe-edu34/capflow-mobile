import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

/**
 * Utilitário universal para exportar e compartilhar arquivos CSV.
 * Suporta download nativo no navegador (Web) e salvamento/compartilhamento no celular (iOS e Android).
 *
 * @param {string} csvContent - Conteúdo em formato texto CSV.
 * @param {string} fileName - Nome do arquivo (ex: 'relatorio_movimentacoes.csv').
 * @param {string} dialogTitle - Título para a janela de compartilhamento no mobile.
 */
export async function exportarArquivoCsv(csvContent, fileName = 'relatorio.csv', dialogTitle = 'Exportar Relatório') {
  if (!csvContent || typeof csvContent !== 'string') {
    throw new Error('Conteúdo CSV inválido.');
  }

  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  // Plataforma Mobile (Android / iOS)
  try {
    const file = new File(Paths.cache, fileName);
    file.create();
    file.write(csvContent);

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle,
        UTI: 'public.comma-separated-values-text',
      });
      return true;
    } else {
      throw new Error('Compartilhamento não disponível neste dispositivo.');
    }
  } catch (error) {
    console.error('Erro no utilitário de exportação CSV:', error);
    throw error;
  }
}
