import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import type { Urun } from "../types";
import { Toast } from "../utils";

interface UrunGuncelleFormProps {
    seciliUrun: Urun | null;
    onClose: () => void;
    onUrunGuncellendi: (guncellenenUrun: Urun) => void;
}

export default function UrunGuncelleForm({
    seciliUrun,
    onClose,
    onUrunGuncellendi,
}: UrunGuncelleFormProps) {
    const [urunKodu, setUrunKodu] = useState("");
    const [urunAdi, setUrunAdi] = useState("");

    useEffect(() => {
        if (seciliUrun) {
            setUrunKodu(seciliUrun.urunKodu);
            setUrunAdi(seciliUrun.urunAdi);
        }
    }, [seciliUrun]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        const guncelVeri = {
            UrunKodu: urunKodu,
            UrunAd: urunAdi,
        };

        apiFetch(`/Urunler/${urunKodu}`, {
            method: "PUT",
            body: JSON.stringify(guncelVeri),
        })
            .then(async (res) => {
                if (res.ok) {
                    onUrunGuncellendi({
                        urunKodu,
                        urunAdi,
                        ad: undefined,
                        id: 0,
                    });
                    onClose();
                    Toast.fire({
                        icon: "success",
                        title: "Ürün başarıyla güncellendi!",
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
                type="text"
                placeholder="Ürün Kodu"
                value={urunKodu}
                disabled
                style={{
                    padding: "8px",
                    background: "#e9ecef",
                    cursor: "not-allowed",
                }}
            />
            <input
                type="text"
                placeholder="Ürün Adı"
                value={urunAdi}
                onChange={(e) => setUrunAdi(e.target.value)}
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
