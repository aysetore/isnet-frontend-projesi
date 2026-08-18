import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import type { Urun } from "../types";
import { Toast } from "../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UrunGuncelleFormProps {
    seciliUrun: Urun | null;
    onClose: () => void;
}

export default function UrunGuncelleForm({
    seciliUrun,
    onClose,
}: UrunGuncelleFormProps) {
    const [urunKodu, setUrunKodu] = useState("");
    const [urunAdi, setUrunAdi] = useState("");

    const queryClient = useQueryClient();

    useEffect(() => {
        if (seciliUrun) {
            setUrunKodu(seciliUrun.urunKodu || "");
            setUrunAdi(seciliUrun.urunAdi || "");
        }
    }, [seciliUrun]);

    const urunGuncelleMutation = useMutation({
        mutationFn: async () => {
            if (!seciliUrun) {
                throw new Error("Güncellenecek ürün bulunamadı.");
            }

            const guncelVeri = {
                UrunKodu: urunKodu,
                UrunAd: urunAdi,
            };

            const res = await apiFetch(`/Urunler/${urunKodu}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(guncelVeri),
            });

            if (!res.ok) {
                const hataDetayi = await res.text();
                throw new Error(hataDetayi || "Ürün güncellenemedi.");
            }

            return res;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["urunler"],
            });

            Toast.fire({
                icon: "success",
                title: "Ürün başarıyla güncellendi!",
            });

            onClose();
        },

        onError: (error) => {
            console.error("Ürün güncelleme hatası:", error);

            Toast.fire({
                icon: "error",
                title: "Ürün güncellenemedi!",
            });
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await urunGuncelleMutation.mutateAsync();
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
                    disabled={urunGuncelleMutation.isPending}
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
                    {urunGuncelleMutation.isPending
                        ? "Güncelleniyor..."
                        : "Güncelle"}
                </button>
            </div>
        </form>
    );
}
