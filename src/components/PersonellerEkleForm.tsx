import React, { useState } from "react";
import { apiFetch } from "../api";
import type { PersonelCreate } from "../types"; // 1. Merkezi tipi import et
import { Toast } from "../utils";

interface PersonelEkleFormProps {
    onClose: () => void;
    onPersonelEklendi: () => void; // 2. Props tipini güncelle
}

export default function PersonelEkleForm({
    onClose,
    onPersonelEklendi,
}: PersonelEkleFormProps) {
    const [personelAdi, setPersonelAdi] = useState("");
    const [personelSoyadi, setPersonelSoyadi] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const yeniPersonelPayload: PersonelCreate = {
            ad: personelAdi,
            soyad: personelSoyadi,
        };

        try {
            const res = await apiFetch("/Personeller", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(yeniPersonelPayload),
            });

            if (res.ok) {
                onClose();
                onPersonelEklendi();

                Toast.fire({
                    icon: "success",
                    title: "Personel başarıyla kaydedildi!",
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Bu isim ve soyisimde bir personel zaten kayıtlı!",
                });
            }
        } catch (err) {
            console.error("Hata:", err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
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
