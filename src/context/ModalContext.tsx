'use client';
import { createContext, useCallback, useContext, useState } from 'react';

interface ModalContextType {
  isEnquiryOpen: boolean;
  selectedVehicle: string;
  source: string;
  openEnquiry: (vehicle?: string, source?: string) => void;
  closeEnquiry: () => void;
}
const ModalContext = createContext<ModalContextType>({
  isEnquiryOpen: false,
  selectedVehicle: '',
  source: 'CALLBACK_REQUEST',
  openEnquiry: () => {},
  closeEnquiry: () => {},
});
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isEnquiryOpen, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [source, setSource] = useState('CALLBACK_REQUEST');
  const openEnquiry = useCallback(
    (vehicle = '', nextSource = 'VEHICLE_ENQUIRY') => {
      setSelectedVehicle(vehicle);
      setSource(nextSource);
      setOpen(true);
      try {
        sessionStorage.setItem('gm-welcome-seen', '1');
      } catch {
        /* Storage is optional for browsing. */
      }
    },
    [],
  );
  const closeEnquiry = useCallback(() => setOpen(false), []);
  return (
    <ModalContext.Provider
      value={{
        isEnquiryOpen,
        selectedVehicle,
        source,
        openEnquiry,
        closeEnquiry,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}
export const useModal = () => useContext(ModalContext);
