import { useState, type FormEvent, type ChangeEvent } from "react";
import { apiFetch } from "../api";
import Swal from "sweetalert2";
import type { Musteri, Personel } from "../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface SiparisEkleFormProps {
    onClose: () => void;
    onSiparisEklendi: () => void;
}

export default function SiparisEkleForm({
    onClose,
    onSiparisEklendi,
}: SiparisEkleFormProps) {
    const [musteriId, setMusteriId] = useState<string>("");
    const [personelId, setPersonelId] = useState<string>("");

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
    // SİPARİŞ EKLEME
    // =========================================================
    const siparisEkleMutation = useMutation({
        mutationFn: async () => {
            const res = await apiFetch("/Siparisler", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    musteriId: Number(musteriId),
                    personelId: Number(personelId),
                }),
            });

            if (!res.ok) {
                throw new Error("Sipariş eklenemedi.");
            }

            return res;
        },

        onSuccess: async () => {
            // Sipariş listesi cache'ini güncelle
            await queryClient.invalidateQueries({
                queryKey: ["siparisler"],
            });

            // Mevcut yapımızla uyumlu olması için
            // parent component'e de haber veriyoruz.
            onSiparisEklendi();

            onClose();

            Swal.fire("Başarılı!", "Sipariş başarıyla eklendi.", "success");
        },

        onError: () => {
            Swal.fire("Hata!", "Sipariş eklenemedi.", "error");
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

        siparisEkleMutation.mutate();
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

            {/* KAYDET */}
            <button
                type="submit"
                disabled={yukleniyor || siparisEkleMutation.isPending}
                style={{
                    padding: "10px",
                    backgroundColor:
                        yukleniyor || siparisEkleMutation.isPending
                            ? "#999"
                            : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                        yukleniyor || siparisEkleMutation.isPending
                            ? "not-allowed"
                            : "pointer",
                    fontWeight: "bold",
                }}
            >
                {siparisEkleMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
        </form>
    );
}
