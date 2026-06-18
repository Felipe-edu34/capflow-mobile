import { StyleSheet } from 'react-native';

const modernStyles = StyleSheet.create({
  // ============ MODAL BACKDROP ============
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  // ============ MODAL CONTAINER ============
  modalContainer: {
    width: '85%',
    maxWidth: 420,
    backgroundColor: '#1A2332',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3E52',
    overflow: 'hidden',
    shadowColor: '#0088CC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
    maxHeight: '70%',
  },

  // ============ MODAL HEADER ============
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3E52',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#162335',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0088CC',
    letterSpacing: 0.3,
  },

  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 136, 204, 0.1)',
    borderWidth: 1,
    borderColor: '#2D3E52',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  modalCloseText: {
    fontSize: 18,
    color: '#0088CC',
    fontWeight: '600',
  },

  // ============ MODAL BODY ============
  modalBody: {
    padding: 20,
    maxHeight: 'calc(70vh - 60px)',
    overflowY: 'auto',
  },

  // ============ BUTTON STYLES ============
  btnNovoContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 100,
  },

  btnNovoProduto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    borderWidth: 2,
    borderColor: '#00D9FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    transition: 'all 0.3s ease',
  },

  btnNovoProdutoText: {
    fontSize: 32,
    color: '#00D9FF',
    fontWeight: '700',
  },

  btnNovoProdutoLabel: {
    position: 'absolute',
    top: -40,
    whiteSpace: 'nowrap',
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    color: '#00D9FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },

  // ============ FORM INPUTS (Dark Mode with Neon) ============
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0088CC',
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  formInput: {
    backgroundColor: '#0F1619',
    borderWidth: 1,
    borderColor: '#2D3E52',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#B8C5D6',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
    transition: 'all 0.3s ease',
  },

  formInputFocus: {
    borderColor: '#0088CC',
    backgroundColor: '#162335',
    boxShadow: '0 0 10px rgba(0, 136, 204, 0.15)',
  },

  formInputError: {
    borderColor: '#E74C3C',
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
  },

  formInputPlaceholder: {
    color: 'rgba(184, 197, 214, 0.4)',
  },

  formError: {
    color: '#E74C3C',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 8,
    letterSpacing: 0.2,
  },

  // ============ SELECT STYLES ============
  formSelect: {
    width: '100%',
    backgroundColor: '#0F1619',
    borderWidth: 1,
    borderColor: '#2D3E52',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#B8C5D6',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
    transition: 'all 0.3s ease',
    outline: 'none',
  },

  // ============ SUBMIT BUTTON ============
  btnSubmit: {
    marginTop: 16,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0088CC',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    flexDirection: 'row',
    gap: 8,
  },

  btnSubmitText: {
    color: '#0088CC',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  btnSubmitLoading: {
    opacity: 0.6,
    borderColor: 'rgba(0, 136, 204, 0.5)',
  },

  // ============ UTILITY STYLES ============
  textSecondary: {
    color: 'rgba(224, 242, 254, 0.7)',
    fontSize: 13,
    fontWeight: '600',
  },

  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },

  inputColumn: {
    flex: 1,
  },

  // ============ SPINNER ============
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    borderTopColor: '#00D9FF',
    animation: 'spin 1s linear infinite',
  },

  // ============ NEON GLITCH EFFECT ============
  neonGlitch: {
    textShadow: '0 0 10px rgba(0, 217, 255, 0.5)',
  },

  // ============ IMAGE UPLOAD BOX ============
  imageUploadBox: {
    backgroundColor: '#0F1619',
    borderWidth: 1,
    borderColor: '#2D3E52',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },

  imageUploadText: {
    color: '#0088CC',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ============ BUTTON STYLES FOR INLINE ============
  btnNovoInline: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0E7490',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    transition: 'all 0.3s ease',
  },

  btnNovoInlineSmall: {
    width: 180,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E7490',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    transition: 'all 0.3s ease',
  },
  
  btnNovoInlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default modernStyles;
