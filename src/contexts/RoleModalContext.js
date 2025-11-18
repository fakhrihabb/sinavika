'use client';
import { createContext, useContext, useState } from 'react';
import RoleModal from '@/components/RoleModal';

const RoleModalContext = createContext();

export function RoleModalProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <RoleModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <RoleModal isOpen={isModalOpen} onClose={closeModal} />
    </RoleModalContext.Provider>
  );
}

export function useRoleModal() {
  const context = useContext(RoleModalContext);
  if (!context) {
    throw new Error('useRoleModal must be used within RoleModalProvider');
  }
  return context;
}
