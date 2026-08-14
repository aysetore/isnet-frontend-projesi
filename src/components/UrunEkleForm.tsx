import React, { useState } from "react";
import { apiFetch } from "../api";
import type { Urun } from "../types"; // 1. Merkezi tipi import et
import { Toast } from "../utils";

interface UrunEkleFormProps {
    onClose: () => void;
    onUrunEklendi: () => void; // 2. Props tipini güncelle
}

export default function UrunEkleForm({
    onClose,
    onUrunEklendi,
}: UrunEkleFormProps) {
    const [urunKodu, setUrunKodu] = useState("");
    const [urunAdi, setUrunAdi] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const yeniUrun: Urun = {
            urunKodu,
            urunAdi,
            ad: undefined,
            id: 0,
        };

        // apiFetch kullanarak POST isteği atıyoruz, token otomatik ekleniyor
        apiFetch("/urunler", {
            method: "POST",
            body: JSON.stringify(yeniUrun),
        })
            .then(async (res) => {
                if (res.ok) {
                    onUrunEklendi();
                    onClose();
                    Toast.fire({
                        icon: "success",
                        title: "Ürün başarıyla kaydedildi!",
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Bu Ürün Kodu Mevcut!",
                    });
                }
            })
            .catch((err) => console.error("Hata:", err));
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
            <input
                type="text"
                placeholder="Ürün Kodu"
                value={urunKodu}
                onChange={(e) => setUrunKodu(e.target.value)}
                required
                style={{ padding: "8px" }}
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
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                    }}
                >
                    Kaydet
                </button>
            </div>
        </form>
    );
}
