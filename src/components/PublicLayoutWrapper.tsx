'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ModalProvider, useModal } from '@/context/ModalContext';
import { IS_DESIGN_PREVIEW } from '@/lib/showroom';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import EnquiryModal from './EnquiryModal';

function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  const { isEnquiryOpen, selectedVehicle, source, openEnquiry, closeEnquiry } =
    useModal();
  useEffect(() => {
    try {
      if (sessionStorage.getItem('gm-welcome-seen')) return;
    } catch {
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        if (
          !sessionStorage.getItem('gm-welcome-seen') &&
          !document.querySelector('dialog[open]')
        ) {
          openEnquiry('', 'WELCOME_CALLBACK');
        }
      } catch {
        /* The website remains usable when storage is blocked. */
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [openEnquiry]);
  return (
    <div className="public-site">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {IS_DESIGN_PREVIEW && (
        <div className="preview-strip">
          <span className="preview-dot" /> Design draft{' '}
          <span className="preview-description">
            Sample vehicles & prices. No enquiries are sent.
          </span>
        </div>
      )}
      <Header onOpenEnquiry={openEnquiry} />
      <main id="main-content">{children}</main>
      <Footer />
      <MobileBottomNav
        onOpenEnquiry={() => openEnquiry('', 'CALLBACK_REQUEST')}
      />
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={closeEnquiry}
        defaultVehicle={selectedVehicle}
        source={source}
      />
    </div>
  );
}
export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return <>{children}</>;
  return (
    <ModalProvider>
      <PublicLayoutContent>{children}</PublicLayoutContent>
    </ModalProvider>
  );
}
