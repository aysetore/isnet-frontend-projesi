import { useEffect, useState, type FormEvent } from 'react';
import { FaTrashAlt, FaEdit, FaListUl } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Modal from './Modal';
import SiparisEkleForm from './SiparisEkleForm';
import SiparisGuncelleForm from './SiparisGuncelleForm';
import { apiFetch } from '../api';
import type { Siparis, Musteri, Personel, Urun, SiparisDetay } from '../types';



export default function SiparislerTablosu() {
    const [siparisler, setSiparisler] = useState<Siparis[]>([]);
    const [musteriler, setMusteriler] = useState<Musteri[]>([]);
    const [personeller, setPersoneller] = useState<Personel[]>([]);
    const [urunler, setUrunler] = useState<Urun[]>([]);
    const [isEkleModalOpen, setIsEkleModalOpen] = useState(false);
    const [isGuncelleModalOpen, setIsGuncelleModalOpen] = useState(false);
    const [seciliSiparis, setSeciliSiparis] = useState<Siparis | null>(null);

    // Sipariş Detay State'leri
    const [isDetayModalOpen, setIsDetayModalOpen] = useState(false);
    const [aktifSiparisId, setAktifSiparisId] = useState<number | null>(null);
    const [siparisDetaylari, setSiparisDetaylari] = useState<SiparisDetay[]>([]);
    const [secilenUrunKodu, setSecilenUrunKodu] = useState<string>('');
    const [adet, setAdet] = useState<number>(1);

    // Düzenlenen Detay Takibi için State
    const [seciliDetayId, setSeciliDetayId] = useState<number | null>(null);

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true
    });

    const siparisleriGetir = () => {
        apiFetch('/Siparisler')
            .then(res => res.json())
            .then(data => {
                const hamListe = data.data || data.Data || (Array.isArray(data) ? data : []);

                const duzenlenmisListe = hamListe.map((item: any) => {
                    const keys = Object.keys(item);
                    const findKey = (search: string) => keys.find(k => k.toLowerCase() === search.toLowerCase());

                    const musteriKey = findKey('musterilerId') || findKey('customerId') || findKey('musteriid');
                    const personelKey = findKey('personelId') || findKey('personelid') || findKey('personnelid');
                    const idKey = findKey('id');

                    return {
                        id: idKey ? Number(item[idKey]) : 0,
                        musterilerId: musteriKey ? Number(item[musteriKey]) : 0,
                        personelId: personelKey ? Number(item[personelKey]) : 0,
                        tarih: item.tarih ?? item.Tarih ?? item.sipariTarihi
                    };
                });

                setSiparisler(duzenlenmisListe);
            })
            .catch(err => console.error('Siparişler çekilirken hata:', err));
    };

    const musterileriGetir = () => {
        apiFetch('/Musteriler')
            .then(res => res.json())
            .then(data => {
                const liste = data.data || data.Data || (Array.isArray(data) ? data : []);
                setMusteriler(liste);
            })
            .catch(err => console.error('Müşteriler çekilirken hata:', err));
    };

    const personelleriGetir = () => {
        apiFetch('/Personeller')
            .then(res => res.json())
            .then(data => {
                const liste = data.data || data.Data || (Array.isArray(data) ? data : []);
                setPersoneller(liste);
            })
            .catch(err => console.error('Personeller çekilirken hata:', err));
    };

    const urunleriGetir = () => {
        apiFetch('/Urunler')
            .then(res => res.json())
            .then(data => {
                const liste = data.data || data.Data || (Array.isArray(data) ? data : []);
                const duzenlenmisUrunler = liste.map((u: any) => {
                    const keys = Object.keys(u);
                    const findKey = (s: string) => keys.find(k => k.toLowerCase() === s.toLowerCase());

                    const adKey = findKey('ad') || findKey('urunAdi') || findKey('name');
                    const kodKey = findKey('urunKodu') || findKey('productCode');

                    return {
                        ad: adKey ? u[adKey] : 'Ürün',
                        urunKodu: kodKey ? String(u[kodKey]) : (u.urunKodu || '')
                    };
                });
                setUrunler(duzenlenmisUrunler);
            })
            .catch(err => console.error('Ürünler çekilirken hata:', err));
    };

    useEffect(() => {
        siparisleriGetir();
        musterileriGetir();
        personelleriGetir();
        urunleriGetir();
    }, []);

    const getMusteriAdi = (musteriId: number) => {
        const musteri = musteriler.find((m: any) => Number(m.id ?? m.Id) === Number(musteriId));
        if (!musteri) return `Müşteri ID: ${musteriId}`;
        const ad = musteri.ad || musteri.Adi || musteri.musteriAdi || '';
        const soyad = musteri.soyad || '';
        return `${ad} ${soyad}`.trim() || `Müşteri ID: ${musteriId}`;
    };

    const getPersonelAdi = (personelId: number) => {
        const personel = personeller.find((p: any) => Number(p.id ?? p.Id) === Number(personelId));
        if (!personel) return `Personel ID: ${personelId}`;
        const ad = personel.ad || personel.Adi || personel.personelAdi || '';
        const soyad = personel.soyad || '';
        return `${ad} ${soyad}`.trim() || `Personel ID: ${personelId}`;
    };

    const detaylariAc = async (siparisId: number) => {
        setAktifSiparisId(siparisId);
        setIsDetayModalOpen(true);
        formuSifirla();
        try {
            const res = await apiFetch(`/SiparisDetay?siparisId=${siparisId}`);
            const data = await res.json();
            const liste = data.data || data.Data || (Array.isArray(data) ? data : []);

            const islenenListe = liste.map((d: any) => {
                const keys = Object.keys(d);
                const findKey = (s: string) => keys.find(k => k.toLowerCase() === s.toLowerCase());

                const sIdKey = findKey('siparislerId') || findKey('siparisId');
                const kodKey = findKey('urunKodu');
                const uIdKey = findKey('urunId');
                const adetKey = findKey('adet') || findKey('quantity');
                const idKey = findKey('id') || findKey('siparisDetayId') || findKey('siparisdetayid');

                return {
                    id: idKey ? Number(d[idKey]) : 0,
                    siparisId: sIdKey ? Number(d[sIdKey]) : 0,
                    urunKodu: kodKey ? String(d[kodKey]) : (uIdKey ? String(d[uIdKey]) : ''),
                    adet: adetKey ? Number(d[adetKey]) : 1
                };
            });

            const filtrelenmis = islenenListe.filter((d: any) => Number(d.siparisId) === Number(siparisId));
            setSiparisDetaylari(filtrelenmis);
        } catch (err) {
            console.error('Detaylar getirilemedi:', err);
            setSiparisDetaylari([]);
        }
    };

    const formuSifirla = () => {
        setSecilenUrunKodu('');
        setAdet(1);
        setSeciliDetayId(null);
    };

    const detaySec = (detay: SiparisDetay) => {
        setSeciliDetayId(detay.id);
        setSecilenUrunKodu(detay.urunKodu || '');
        setAdet(detay.adet);
    };

    const handleDetayKaydet = async (e: FormEvent) => {
        e.preventDefault();
        if (!aktifSiparisId || !secilenUrunKodu) return;

        const bulunanUrun = urunler.find((u: any) =>
            String(u.urunKodu) === String(secilenUrunKodu)
        );

        const urunIdNum = bulunanUrun ? bulunanUrun.urunKodu : Number(secilenUrunKodu) || 0;

        const bodyData = {
            Id: seciliDetayId ? Number(seciliDetayId) : 0,
            SiparislerId: Number(aktifSiparisId),
            UrunKodu: urunIdNum,
            Adet: Number(adet)
        };

        const endpoint = seciliDetayId ? `/SiparisDetay/${seciliDetayId}` : '/SiparisDetay';
        const method = seciliDetayId ? 'PUT' : 'POST';

        try {
            const res = await apiFetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            if (res.ok) {
                Toast.fire({ icon: 'success', title: seciliDetayId ? 'Ürün detayı güncellendi!' : 'Ürün siparişe eklendi!' });
                detaylariAc(aktifSiparisId);
                formuSifirla();
            } else {
                const errData = await res.text();
                console.error("Backend hata detayı:", errData);
                Toast.fire({ icon: 'error', title: 'İşlem başarısız oldu!' });
            }
        } catch (err) {
            console.error("Bağlantı hatası:", err);
            Toast.fire({ icon: 'error', title: 'Sunucuya ulaşılamadı!' });
        }
    };

    const handleDetaySil = async (detayIdToDel?: number) => {
        const targetId = detayIdToDel || seciliDetayId;
        if (!targetId || !aktifSiparisId) return;

        Swal.fire({
            title: 'Emin misiniz?',
            text: 'Seçilen sipariş detayını silmek istediğinize emin misiniz?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await apiFetch(`/SiparisDetay/${targetId}`, { method: 'DELETE' });
                    if (res.ok) {
                        Toast.fire({ icon: 'success', title: 'Detay silindi!' });
                        detaylariAc(aktifSiparisId);
                        formuSifirla();
                    } else {
                        Toast.fire({ icon: 'error', title: 'Silinemedi!' });
                    }
                } catch (err) {
                    console.error('Silme hatası:', err);
                    Toast.fire({ icon: 'error', title: 'Sunucuya ulaşılamadı!' });
                }
            }
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Emin misiniz?',
            text: `${id} ID numaralı siparişi silmek istediğinize emin misiniz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç'
        }).then((result) => {
            if (result.isConfirmed) {
                apiFetch(`/Siparisler/${id}`, { method: 'DELETE' }).then(res => {
                    if (res.ok) {
                        setSiparisler(prev => prev.filter(item => item.id !== id));
                        Toast.fire({ icon: 'success', title: 'Sipariş silindi!' });
                    } else {
                        Toast.fire({ icon: 'error', title: 'Silinemedi!' });
                    }
                });
            }
        });
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Sipariş Listesi</h2>
                <button
                    onClick={() => setIsEkleModalOpen(true)}
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Yeni Sipariş Ekle
                </button>
            </div>

            <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                        <th>ID</th>
                        <th>Müşteri Adı Soyadı</th>
                        <th>Personel Adı Soyadı</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {siparisler.length > 0 ? (
                        siparisler.map(siparis => (
                            <tr key={siparis.id}>
                                <td>{siparis.id}</td>
                                <td>{getMusteriAdi(siparis.musterilerId)}</td>
                                <td>{getPersonelAdi(siparis.personelId)}</td>
                                <td>
                                    <button
                                        onClick={() => detaylariAc(siparis.id)}
                                        title="Sipariş Detayları / Ürünler"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#17a2b8', fontSize: '18px', marginRight: '10px' }}
                                    >
                                        <FaListUl />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const duzeltilmisSiparis: Siparis = {
                                                ...siparis,
                                                id: siparis.id ?? (siparis as any).ID
                                            };
                                            setSeciliSiparis(duzeltilmisSiparis);
                                            setIsGuncelleModalOpen(true);
                                        }}
                                        title="Düzenle"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffc107', fontSize: '18px', marginRight: '10px' }}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(siparis.id)}
                                        title="Sil"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '18px' }}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Yükleniyor ...</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Yeni Sipariş Ekle Modal */}
            <Modal isOpen={isEkleModalOpen} onClose={() => setIsEkleModalOpen(false)} baslik="Yeni Sipariş Ekle">
                <SiparisEkleForm
                    onClose={() => setIsEkleModalOpen(false)}
                    onSiparisEklendi={() => siparisleriGetir()}
                />
            </Modal>

            {/* Sipariş Güncelle Modal */}
            {seciliSiparis && (
                <Modal isOpen={isGuncelleModalOpen} onClose={() => setIsGuncelleModalOpen(false)} baslik="Sipariş Düzenle">
                    <SiparisGuncelleForm
                        seciliSiparis={seciliSiparis}
                        onClose={() => setIsGuncelleModalOpen(false)}
                        onSiparisGuncellendi={() => siparisleriGetir()}
                    />
                </Modal>
            )}

            {/* Sipariş Detay Yönetim Modal'ı (Form Üstte, Tablo Altta) */}
            <Modal isOpen={isDetayModalOpen} onClose={() => setIsDetayModalOpen(false)} baslik={`Sipariş Detayları (Sipariş ID: ${aktifSiparisId})`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '520px', maxHeight: '80vh', overflowY: 'auto', boxSizing: 'border-box', padding: '10px' }}>

                    {/* 1. Üst Kısım: Ürün Ekleme / Güncelleme Formu */}
                    <form onSubmit={handleDetayKaydet} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box', background: '#f1f1f1', padding: '12px', borderRadius: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0 }}>{seciliDetayId ? 'Ürün Detayını Düzenle' : 'Siparişe Ürün Ekle'}</h4>
                            {seciliDetayId && (
                                <button
                                    type="button"
                                    onClick={formuSifirla}
                                    style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                                >
                                    Yeni Ekleme Moduna Dön
                                </button>
                            )}
                        </div>

                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ürün Seç</label>
                            <select
                                value={secilenUrunKodu}
                                onChange={e => setSecilenUrunKodu(e.target.value)}
                                required
                                style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', boxSizing: 'border-box' }}
                            >
                                <option value="">Ürün Seçiniz</option>
                                {urunler.map((u, index) => (
                                    <option key={u.id || index} value={u.urunKodu}>
                                        {u.ad} ({u.urunKodu})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Adet</label>
                            <input
                                type="number"
                                min="1"
                                value={adet}
                                onChange={e => setAdet(Number(e.target.value))}
                                required
                                style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px', width: '100%', boxSizing: 'border-box' }}>
                            <button
                                type="submit"
                                style={{ flex: 1, height: '38px', backgroundColor: seciliDetayId ? '#ffc107' : '#28a745', color: seciliDetayId ? '#000' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                {seciliDetayId ? 'Detayı Güncelle' : 'Ürünü Siparişe Ekle'}
                            </button>
                            {seciliDetayId && (
                                <button
                                    type="button"
                                    onClick={() => handleDetaySil()}
                                    style={{ height: '38px', padding: '0 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Sil
                                </button>
                            )}
                        </div>
                    </form>

                    <hr style={{ border: '0', borderTop: '1px solid #ddd', margin: '0', width: '100%' }} />

                    {/* 2. Alt Kısım: Mevcut Sipariş Detayları Tablosu */}
                    <div style={{ width: '100%', boxSizing: 'border-box' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>Siparişteki Ürünler</h4>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
                            <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse', margin: 0, boxSizing: 'border-box' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
                                        <th style={{ background: '#f8f9fa', textAlign: 'left' }}>Ürün Adı</th>
                                        <th style={{ background: '#f8f9fa', textAlign: 'left' }}>Ürün Kodu</th>
                                        <th style={{ background: '#f8f9fa', textAlign: 'left' }}>Adet</th>
                                        <th style={{ background: '#f8f9fa', textAlign: 'center', width: '70px' }}>İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {siparisDetaylari.length > 0 ? (
                                        siparisDetaylari.map((detay: any, index: number) => {
                                            const bulunanUrun = urunler.find(u => String(u.urunKodu) === String(detay.urunKodu));
                                            const urunAdi = bulunanUrun ? bulunanUrun.ad : 'Bilinmeyen Ürün';

                                            return (
                                                <tr
                                                    key={detay.id || index}
                                                    onClick={() => detaySec(detay)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        backgroundColor: seciliDetayId === detay.id ? '#e2e6ea' : 'transparent'
                                                    }}
                                                    title="Düzenlemek için tıklayın"
                                                >
                                                    <td>{urunAdi}</td>
                                                    <td>{detay.urunKodu}</td>
                                                    <td>{detay.adet}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDetaySil(detay.id);
                                                            }}
                                                            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
                                                            title="Bu ürünü sil"
                                                        >
                                                            Sil
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', color: '#666', padding: '15px' }}>Bu siparişe henüz ürün eklenmemiş.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </Modal>
        </div>
    );
}