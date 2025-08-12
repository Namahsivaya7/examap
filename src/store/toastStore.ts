import { create } from "zustand";

interface ToastState {
  errorCount: number;
  showErrorModal: boolean;
  lastErrorMessage?: string;
  successCount: number;
  showSuccessModal: boolean;
  lastSuccessMessage?: string;
  isLowConnectivity: boolean;
  success: (m: string, suppress?: boolean) => void;
  error: (m: string, suppress?: boolean, e?: Error) => void;
  setShowSuccessModal: (b: boolean) => void;
  setShowErrorModal: (b: boolean) => void;
  setLowConnectivity: (b: boolean) => void;
}

export const useToast = create<ToastState>((set, get) => ({
  errorCount: 0,
  showErrorModal: false,
  successCount: 0,
  showSuccessModal: false,
  isLowConnectivity: false,
  success: (message: string, suppressModal = false) => {
    set((state) => ({
      lastSuccessMessage: message,
      successCount: state.successCount + 1,
      showSuccessModal: !suppressModal,
    }));
  },
  error: (message: string, suppressModal = false, e?: Error) => {
    set((state) => ({
      lastErrorMessage: message,
      errorCount: state.errorCount + 1,
      showErrorModal: !suppressModal,
    }));
  },
  setShowSuccessModal(showSuccessModal: boolean) {
    set({ showSuccessModal });
  },
  setShowErrorModal(showErrorModal: boolean) {
    set({ showErrorModal });
  },
  setLowConnectivity(isLowConnectivity: boolean) {
    set({ isLowConnectivity });
  },
}));
