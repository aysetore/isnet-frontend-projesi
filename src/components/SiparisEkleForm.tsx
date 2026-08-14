import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { apiFetch } from '../api';
import Swal from 'sweetalert2';

interface Kisi {
    id: number;
    ad?: string;
    soyad?: string;
    adSoyad?: string;
}

interface SiparisEkleFormProps {
    onClose: () => void;
    onSiparisEklendi: (yeniSiparis: object) => void;
}

export default function SiparisEkleForm({ onClose, onSiparisEklendi }: SiparisEkleFormProps) {
    const [musteriler, setMusteriler] = useState<Kisi[]>([]);
    const [personeller, setPersoneller] = useState<Kisi[]>([]);
    const [musteriId, setMusteriId] = useState<string>('');
    const [personelId, setPersonelId] = useState<string>('');

    const fetchData = async () => {
        const [mRes, pRes] = await Promise.all([apiFetch('/Musteriler'), apiFetch('/Personeller')]);
        const mData = await mRes.json();
        const pData = await pRes.json();

        setMusteriler(mData.data || mData.Data || mData || []);
        setPersoneller(pData.data || pData.Data || pData || []);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const res = await apiFetch('/Siparisler', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ musteriId: Number(musteriId), personelId: Number(personelId) })
        });

        if (res.ok) {
            const data = await res.json();
            onSiparisEklendi(data);
            onClose();
            Swal.fire('Başarılı!', 'Sipariş başarıyla eklendi.', 'success');
        } else {
            Swal.fire('Hata!', 'Sipariş eklenemedi.', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px', minWidth: '300px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Müşteri Seç</label>
                <select value={musteriId} onChange={(e: ChangeEvent<HTMLSelectElement>) => setMusteriId(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="">Müşteri Seçiniz</option>
                    {musteriler.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.ad || m.adSoyad} {m.soyad || ''}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Personel Seç</label>
                <select value={personelId} onChange={(e: ChangeEvent<HTMLSelectElement>) => setPersonelId(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="">Personel Seçiniz</option>
                    {personeller.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.ad || p.adSoyad} {p.soyad || ''}
                        </option>
                    ))}
                </select>
            </div>

            <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Kaydet
            </button>
        </form>
    );
}