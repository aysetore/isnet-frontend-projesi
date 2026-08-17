import React, { useState } from "react";
import { apiFetch } from "../api";
import type { PersonelCreate } from "../types";
import { Toast } from "../utils";

interface PersonelEkleFormProps {
    onClose: () => void;
    onPersonelEklendi: () => void;
}

export default function PersonelEkleForm({
    onClose,
    onPersonelEklendi,
}: PersonelEkleFormProps) {
    const [ad, setAd] = useState("");
    const [soyad, setSoyad] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const yeniPersonel: PersonelCreate = {
            ad,
            soyad,
        };

        try {
            const res = await apiFetch("/Personeller", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(yeniPersonel),
            });

            if (res.ok) {
                Toast.fire({
                    icon: "success",
                    title: "Personel başarıyla kaydedildi!",
                });

                onPersonelEklendi();
                onClose();

                setAd("");
                setSoyad("");
            } else {
                const hata = await res.text();
                console.error("Personel ekleme hatası:", hata);

                Toast.fire({
                    icon: "error",
                    title: "Personel eklenemedi!",
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
                placeholder="Personel Adı"
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                required
                style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
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
                    borderRadius: "4px",
                    border: "1px solid #ccc",
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
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    Kaydet
                </button>
            </div>
        </form>
    );
}
