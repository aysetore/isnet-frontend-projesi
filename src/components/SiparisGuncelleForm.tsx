import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { apiFetch } from '../api';
import Swal from 'sweetalert2';

interface Kisi {
    id: number;
    ad?: string;
    soyad?: string;
    adSoyad?: string;
}

interface Siparis {
    id: number;
    musterilerId: number;
    personelId: number;
}

interface SiparisGuncelleFormProps {
    seciliSiparis: Siparis;
    onClose: () => void;
    onSiparisGuncellendi: (guncelSiparis: Siparis) => void;
}

export default function SiparisGuncelleForm({ seciliSiparis, onClose, onSiparisGuncellendi }: SiparisGuncelleFormProps) {
    const [musteriler, setMusteriler] = useState<Kisi[]>([]);
    const [personeller, setPersoneller] = useState<Kisi[]>([]);
    const [musteriId, setMusteriId] = useState<string>(String(seciliSiparis.musterilerId));
    const [personelId, setPersonelId] = useState<string>(String(seciliSiparis.personelId));

    useEffect(() => {
        const fetchLists = async () => {
            const [mRes, pRes] = await Promise.all([apiFetch('/Musteriler'), apiFetch('/Personeller')]);
            const mData = await mRes.json();
            const pData = await pRes.json();
            setMusteriler(mData.data || mData.Data || mData || []);
            setPersoneller(pData.data || pData.Data || pData || []);
        };
        fetchLists();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const updated = {
            id: Number(seciliSiparis.id),
            ID: Number(seciliSiparis.id),
            musterilerId: Number(musteriId),
            MusterilerId: Number(musteriId),
            musteriId: Number(musteriId),
            MusteriId: Number(musteriId),
            personelId: Number(personelId),
            PersonelId: Number(personelId)
        };

        const res = await apiFetch(`/Siparisler/${seciliSiparis.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });

        if (res.ok) {
            onSiparisGuncellendi(seciliSiparis);
            onClose();
            Swal.fire('Başarılı!', 'Sipariş güncellendi.', 'success');
        } else {
            const errText = await res.text();
            console.error("Güncelleme hatası detayı:", errText);
            Swal.fire('Hata!', 'Güncelleme başarısız.', 'error');
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

            <button type="submit" style={{ padding: '10px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Güncelle
            </button>
        </form>
    );
}