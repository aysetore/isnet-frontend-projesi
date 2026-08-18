import React, { useState } from "react";
import { apiFetch } from "../api";
import type { Urun } from "../types";
import { Toast } from "../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UrunEkleFormProps {
    onClose: () => void;
}

export default function UrunEkleForm({ onClose }: UrunEkleFormProps) {
    const [urunKodu, setUrunKodu] = useState("");
    const [urunAdi, setUrunAdi] = useState("");

    const queryClient = useQueryClient();

    const urunEkleMutation = useMutation({
        mutationFn: async (yeniUrun: Urun) => {
            const res = await apiFetch("/Urunler", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(yeniUrun),
            });

            if (!res.ok) {
                const hata = await res.text();
                throw new Error(hata || "Ürün eklenemedi.");
            }

            return res;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["urunler"],
            });

            Toast.fire({
                icon: "success",
                title: "Ürün başarıyla kaydedildi!",
            });

            setUrunKodu("");
            setUrunAdi("");
            onClose();
        },

        onError: (error) => {
            console.error("Ürün ekleme hatası:", error);

            Toast.fire({
                icon: "error",
                title: "Bu ürün kodu zaten mevcut!",
            });
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const yeniUrun: Urun = {
            id: 0,
            urunKodu,
            urunAdi,
            ad: undefined,
        };

        await urunEkleMutation.mutateAsync(yeniUrun);
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
                onChange={(e) => setUrunKodu(e.target.value)}
                required
                style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
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
                    disabled={urunEkleMutation.isPending}
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
                    {urunEkleMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>
        </form>
    );
}
