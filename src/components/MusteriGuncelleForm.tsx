import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "../api";
import type { Musteri } from "../types";
import { Toast } from "../utils";

interface MusteriGuncelleFormProps {
    seciliMusteri: Musteri | null;
    onClose: () => void;
    onMusteriGuncellendi: () => void;
}

export default function MusteriGuncelleForm({
    seciliMusteri,
    onClose,
    onMusteriGuncellendi,
}: MusteriGuncelleFormProps) {
    const [id, setId] = useState<number>(0);
    const [ad, setAd] = useState("");
    const [soyad, setSoyad] = useState("");
    const [yukleniyor, setYukleniyor] = useState(false);

    useEffect(() => {
        if (seciliMusteri) {
            setId(Number(seciliMusteri.id));
            setAd(seciliMusteri.ad || "");
            setSoyad(seciliMusteri.soyad || "");
        }
    }, [seciliMusteri]);

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();

        if (!seciliMusteri || !id) {
            Toast.fire({
                icon: "error",
                title: "Müşteri bilgisi bulunamadı!",
            });
            return;
        }

        if (!ad.trim() || !soyad.trim()) {
            Toast.fire({
                icon: "warning",
                title: "Lütfen ad ve soyad giriniz.",
            });
            return;
        }

        setYukleniyor(true);

        const guncelVeri = {
            id: id,
            ad: ad.trim(),
            soyad: soyad.trim(),
        };

        try {
            const res = await apiFetch(`/Musteriler/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(guncelVeri),
            });

            if (res.ok) {
                Toast.fire({
                    icon: "success",
                    title: "Müşteri başarıyla güncellendi!",
                });

                onMusteriGuncellendi();
                onClose();
            } else {
                const hataDetayi = await res.text();

                console.error("Güncelleme hatası:", hataDetayi);

                Toast.fire({
                    icon: "error",
                    title: "Müşteri güncellenemedi!",
                });
            }
        } catch (err) {
            console.error("Bağlantı hatası:", err);

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
            onSubmit={handleUpdate}
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
                    ID
                </label>

                <input
                    type="number"
                    value={id}
                    disabled
                    style={{
                        padding: "9px",
                        backgroundColor: "#e9ecef",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: "not-allowed",
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
                        border: "1px solid #ccc",
                        borderRadius: "4px",
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
                        border: "1px solid #ccc",
                        borderRadius: "4px",
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
                        backgroundColor: "#ffc107",
                        color: "#000",
                        border: "none",
                        borderRadius: "4px",
                        cursor: yukleniyor ? "not-allowed" : "pointer",
                        fontWeight: "bold",
                    }}
                >
                    {yukleniyor ? "Güncelleniyor..." : "Güncelle"}
                </button>
            </div>
        </form>
    );
}
