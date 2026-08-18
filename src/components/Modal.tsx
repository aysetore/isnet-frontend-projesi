import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    baslik: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, baslik, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '90px', borderRadius: '40px', width: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>{baslik}</h3>
                    <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}