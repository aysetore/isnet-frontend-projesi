import { useState, type FormEvent } from "react";
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
    const [yukleniyor, setYukleniyor] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!ad.trim() || !soyad.trim()) {
            Toast.fire({
                icon: "warning",
                title: "Lütfen ad ve soyad giriniz.",
            });
            return;
        }

        setYukleniyor(true);

        const yeniMusteri: MusteriCreate = {
            ad: ad.trim(),
            soyad: soyad.trim(),
        };

        try {
            const res = await apiFetch("/Musteriler", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(yeniMusteri),
            });

            if (res.ok) {
                Toast.fire({
                    icon: "success",
                    title: "Müşteri başarıyla kaydedildi!",
                });

                setAd("");
                setSoyad("");

                onMusteriEklendi();
                onClose();
            } else {
                const hata = await res.text();

                console.error("Müşteri ekleme hatası:", hata);

                Toast.fire({
                    icon: "error",
                    title: "Müşteri eklenemedi!",
                });
            }
        } catch (err) {
            console.error("Müşteri ekleme hatası:", err);

            Toast.fire({
                icon: "error",
                title: "Sunucuya ulaşılamadı!",
            });
        } finally {
            setYukleniyor(false);
        }
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
                    disabled={yukleniyor}
                    style={{
                        padding: "9px 15px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: yukleniyor ? "not-allowed" : "pointer",
                    }}
                >
                    İptal
                </button>

                <button
                    type="submit"
                    disabled={yukleniyor}
                    style={{
                        padding: "9px 15px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: yukleniyor ? "not-allowed" : "pointer",
                        fontWeight: "bold",
                    }}
                >
                    {yukleniyor ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>
        </form>
    );
}
