import React, { useState, useEffect } from "react";
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
    const [personelAdi, setPersonelAdi] = useState("");
    const [personelSoyadi, setPersonelSoyadi] = useState("");

    useEffect(() => {
        if (seciliPersonel) {
            // Merkezi tipteki olası alan adlarını güvenli şekilde al
            const id = seciliPersonel.id;
            const ad = seciliPersonel.ad || "";
            const soyad = seciliPersonel.soyad || "";

            setPersonelId(id);
            setPersonelAdi(ad);
            setPersonelSoyadi(soyad);
        }
    }, [seciliPersonel]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        const guncelVeri: Personel = {
            id: personelId,
            ad: personelAdi,
            soyad: personelSoyadi,
        };

        apiFetch(`/Personeller/${personelId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(guncelVeri),
        })
            .then(async (res) => {
                if (res.ok) {
                    onPersonelGuncellendi();
                    onClose();
                    Toast.fire({
                        icon: "success",
                        title: "Personel başarıyla güncellendi!",
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
                placeholder="Personel ID"
                value={personelId}
                disabled
                style={{
                    padding: "8px",
                    background: "#e9ecef",
                    cursor: "not-allowed",
                }}
            />
            <input
                type="text"
                placeholder="Personel Adı"
                value={personelAdi}
                onChange={(e) => setPersonelAdi(e.target.value)}
                required
                style={{ padding: "8px" }}
            />
            <input
                type="text"
                placeholder="Personel Soyadı"
                value={personelSoyadi}
                onChange={(e) => setPersonelSoyadi(e.target.value)}
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
