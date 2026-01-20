import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ButtonDisableContextType {
  isDisabled: boolean;
  triggerDisable: () => void;
}

const ButtonDisableContext = createContext<ButtonDisableContextType | undefined>(undefined);

interface ButtonDisableProviderProps {
  children: ReactNode;
  disableDuration?: number;
}

export const ButtonDisableProvider: React.FC<ButtonDisableProviderProps> = ({ 
  children, 
  disableDuration = 2000 
}) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const triggerDisable = () => {
    setIsDisabled(true);
  };

  useEffect(() => {
    if (isDisabled) {
      const timer = setTimeout(() => {
        setIsDisabled(false);
      }, disableDuration);
      return () => clearTimeout(timer);
    }
  }, [isDisabled, disableDuration]);

  return (
    <ButtonDisableContext.Provider value={{ isDisabled, triggerDisable }}>
      {children}
    </ButtonDisableContext.Provider>
  );
};

export const useButtonDisableContext = (): ButtonDisableContextType => {
  const context = useContext(ButtonDisableContext);
  if (!context) {
    throw new Error('useButtonDisableContext must be used within ButtonDisableProvider');
  }
  return context;
};
