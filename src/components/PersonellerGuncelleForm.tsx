import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import type { Personel } from "../types";
import { Toast } from "../utils";

interface PersonelGuncelleFormProps {
    seciliPersonel: Personel | null;
    onClose: () => void;
    onPersonelGuncellendi: () => void;
}

export default function PersonelGuncelleForm({
    seciliPersonel,
    onClose,
    onPersonelGuncellendi,
}: PersonelGuncelleFormProps) {
    const [personelId, setPersonelId] = useState<number>(0);
    const [ad, setAd] = useState("");
    const [soyad, setSoyad] = useState("");

    useEffect(() => {
        if (seciliPersonel) {
            setPersonelId(seciliPersonel.id);
            setAd(seciliPersonel.ad || "");
            setSoyad(seciliPersonel.soyad || "");
        }
    }, [seciliPersonel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!seciliPersonel) {
            return;
        }

        const guncelPersonel: Personel = {
            id: personelId,
            ad,
            soyad,
            personelAdi: "",
            Adi: "",
        };

        try {
            const res = await apiFetch(`/Personeller/${personelId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(guncelPersonel),
            });

            if (res.ok) {
                Toast.fire({
                    icon: "success",
                    title: "Personel başarıyla güncellendi!",
                });

                onPersonelGuncellendi();
                onClose();
            } else {
                const hataDetayi = await res.text();
                console.error("Güncelleme hatası:", hataDetayi);

                Toast.fire({
                    icon: "error",
                    title: "Personel güncellenemedi!",
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
                placeholder="Personel ID"
                value={personelId}
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
                placeholder="Personel Adı"
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                required
                style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                }}
            />

            <input
                type="text"
                placeholder="Personel Soyadı"
                value={soyad}
                onChange={(e) => setSoyad(e.target.value)}
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
