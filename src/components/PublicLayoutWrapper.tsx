'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ModalProvider, useModal } from '@/context/ModalContext';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import MobileStickyActions from './MobileStickyActions';
import EnquiryModal from './EnquiryModal';

function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  const { isEnquiryOpen, selectedVehicle, openEnquiry, closeEnquiry } = useModal();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header onOpenEnquiry={openEnquiry} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileStickyActions />
      <MobileBottomNav onOpenEnquiry={() => openEnquiry()} />
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={closeEnquiry}
        defaultVehicle={selectedVehicle}
      />
    </div>
  );
}

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <ModalProvider>
      <PublicLayoutContent>{children}</PublicLayoutContent>
    </ModalProvider>
  );
}
