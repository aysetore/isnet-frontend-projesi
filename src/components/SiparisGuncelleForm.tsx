import { useState, type FormEvent, type ChangeEvent } from "react";
import { apiFetch } from "../api";
import Swal from "sweetalert2";
import type { Musteri, Personel, Siparis } from "../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface SiparisGuncelleFormProps {
    seciliSiparis: Siparis;
    onClose: () => void;
    onSiparisGuncellendi: () => void;
}

export default function SiparisGuncelleForm({
    seciliSiparis,
    onClose,
    onSiparisGuncellendi,
}: SiparisGuncelleFormProps) {
    const [musteriId, setMusteriId] = useState<string>(
        String(seciliSiparis.musterilerId),
    );

    const [personelId, setPersonelId] = useState<string>(
        String(seciliSiparis.personelId),
    );

    const queryClient = useQueryClient();

    // =========================================================
    // MÜŞTERİLER
    // =========================================================
    const { data: musteriler = [], isLoading: musterilerYukleniyor } = useQuery<
        Musteri[]
    >({
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

    // =========================================================
    // PERSONELLER
    // =========================================================
    const { data: personeller = [], isLoading: personellerYukleniyor } =
        useQuery<Personel[]>({
            queryKey: ["personeller"],
            queryFn: async () => {
                const res = await apiFetch("/Personeller");

                if (!res.ok) {
                    throw new Error("Personeller getirilemedi.");
                }

                const data = await res.json();

                return (
                    data.data || data.Data || (Array.isArray(data) ? data : [])
                );
            },
        });

    // =========================================================
    // SİPARİŞ GÜNCELLEME
    // =========================================================
    const siparisGuncelleMutation = useMutation({
        mutationFn: async () => {
            const updated = {
                id: Number(seciliSiparis.id),
                ID: Number(seciliSiparis.id),

                musterilerId: Number(musteriId),
                MusterilerId: Number(musteriId),
                musteriId: Number(musteriId),
                MusteriId: Number(musteriId),

                personelId: Number(personelId),
                PersonelId: Number(personelId),
            };

            const res = await apiFetch(`/Siparisler/${seciliSiparis.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updated),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("Güncelleme hatası detayı:", errText);

                throw new Error("Sipariş güncellenemedi.");
            }

            return res;
        },

        onSuccess: async () => {
            // Siparişler listesini yeniden getir
            await queryClient.invalidateQueries({
                queryKey: ["siparisler"],
            });

            // Mevcut parent yapısıyla uyumlu kalıyoruz
            onSiparisGuncellendi();

            onClose();

            Swal.fire("Başarılı!", "Sipariş güncellendi.", "success");
        },

        onError: () => {
            Swal.fire("Hata!", "Güncelleme başarısız.", "error");
        },
    });

    // =========================================================
    // FORM SUBMIT
    // =========================================================
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!musteriId || !personelId) {
            Swal.fire(
                "Uyarı!",
                "Lütfen müşteri ve personel seçiniz.",
                "warning",
            );
            return;
        }

        siparisGuncelleMutation.mutate();
    };

    const yukleniyor = musterilerYukleniyor || personellerYukleniyor;

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                padding: "10px",
                minWidth: "300px",
            }}
        >
            {/* MÜŞTERİ */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                }}
            >
                <label
                    style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                    }}
                >
                    Müşteri Seç
                </label>

                <select
                    value={musteriId}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setMusteriId(e.target.value)
                    }
                    required
                    disabled={musterilerYukleniyor}
                    style={{
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                >
                    <option value="">
                        {musterilerYukleniyor
                            ? "Müşteriler yükleniyor..."
                            : "Müşteri Seçiniz"}
                    </option>

                    {musteriler.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.ad || ""} {m.soyad || ""}
                        </option>
                    ))}
                </select>
            </div>

            {/* PERSONEL */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                }}
            >
                <label
                    style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                    }}
                >
                    Personel Seç
                </label>

                <select
                    value={personelId}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setPersonelId(e.target.value)
                    }
                    required
                    disabled={personellerYukleniyor}
                    style={{
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                >
                    <option value="">
                        {personellerYukleniyor
                            ? "Personeller yükleniyor..."
                            : "Personel Seçiniz"}
                    </option>

                    {personeller.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.ad || ""} {p.soyad || ""}
                        </option>
                    ))}
                </select>
            </div>

            {/* GÜNCELLE */}
            <button
                type="submit"
                disabled={yukleniyor || siparisGuncelleMutation.isPending}
                style={{
                    padding: "10px",
                    backgroundColor:
                        yukleniyor || siparisGuncelleMutation.isPending
                            ? "#999"
                            : "#ffc107",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                        yukleniyor || siparisGuncelleMutation.isPending
                            ? "not-allowed"
                            : "pointer",
                    fontWeight: "bold",
                }}
            >
                {siparisGuncelleMutation.isPending
                    ? "Güncelleniyor..."
                    : "Güncelle"}
            </button>
        </form>
    );
}
