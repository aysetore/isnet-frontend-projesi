import React, { useState } from "react";
import { apiFetch } from "../api";
import type { MusteriCreate } from "../types";
import { Toast } from "../utils";

interface MusteriEkleFormProps {
    onClose: () => void;
    onMusteriEklendi: () => void;
}

export default function MusteriEkleForm({
    onClose,
    onMusteriEklendi,
}: MusteriEkleFormProps) {
    const [ad, setAd] = useState("");
    const [soyad, setSoyad] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const yeniMusteri: MusteriCreate = { ad, soyad };

        apiFetch("/Musteriler", {
            method: "POST",
            body: JSON.stringify(yeniMusteri),
        })
            .then(async (res) => {
                if (res.ok) {
                    onMusteriEklendi();
                    onClose();
                    Toast.fire({
                        icon: "success",
                        title: "Müşteri başarıyla kaydedildi!",
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Bu isimde bir müşteri zaten kayıtlı",
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
