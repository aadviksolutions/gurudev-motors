'use client';

import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  isEnquiryOpen: boolean;
  selectedVehicle: string;
  openEnquiry: (vehicle?: string) => void;
  closeEnquiry: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isEnquiryOpen: false,
  selectedVehicle: '',
  openEnquiry: () => {},
  closeEnquiry: () => {},
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const openEnquiry = (vehicle?: string) => {
    setSelectedVehicle(vehicle || '');
    setIsEnquiryOpen(true);
  };

  const closeEnquiry = () => {
    setIsEnquiryOpen(false);
  };

  return (
    <ModalContext.Provider value={{ isEnquiryOpen, selectedVehicle, openEnquiry, closeEnquiry }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
