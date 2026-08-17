import { useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import Modal from "./Modal";
import UrunEkleForm from "./UrunEkleForm";
import UrunGuncelleForm from "./UrunGuncelleForm";
import { apiFetch } from "../api";
import type { Urun } from "../types";
import { Toast } from "../utils";
import { useQuery } from "@tanstack/react-query";

export default function UrunlerTablosu() {
    const [isEkleModalOpen, setIsEkleModalOpen] = useState(false);
    const [isGuncelleModalOpen, setIsGuncelleModalOpen] = useState(false);
    const [seciliUrun, setSeciliUrun] = useState<Urun | null>(null);

    const {
        data: urunler = [],
        isLoading: urunlerYukleniyor,
        refetch: urunleriYenile,
    } = useQuery<Urun[]>({
        queryKey: ["urunler"],

        queryFn: async () => {
            const res = await apiFetch("/Urunler");

            if (!res.ok) {
                throw new Error("Ürünler getirilemedi.");
            }

            const data = await res.json();

            const liste =
                data.data || data.Data || (Array.isArray(data) ? data : []);

            return liste;
        },
    });

    const handleDelete = async (urunKodu: string) => {
        const result = await Swal.fire({
            title: "Emin misiniz?",
            text: `${urunKodu} kodlu ürünü silmek istediğinize emin misiniz?`,
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

        try {
            const res = await apiFetch(`/Urunler/${urunKodu}`, {
                method: "DELETE",
            });

            if (res.ok) {
                await urunleriYenile();

                Toast.fire({
                    icon: "success",
                    title: "Ürün silindi!",
                });
            } else {
                const hata = await res.text();

                console.error("Ürün silme hatası:", hata);

                Toast.fire({
                    icon: "error",
                    title: "Ürün silinemedi!",
                });
            }
        } catch (error) {
            console.error("Silme hatası:", error);

            Toast.fire({
                icon: "error",
                title: "Sunucuya ulaşılamadı!",
            });
        }
    };

    const handleEditClick = (urun: Urun) => {
        setSeciliUrun(urun);
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
            {/* BAŞLIK */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >
                <h2>Ürün Listesi</h2>

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
                    + Yeni Ürün Ekle
                </button>
            </div>

            {/* ÜRÜN TABLOSU */}
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
                        <th>Ürün Kodu</th>
                        <th>Ürün Adı</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>

                <tbody>
                    {urunlerYukleniyor ? (
                        <tr>
                            <td
                                colSpan={3}
                                style={{
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                            >
                                Yükleniyor...
                            </td>
                        </tr>
                    ) : urunler.length > 0 ? (
                        urunler.map((urun) => (
                            <tr key={urun.urunKodu}>
                                <td>{urun.urunKodu}</td>

                                <td>{urun.urunAdi}</td>

                                <td>
                                    {/* DÜZENLE */}
                                    <button
                                        onClick={() => handleEditClick(urun)}
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
                                        onClick={() =>
                                            handleDelete(urun.urunKodu)
                                        }
                                        title="Sil"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
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
                                colSpan={3}
                                style={{
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                            >
                                Ürün bulunamadı.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <Modal
                isOpen={isEkleModalOpen}
                onClose={() => setIsEkleModalOpen(false)}
                baslik="Yeni Ürün Ekle"
            >
                <UrunEkleForm
                    onClose={() => setIsEkleModalOpen(false)}
                    onUrunEklendi={() => urunleriYenile()}
                />
            </Modal>

            {seciliUrun && (
                <Modal
                    isOpen={isGuncelleModalOpen}
                    onClose={() => setIsGuncelleModalOpen(false)}
                    baslik="Ürün Düzenle"
                >
                    <UrunGuncelleForm
                        seciliUrun={seciliUrun}
                        onClose={() => setIsGuncelleModalOpen(false)}
                        onUrunGuncellendi={() => urunleriYenile()}
                    />
                </Modal>
            )}
        </div>
    );
}
