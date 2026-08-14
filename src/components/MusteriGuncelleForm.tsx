import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import type { Musteri } from "../types"; // 1. Merkezi tipi import et
import { Toast } from "../utils";

interface MusteriGuncelleFormProps {
    seciliMusteri: Musteri | null;
    onClose: () => void;
    onMusteriGuncellendi: () => void;
}

export default function MusteriGuncelleForm({
    seciliMusteri,
    onClose,
    onMusteriGuncellendi,
}: MusteriGuncelleFormProps) {
    const [id, setId] = useState<number>(0);
    const [ad, setAd] = useState("");
    const [soyad, setSoyad] = useState("");

    useEffect(() => {
        if (seciliMusteri) {
            setId(seciliMusteri.id);
            // Gelen verinin ad veya Adi alanlarından hangisinin dolu olduğunu kontrol et
            setAd(seciliMusteri.ad || "");
            setSoyad(seciliMusteri.soyad || "");
        }
    }, [seciliMusteri]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        const guncelVeri: Musteri = {
            id,
            ad,
            soyad,
        };

        apiFetch(`/Musteriler/${id}`, {
            method: "PUT",
            body: JSON.stringify(guncelVeri),
        })
            .then(async (res) => {
                if (res.ok) {
                    onMusteriGuncellendi();
                    onClose();
                    Toast.fire({
                        icon: "success",
                        title: "Müşteri başarıyla güncellendi!",
                    });
                } else {
                    const hataDetayi = await res.text();
                    console.error("Sunucu Hata Detayı:", hataDetayi);
                    Toast.fire({
                        icon: "error",
                        title: "Güncellenemedi!",
                    });
                }
            })
            .catch((err) => console.error("Bağlantı Hatası:", err));
    };

    return (
        <form
            onSubmit={handleUpdate}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
            <input
                type="number"
                placeholder="ID"
                value={id}
                disabled
                style={{
                    padding: "8px",
                    background: "#e9ecef",
                    cursor: "not-allowed",
                }}
            />
            <input
                type="text"
                placeholder="Müşteri Adı"
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                required
                style={{ padding: "8px" }}
            />
            <input
                type="text"
                placeholder="Müşteri Soyadı"
                value={soyad}
                onChange={(e) => setSoyad(e.target.value)}
                required
                style={{ padding: "8px" }}
            />
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "5px",
                    marginTop: "10px",
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    style={{ padding: "6px 12px" }}
                >
                    İptal
                </button>
                <button
                    type="submit"
                    style={{
                        padding: "6px 12px",
                        background: "#ffc107",
                        color: "black",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                    }}
                >
                    Güncelle
                </button>
            </div>
        </form>
    );
}
