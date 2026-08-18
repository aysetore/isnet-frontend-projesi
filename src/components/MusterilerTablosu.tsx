import { useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import Modal from "./Modal";
import MusteriEkleForm from "./MusteriEkleForm";
import MusteriGuncelleForm from "./MusteriGuncelleForm";
import { apiFetch } from "../api";
import type { Musteri } from "../types";
import { Toast } from "../utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function MusterilerTablosu() {
    const [isEkleModalOpen, setIsEkleModalOpen] = useState(false);
    const [isGuncelleModalOpen, setIsGuncelleModalOpen] = useState(false);
    const [seciliMusteri, setSeciliMusteri] = useState<Musteri | null>(null);

    const queryClient = useQueryClient();

    const { data: musteriler = [], isLoading: musterilerYukleniyor } = useQuery<
        Musteri[]
    >({
        queryKey: ["musteriler"],

        queryFn: async () => {
            const res = await apiFetch("/Musteriler");

            if (!res.ok) {
                throw new Error("Müşteriler getirilemedi.");
            }

            const data: unknown = await res.json();

            const responseData = data as {
                data?: unknown[];
                Data?: unknown[];
            };

            const hamListe =
                responseData.data ||
                responseData.Data ||
                (Array.isArray(data) ? data : []);

            const duzenlenmisListe: Musteri[] = hamListe.map(
                (item: unknown) => {
                    const rec = item as Record<string, unknown>;

                    return {
                        id: Number(rec.id ?? rec.Id ?? 0),

                        ad: String(rec.ad ?? rec.Ad ?? ""),

                        soyad: String(rec.soyad ?? rec.Soyad ?? ""),

                        musteriAdi: String(
                            rec.musteriAdi ??
                                rec.MusteriAdi ??
                                rec.ad ??
                                rec.Ad ??
                                "",
                        ),

                        Adi: String(rec.Adi ?? rec.ad ?? rec.Ad ?? ""),
                    };
                },
            );

            return duzenlenmisListe;
        },
    });

    const musteriSilMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiFetch(`/Musteriler/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const hata = await res.text();

                throw new Error(hata || "Müşteri silinemedi.");
            }

            return res;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["musteriler"],
            });

            Toast.fire({
                icon: "success",
                title: "Müşteri silindi!",
            });
        },

        onError: (error) => {
            console.error("Müşteri silme hatası:", error);

            Toast.fire({
                icon: "error",
                title: "Müşteri silinemedi!",
            });
        },
    });

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Emin misiniz?",
            text: `${id} ID numaralı müşteriyi silmek istediğinize emin misiniz?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Evet, sil!",
            cancelButtonText: "Vazgeç",
        });

        if (!result.isConfirmed) {
            return;
        }

        await musteriSilMutation.mutateAsync(id);
    };

    const handleEditClick = (musteri: Musteri) => {
        setSeciliMusteri(musteri);
        setIsGuncelleModalOpen(true);
    };

    return (
        <div
            style={{
                padding: "30px",
                fontFamily: "Arial, sans-serif",
                position: "relative",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >
                <h2>Müşteri Listesi</h2>

                <button
                    onClick={() => setIsEkleModalOpen(true)}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    + Yeni Müşteri Ekle
                </button>
            </div>

           
            <table
                border={1}
                cellPadding={10}
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                }}
            >
                <thead>
                    <tr
                        style={{
                            background: "#f4f4f4",
                            textAlign: "left",
                        }}
                    >
                        <th>ID</th>
                        <th>Ad</th>
                        <th>Soyad</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>

                <tbody>
                    {musterilerYukleniyor ? (
                        <tr>
                            <td
                                colSpan={4}
                                style={{
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                            >
                                Yükleniyor...
                            </td>
                        </tr>
                    ) : musteriler.length > 0 ? (
                        musteriler.map((musteri) => (
                            <tr key={musteri.id}>
                                <td>{musteri.id}</td>

                                <td>{musteri.ad}</td>

                                <td>{musteri.soyad}</td>

                                <td>
                                    {/* DÜZENLE */}
                                    <button
                                        onClick={() => handleEditClick(musteri)}
                                        title="Düzenle"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#ffc107",
                                            fontSize: "18px",
                                            marginRight: "10px",
                                        }}
                                    >
                                        <FaEdit />
                                    </button>

                                    {/* SİL */}
                                    <button
                                        onClick={() => handleDelete(musteri.id)}
                                        title="Sil"
                                        disabled={musteriSilMutation.isPending}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: musteriSilMutation.isPending
                                                ? "not-allowed"
                                                : "pointer",
                                            color: "#dc3545",
                                            fontSize: "18px",
                                        }}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={4}
                                style={{
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                            >
                                Müşteri bulunamadı.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

           
            <Modal
                isOpen={isEkleModalOpen}
                onClose={() => setIsEkleModalOpen(false)}
                baslik="Yeni Müşteri Ekle"
            >
                <MusteriEkleForm onClose={() => setIsEkleModalOpen(false)} />
            </Modal>

      
            {seciliMusteri && (
                <Modal
                    isOpen={isGuncelleModalOpen}
                    onClose={() => setIsGuncelleModalOpen(false)}
                    baslik="Müşteri Düzenle"
                >
                    <MusteriGuncelleForm
                        seciliMusteri={seciliMusteri}
                        onClose={() => setIsGuncelleModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
}
