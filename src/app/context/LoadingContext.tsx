import { createContext, useContext, ReactNode } from 'react';

interface LoadingContextValue {
  hasPromotionModal: boolean;
  modalRendered: boolean;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ 
  children, 
  hasPromotionModal, 
  modalRendered 
}: { 
  children: ReactNode;
  hasPromotionModal: boolean;
  modalRendered: boolean;
}) {
  return (
    <LoadingContext.Provider value={{ hasPromotionModal, modalRendered }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoadingState() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    // Default values if used outside provider (e.g., admin pages)
    return { hasPromotionModal: false, modalRendered: false };
  }
  return context;
}
