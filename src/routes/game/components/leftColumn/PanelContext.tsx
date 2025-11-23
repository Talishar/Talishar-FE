import React, { createContext, useContext, useState } from 'react';

interface PanelContextType {
  isDevToolOpen: boolean;
  setIsDevToolOpen: (open: boolean) => void;
  isManualModeOpen: boolean;
  setIsManualModeOpen: (open: boolean) => void;
}

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [isDevToolOpen, setIsDevToolOpen] = useState(false);
  const [isManualModeOpen, setIsManualModeOpen] = useState(false);

  return (
    <PanelContext.Provider value={{ isDevToolOpen, setIsDevToolOpen, isManualModeOpen, setIsManualModeOpen }}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanelContext() {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanelContext must be used within PanelProvider');
  }
  return context;
}
