import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import type { Urun } from "../types";
import { Toast } from "../utils";

interface UrunGuncelleFormProps {
    seciliUrun: Urun | null;
    onClose: () => void;
    onUrunGuncellendi: () => void;
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
            setUrunKodu(seciliUrun.urunKodu || "");
            setUrunAdi(seciliUrun.urunAdi || "");
        }
    }, [seciliUrun]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!seciliUrun) {
            return;
        }

        const guncelVeri = {
            UrunKodu: urunKodu,
            UrunAd: urunAdi,
        };

        try {
            const res = await apiFetch(`/Urunler/${urunKodu}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(guncelVeri),
            });

            if (res.ok) {
                Toast.fire({
                    icon: "success",
                    title: "Ürün başarıyla güncellendi!",
                });

                onUrunGuncellendi();
                onClose();
            } else {
                const hataDetayi = await res.text();
                console.error("Ürün güncelleme hatası:", hataDetayi);

                Toast.fire({
                    icon: "error",
                    title: "Ürün güncellenemedi!",
                });
            }
        } catch (error) {
            console.error("Bağlantı hatası:", error);

            Toast.fire({
                icon: "error",
                title: "Sunucuya ulaşılamadı!",
            });
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                minWidth: "300px",
            }}
        >
            <input
                type="text"
                placeholder="Ürün Kodu"
                value={urunKodu}
                disabled
                style={{
                    padding: "8px",
                    background: "#e9ecef",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "not-allowed",
                }}
            />

            <input
                type="text"
                placeholder="Ürün Adı"
                value={urunAdi}
                onChange={(e) => setUrunAdi(e.target.value)}
                required
                style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                }}
            />

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "10px",
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        padding: "8px 14px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        background: "#fff",
                        cursor: "pointer",
                    }}
                >
                    İptal
                </button>

                <button
                    type="submit"
                    style={{
                        padding: "8px 14px",
                        background: "#ffc107",
                        color: "#000",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    Güncelle
                </button>
            </div>
        </form>
    );
}
