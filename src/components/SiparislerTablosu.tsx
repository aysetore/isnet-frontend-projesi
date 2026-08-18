import { useState, type FormEvent } from "react";
import { FaTrashAlt, FaEdit, FaListUl } from "react-icons/fa";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Modal from "./Modal";
import SiparisEkleForm from "./SiparisEkleForm";
import SiparisGuncelleForm from "./SiparisGuncelleForm";
import { apiFetch } from "../api";
import type { Siparis, Musteri, Personel, Urun, SiparisDetay } from "../types";
import { Toast } from "../utils";

export default function SiparislerTablosu() {
    const queryClient = useQueryClient();

    const [isEkleModalOpen, setIsEkleModalOpen] = useState(false);
    const [isGuncelleModalOpen, setIsGuncelleModalOpen] = useState(false);
    const [seciliSiparis, setSeciliSiparis] = useState<Siparis | null>(null);

    const [isDetayModalOpen, setIsDetayModalOpen] = useState(false);
    const [aktifSiparisId, setAktifSiparisId] = useState<number | null>(null);

    const [secilenUrunKodu, setSecilenUrunKodu] = useState("");
    const [adet, setAdet] = useState(1);
    const [seciliDetayId, setSeciliDetayId] = useState<number | null>(null);

    const { data: siparisler = [], isLoading: siparislerYukleniyor } = useQuery<
        Siparis[]
    >({
        queryKey: ["siparisler"],
        queryFn: async () => {
            const res = await apiFetch("/Siparisler");

            if (!res.ok) {
                throw new Error("Siparişler getirilemedi.");
            }

            const data = await res.json();

            const hamListe =
                data.data || data.Data || (Array.isArray(data) ? data : []);

            return hamListe.map((item: any) => {
                const keys = Object.keys(item);

                const findKey = (search: string) =>
                    keys.find((k) => k.toLowerCase() === search.toLowerCase());

                const musteriKey =
                    findKey("musterilerId") ||
                    findKey("customerId") ||
                    findKey("musteriid");

                const personelKey =
                    findKey("personelId") ||
                    findKey("personelid") ||
                    findKey("personnelid");

                const idKey = findKey("id");

                return {
                    id: idKey ? Number(item[idKey]) : 0,
                    musterilerId: musteriKey ? Number(item[musteriKey]) : 0,
                    personelId: personelKey ? Number(item[personelKey]) : 0,
                    tarih: item.tarih ?? item.Tarih ?? item.sipariTarihi,
                };
            });
        },
    });

    const { data: musteriler = [] } = useQuery<Musteri[]>({
        queryKey: ["musteriler"],
        queryFn: async () => {
            const res = await apiFetch("/Musteriler");

            if (!res.ok) {
                throw new Error("Müşteriler getirilemedi.");
            }

            const data = await res.json();

            return data.data || data.Data || (Array.isArray(data) ? data : []);
        },
    });

    const { data: personeller = [] } = useQuery<Personel[]>({
        queryKey: ["personeller"],
        queryFn: async () => {
            const res = await apiFetch("/Personeller");

            if (!res.ok) {
                throw new Error("Personeller getirilemedi.");
            }

            const data = await res.json();

            return data.data || data.Data || (Array.isArray(data) ? data : []);
        },
    });

    const { data: urunler = [] } = useQuery<Urun[]>({
        queryKey: ["urunler"],
        queryFn: async () => {
            const res = await apiFetch("/Urunler");

            if (!res.ok) {
                throw new Error("Ürünler getirilemedi.");
            }

            const data = await res.json();

            const liste =
                data.data || data.Data || (Array.isArray(data) ? data : []);

            return liste.map((u: any) => {
                const keys = Object.keys(u);

                const findKey = (search: string) =>
                    keys.find((k) => k.toLowerCase() === search.toLowerCase());

                const adKey =
                    findKey("ad") || findKey("urunAdi") || findKey("name");

                const kodKey = findKey("urunKodu") || findKey("productCode");

                return {
                    ...u,
                    ad: adKey ? u[adKey] : "Ürün",
                    urunKodu: kodKey ? String(u[kodKey]) : u.urunKodu || "",
                };
            });
        },
    });

    const { data: siparisDetaylari = [], isLoading: detaylarYukleniyor } =
        useQuery<SiparisDetay[]>({
            queryKey: ["siparisDetay", aktifSiparisId],
            enabled: aktifSiparisId !== null,
            queryFn: async () => {
                if (aktifSiparisId === null) {
                    return [];
                }

                const res = await apiFetch(
                    `/SiparisDetay?siparisId=${aktifSiparisId}`,
                );

                if (!res.ok) {
                    throw new Error("Sipariş detayları getirilemedi.");
                }

                const data = await res.json();

                const liste =
                    data.data || data.Data || (Array.isArray(data) ? data : []);

                const islenenListe = liste.map((d: any) => {
                    const keys = Object.keys(d);

                    const findKey = (search: string) =>
                        keys.find(
                            (k) => k.toLowerCase() === search.toLowerCase(),
                        );

                    const sIdKey =
                        findKey("siparislerId") || findKey("siparisId");

                    const kodKey = findKey("urunKodu");
                    const uIdKey = findKey("urunId");

                    const adetKey = findKey("adet") || findKey("quantity");

                    const idKey =
                        findKey("id") ||
                        findKey("siparisDetayId") ||
                        findKey("siparisdetayid");

                    return {
                        id: idKey ? Number(d[idKey]) : 0,
                        siparisId: sIdKey ? Number(d[sIdKey]) : 0,
                        urunKodu: kodKey
                            ? String(d[kodKey])
                            : uIdKey
                              ? String(d[uIdKey])
                              : "",
                        adet: adetKey ? Number(d[adetKey]) : 1,
                    };
                });

                return islenenListe.filter(
                    (d: SiparisDetay) =>
                        Number(d.siparisId) === Number(aktifSiparisId),
                );
            },
        });

    const siparisSilMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiFetch(`/Siparisler/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Sipariş silinemedi.");
            }
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["siparisler"],
            });

            Toast.fire({
                icon: "success",
                title: "Sipariş silindi!",
            });
        },

        onError: () => {
            Toast.fire({
                icon: "error",
                title: "Sipariş silinemedi!",
            });
        },
    });

    const detayKaydetMutation = useMutation({
        mutationFn: async ({
            detayId,
            siparisId,
            urunKodu,
            adet,
        }: {
            detayId: number | null;
            siparisId: number;
            urunKodu: string;
            adet: number;
        }) => {
            const bulunanUrun = urunler.find(
                (u: any) => String(u.urunKodu) === String(urunKodu),
            );

            const urunIdNum = bulunanUrun
                ? bulunanUrun.urunKodu
                : Number(urunKodu) || 0;

            const bodyData = {
                Id: detayId ? Number(detayId) : 0,
                SiparislerId: Number(siparisId),
                UrunKodu: urunIdNum,
                Adet: Number(adet),
            };

            const endpoint = detayId
                ? `/SiparisDetay/${detayId}`
                : "/SiparisDetay";

            const method = detayId ? "PUT" : "POST";

            const res = await apiFetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyData),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Backend hata detayı:", errorText);

                throw new Error("Detay kaydedilemedi.");
            }
        },

        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["siparisDetay", variables.siparisId],
            });

            Toast.fire({
                icon: "success",
                title: variables.detayId
                    ? "Ürün detayı güncellendi!"
                    : "Ürün siparişe eklendi!",
            });

            formuSifirla();
        },

        onError: () => {
            Toast.fire({
                icon: "error",
                title: "İşlem başarısız oldu!",
            });
        },
    });

    const detaySilMutation = useMutation({
        mutationFn: async ({
            detayId,
        }: {
            detayId: number;
            siparisId: number;
        }) => {
            const res = await apiFetch(`/SiparisDetay/${detayId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Detay silinemedi.");
            }
        },

        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["siparisDetay", variables.siparisId],
            });

            Toast.fire({
                icon: "success",
                title: "Detay silindi!",
            });

            formuSifirla();
        },

        onError: () => {
            Toast.fire({
                icon: "error",
                title: "Silinemedi!",
            });
        },
    });

    const formuSifirla = () => {
        setSecilenUrunKodu("");
        setAdet(1);
        setSeciliDetayId(null);
    };

    const getMusteriAdi = (musteriId: number) => {
        const musteri = musteriler.find(
            (m: any) => Number(m.id ?? m.Id) === Number(musteriId),
        );

        if (!musteri) {
            return `Müşteri ID: ${musteriId}`;
        }

        const ad = musteri.ad || musteri.Adi || musteri.musteriAdi || "";

        const soyad = musteri.soyad || "";

        return `${ad} ${soyad}`.trim() || `Müşteri ID: ${musteriId}`;
    };

    const getPersonelAdi = (personelId: number) => {
        const personel = personeller.find(
            (p: any) => Number(p.id ?? p.Id) === Number(personelId),
        );

        if (!personel) {
            return `Personel ID: ${personelId}`;
        }

        const ad = personel.ad || personel.Adi || personel.personelAdi || "";

        const soyad = personel.soyad || "";

        return `${ad} ${soyad}`.trim() || `Personel ID: ${personelId}`;
    };

    const detaylariAc = (siparisId: number) => {
        setAktifSiparisId(siparisId);
        setIsDetayModalOpen(true);
        formuSifirla();
    };

    const detaySec = (detay: SiparisDetay) => {
        setSeciliDetayId(detay.id);
        setSecilenUrunKodu(detay.urunKodu || "");
        setAdet(detay.adet);
    };

    const handleDetayKaydet = (e: FormEvent) => {
        e.preventDefault();

        if (!aktifSiparisId || !secilenUrunKodu) {
            return;
        }

        detayKaydetMutation.mutate({
            detayId: seciliDetayId,
            siparisId: aktifSiparisId,
            urunKodu: secilenUrunKodu,
            adet,
        });
    };

    const handleDetaySil = async (detayIdToDel?: number) => {
        const targetId = detayIdToDel || seciliDetayId;

        if (!targetId || !aktifSiparisId) {
            return;
        }

        const result = await Swal.fire({
            title: "Emin misiniz?",
            text: "Seçilen sipariş detayını silmek istediğinize emin misiniz?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Evet, sil!",
            cancelButtonText: "Vazgeç",
        });

        if (!result.isConfirmed) {
            return;
        }

        detaySilMutation.mutate({
            detayId: targetId,
            siparisId: aktifSiparisId,
        });
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Emin misiniz?",
            text: `${id} ID numaralı siparişi silmek istediğinize emin misiniz?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Evet, sil!",
            cancelButtonText: "Vazgeç",
        });

        if (!result.isConfirmed) {
            return;
        }

        await siparisSilMutation.mutateAsync(id);
    };

    return (
        <div
            style={{
                padding: "30px",
                fontFamily: "Arial, sans-serif",
                position: "relative",
            }}
        >
            {/* BAŞLIK */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >
                <h2>Sipariş Listesi</h2>

                <button
                    onClick={() => setIsEkleModalOpen(true)}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    + Yeni Sipariş Ekle
                </button>
            </div>

            {/* SİPARİŞ TABLOSU */}

            <table
                border={1}
                cellPadding={10}
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                }}
            >
                <thead>
                    <tr
                        style={{
                            background: "#f4f4f4",
                            textAlign: "left",
                        }}
                    >
                        <th>ID</th>
                        <th>Müşteri Adı Soyadı</th>
                        <th>Personel Adı Soyadı</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>

                <tbody>
                    {siparislerYukleniyor ? (
                        <tr>
                            <td
                                colSpan={4}
                                style={{
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                            >
                                Yükleniyor...
                            </td>
                        </tr>
                    ) : siparisler.length > 0 ? (
                        siparisler.map((siparis) => (
                            <tr key={siparis.id}>
                                <td>{siparis.id}</td>

                                <td>{getMusteriAdi(siparis.musterilerId)}</td>

                                <td>{getPersonelAdi(siparis.personelId)}</td>

                                <td>
                                    {/* DETAY */}

                                    <button
                                        onClick={() => detaylariAc(siparis.id)}
                                        title="Sipariş Detayları / Ürünler"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#17a2b8",
                                            fontSize: "18px",
                                            marginRight: "10px",
                                        }}
                                    >
                                        <FaListUl />
                                    </button>

                                    {/* DÜZENLE */}

                                    <button
                                        onClick={() => {
                                            const duzeltilmisSiparis: Siparis =
                                                {
                                                    ...siparis,
                                                    id:
                                                        siparis.id ??
                                                        (siparis as any).ID,
                                                };

                                            setSeciliSiparis(
                                                duzeltilmisSiparis,
                                            );

                                            setIsGuncelleModalOpen(true);
                                        }}
                                        title="Düzenle"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#ffc107",
                                            fontSize: "18px",
                                            marginRight: "10px",
                                        }}
                                    >
                                        <FaEdit />
                                    </button>

                                    {/* SİL */}

                                    <button
                                        onClick={() => handleDelete(siparis.id)}
                                        title="Sil"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#dc3545",
                                            fontSize: "18px",
                                        }}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={4}
                                style={{
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                            >
                                Sipariş bulunamadı.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <Modal
                isOpen={isEkleModalOpen}
                onClose={() => setIsEkleModalOpen(false)}
                baslik="Yeni Sipariş Ekle"
            >
                <SiparisEkleForm
                    onClose={() => setIsEkleModalOpen(false)}
                    onSiparisEklendi={() =>
                        queryClient.invalidateQueries({
                            queryKey: ["siparisler"],
                        })
                    }
                />
            </Modal>

            {seciliSiparis && (
                <Modal
                    isOpen={isGuncelleModalOpen}
                    onClose={() => setIsGuncelleModalOpen(false)}
                    baslik="Sipariş Düzenle"
                >
                    <SiparisGuncelleForm
                        seciliSiparis={seciliSiparis}
                        onClose={() => setIsGuncelleModalOpen(false)}
                        onSiparisGuncellendi={() =>
                            queryClient.invalidateQueries({
                                queryKey: ["siparisler"],
                            })
                        }
                    />
                </Modal>
            )}

            <Modal
                isOpen={isDetayModalOpen}
                onClose={() => setIsDetayModalOpen(false)}
                baslik={`Sipariş Detayları (Sipariş ID: ${aktifSiparisId})`}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "520px",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        boxSizing: "border-box",
                        padding: "10px",
                    }}
                >
                    {/* DETAY FORMU */}

                    <form
                        onSubmit={handleDetayKaydet}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            width: "100%",
                            boxSizing: "border-box",
                            background: "#f1f1f1",
                            padding: "12px",
                            borderRadius: "5px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <h4
                                style={{
                                    margin: 0,
                                }}
                            >
                                {seciliDetayId
                                    ? "Ürün Detayını Düzenle"
                                    : "Siparişe Ürün Ekle"}
                            </h4>

                            {seciliDetayId && (
                                <button
                                    type="button"
                                    onClick={formuSifirla}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#007bff",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        textDecoration: "underline",
                                    }}
                                >
                                    Yeni Ekleme Moduna Dön
                                </button>
                            )}
                        </div>

                        {/* ÜRÜN */}

                        <div
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                            }}
                        >
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    marginBottom: "5px",
                                }}
                            >
                                Ürün Seç
                            </label>

                            <select
                                value={secilenUrunKodu}
                                onChange={(e) =>
                                    setSecilenUrunKodu(e.target.value)
                                }
                                required
                                style={{
                                    width: "100%",
                                    height: "38px",
                                    padding: "0 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    backgroundColor: "#fff",
                                    boxSizing: "border-box",
                                }}
                            >
                                <option value="">Ürün Seçiniz</option>

                                {urunler.map((u: any, index) => (
                                    <option
                                        key={u.id || index}
                                        value={u.urunKodu}
                                    >
                                        {u.ad} ({u.urunKodu})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ADET */}

                        <div
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                            }}
                        >
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    marginBottom: "5px",
                                }}
                            >
                                Adet
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={adet}
                                onChange={(e) =>
                                    setAdet(Number(e.target.value))
                                }
                                required
                                style={{
                                    width: "100%",
                                    height: "38px",
                                    padding: "0 8px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    backgroundColor: "#fff",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        {/* BUTONLAR */}

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "5px",
                                width: "100%",
                            }}
                        >
                            <button
                                type="submit"
                                disabled={detayKaydetMutation.isPending}
                                style={{
                                    flex: 1,
                                    height: "38px",
                                    backgroundColor: seciliDetayId
                                        ? "#ffc107"
                                        : "#28a745",
                                    color: seciliDetayId ? "#000" : "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                {detayKaydetMutation.isPending
                                    ? "Kaydediliyor..."
                                    : seciliDetayId
                                      ? "Detayı Güncelle"
                                      : "Ürünü Siparişe Ekle"}
                            </button>

                            {seciliDetayId && (
                                <button
                                    type="button"
                                    disabled={detaySilMutation.isPending}
                                    onClick={() => handleDetaySil()}
                                    style={{
                                        height: "38px",
                                        padding: "0 15px",
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Sil
                                </button>
                            )}
                        </div>
                    </form>

                    <hr
                        style={{
                            border: 0,
                            borderTop: "1px solid #ddd",
                            margin: 0,
                            width: "100%",
                        }}
                    />

                    {/* ÜRÜN TABLOSU */}

                    <div
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        <h4
                            style={{
                                margin: "0 0 10px 0",
                            }}
                        >
                            Siparişteki Ürünler
                        </h4>

                        <div
                            style={{
                                maxHeight: "200px",
                                overflowY: "auto",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                width: "100%",
                            }}
                        >
                            <table
                                border={1}
                                cellPadding={8}
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    margin: 0,
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            background: "#f8f9fa",
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 1,
                                        }}
                                    >
                                        <th
                                            style={{
                                                textAlign: "left",
                                            }}
                                        >
                                            Ürün Adı
                                        </th>

                                        <th
                                            style={{
                                                textAlign: "left",
                                            }}
                                        >
                                            Ürün Kodu
                                        </th>

                                        <th
                                            style={{
                                                textAlign: "left",
                                            }}
                                        >
                                            Adet
                                        </th>

                                        <th
                                            style={{
                                                textAlign: "center",
                                                width: "70px",
                                            }}
                                        >
                                            İşlem
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {detaylarYukleniyor ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                style={{
                                                    textAlign: "center",
                                                    padding: "15px",
                                                }}
                                            >
                                                Detaylar yükleniyor...
                                            </td>
                                        </tr>
                                    ) : siparisDetaylari.length > 0 ? (
                                        siparisDetaylari.map(
                                            (detay: SiparisDetay, index) => {
                                                const bulunanUrun =
                                                    urunler.find(
                                                        (u: any) =>
                                                            String(
                                                                u.urunKodu,
                                                            ) ===
                                                            String(
                                                                detay.urunKodu,
                                                            ),
                                                    );

                                                const urunAdi = bulunanUrun
                                                    ? bulunanUrun.ad
                                                    : "Bilinmeyen Ürün";

                                                return (
                                                    <tr
                                                        key={detay.id || index}
                                                        onClick={() =>
                                                            detaySec(detay)
                                                        }
                                                        style={{
                                                            cursor: "pointer",
                                                            backgroundColor:
                                                                seciliDetayId ===
                                                                detay.id
                                                                    ? "#e2e6ea"
                                                                    : "transparent",
                                                        }}
                                                        title="Düzenlemek için tıklayın"
                                                    >
                                                        <td>{urunAdi}</td>

                                                        <td>
                                                            {detay.urunKodu}
                                                        </td>

                                                        <td>{detay.adet}</td>

                                                        <td
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    detaySilMutation.isPending
                                                                }
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();

                                                                    handleDetaySil(
                                                                        detay.id,
                                                                    );
                                                                }}
                                                                style={{
                                                                    backgroundColor:
                                                                        "#dc3545",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius:
                                                                        "4px",
                                                                    padding:
                                                                        "4px 8px",
                                                                    cursor: "pointer",
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            >
                                                                Sil
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            },
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                style={{
                                                    textAlign: "center",
                                                    color: "#666",
                                                    padding: "15px",
                                                }}
                                            >
                                                Bu siparişe henüz ürün
                                                eklenmemiş.
                                            </td>
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
