import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import type { Personel } from "../types";
import { Toast } from "../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PersonelGuncelleFormProps {
    seciliPersonel: Personel | null;
    onClose: () => void;
}

export default function PersonelGuncelleForm({
    seciliPersonel,
    onClose,
}: PersonelGuncelleFormProps) {
    const [personelId, setPersonelId] = useState<number>(0);
    const [ad, setAd] = useState("");
    const [soyad, setSoyad] = useState("");

    const queryClient = useQueryClient();

    useEffect(() => {
        if (seciliPersonel) {
            setPersonelId(seciliPersonel.id);
            setAd(seciliPersonel.ad || "");
            setSoyad(seciliPersonel.soyad || "");
        }
    }, [seciliPersonel]);

    const personelGuncelleMutation = useMutation({
        mutationFn: async () => {
            if (!seciliPersonel) {
                throw new Error("Güncellenecek personel bulunamadı.");
            }

            const guncelPersonel: Personel = {
                id: personelId,
                ad,
                soyad,
                personelAdi: "",
                Adi: "",
            };

            const res = await apiFetch(`/Personeller/${personelId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(guncelPersonel),
            });

            if (!res.ok) {
                const hataDetayi = await res.text();

                throw new Error(hataDetayi || "Personel güncellenemedi.");
            }

            return res;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["personeller"],
            });

            Toast.fire({
                icon: "success",
                title: "Personel başarıyla güncellendi!",
            });

            onClose();
        },

        onError: (error) => {
            console.error("Güncelleme hatası:", error);

            Toast.fire({
                icon: "error",
                title: "Personel güncellenemedi!",
            });
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await personelGuncelleMutation.mutateAsync();
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
                    disabled={personelGuncelleMutation.isPending}
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
                    {personelGuncelleMutation.isPending
                        ? "Güncelleniyor..."
                        : "Güncelle"}
                </button>
            </div>
        </form>
    );
}
