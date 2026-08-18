import { useState, type FormEvent } from "react";
import { apiFetch } from "../api";
import type { MusteriCreate } from "../types";
import { Toast } from "../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MusteriEkleFormProps {
    onClose: () => void;
}

export default function MusteriEkleForm({ onClose }: MusteriEkleFormProps) {
    const [ad, setAd] = useState("");
    const [soyad, setSoyad] = useState("");

    const queryClient = useQueryClient();

    const musteriEkleMutation = useMutation({
        mutationFn: async (yeniMusteri: MusteriCreate) => {
            const res = await apiFetch("/Musteriler", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(yeniMusteri),
            });

            if (!res.ok) {
                const hata = await res.text();

                throw new Error(hata || "Müşteri eklenemedi.");
            }

            return res;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["musteriler"],
            });

            Toast.fire({
                icon: "success",
                title: "Müşteri başarıyla kaydedildi!",
            });

            setAd("");
            setSoyad("");

            onClose();
        },

        onError: (error) => {
            console.error("Müşteri ekleme hatası:", error);

            Toast.fire({
                icon: "error",
                title: "Müşteri eklenemedi!",
            });
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!ad.trim() || !soyad.trim()) {
            Toast.fire({
                icon: "warning",
                title: "Lütfen ad ve soyad giriniz.",
            });

            return;
        }

        const yeniMusteri: MusteriCreate = {
            ad: ad.trim(),
            soyad: soyad.trim(),
        };

        await musteriEkleMutation.mutateAsync(yeniMusteri);
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                padding: "10px",
                minWidth: "300px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                }}
            >
                <label
                    style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                    }}
                >
                    Ad
                </label>

                <input
                    type="text"
                    placeholder="Müşteri Adı"
                    value={ad}
                    onChange={(e) => setAd(e.target.value)}
                    required
                    disabled={musteriEkleMutation.isPending}
                    style={{
                        padding: "9px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        outline: "none",
                    }}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                }}
            >
                <label
                    style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                    }}
                >
                    Soyad
                </label>

                <input
                    type="text"
                    placeholder="Müşteri Soyadı"
                    value={soyad}
                    onChange={(e) => setSoyad(e.target.value)}
                    required
                    disabled={musteriEkleMutation.isPending}
                    style={{
                        padding: "9px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        outline: "none",
                    }}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "5px",
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={musteriEkleMutation.isPending}
                    style={{
                        padding: "9px 15px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: musteriEkleMutation.isPending
                            ? "not-allowed"
                            : "pointer",
                    }}
                >
                    İptal
                </button>

                <button
                    type="submit"
                    disabled={musteriEkleMutation.isPending}
                    style={{
                        padding: "9px 15px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: musteriEkleMutation.isPending
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: "bold",
                    }}
                >
                    {musteriEkleMutation.isPending
                        ? "Kaydediliyor..."
                        : "Kaydet"}
                </button>
            </div>
        </form>
    );
}
