import { useEffect, useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Modal from "./Modal";
import MusteriEkleForm from "./MusteriEkleForm";
import MusteriGuncelleForm from "./MusteriGuncelleForm";
import { apiFetch } from "../api";
import type { Musteri } from "../types";
import { Toast } from "../utils";

export default function MusterilerTablosu() {
    const [musteriler, setMusteriler] = useState<Musteri[]>([]);
    const [isEkleModalOpen, setIsEkleModalOpen] = useState(false);
    const [isGuncelleModalOpen, setIsGuncelleModalOpen] = useState(false);
    const [seciliMusteri, setSeciliMusteri] = useState<Musteri | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        apiFetch("/Musteriler")
            .then((res) => res.json())
            .then((data) => {
                const liste =
                    data.data || data.Data || (Array.isArray(data) ? data : []);
                setMusteriler(liste);
            })
            .catch((err) => console.error("Hata:", err));
    };

    const handleDelete = (id: number) => {
        if (
            window.confirm(
                `${id} ID numaralı müşteriyi silmek istediğinize emin misiniz?`,
            )
        ) {
            apiFetch(`/Musteriler/${id}`, {
                method: "DELETE",
            }).then((res) => {
                if (res.ok) {
                    Toast.fire({
                        icon: "success",
                        title: "Müşteri silindi!",
                    });
                    loadData();
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Silinemedi!",
                    });
                }
            });
        }
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
                style={{ width: "100%", borderCollapse: "collapse" }}
            >
                <thead>
                    <tr style={{ background: "#f4f4f4", textAlign: "left" }}>
                        <th>ID</th>
                        <th>Ad</th>
                        <th>Soyad</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {musteriler.length > 0 ? (
                        musteriler.map((musteri) => (
                            <tr key={musteri.id}>
                                <td>{musteri.id}</td>
                                <td>{musteri.ad}</td>
                                <td>{musteri.soyad}</td>
                                <td>
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
                                    <button
                                        onClick={() => handleDelete(musteri.id)}
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
                                colSpan={4}
                                style={{ textAlign: "center", padding: "20px" }}
                            >
                                Yükleniyor...
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
                <MusteriEkleForm
                    onClose={() => setIsEkleModalOpen(false)}
                    onMusteriEklendi={() => loadData()}
                />
            </Modal>

            <Modal
                isOpen={isGuncelleModalOpen}
                onClose={() => setIsGuncelleModalOpen(false)}
                baslik="Müşteri Düzenle"
            >
                <MusteriGuncelleForm
                    seciliMusteri={seciliMusteri}
                    onClose={() => setIsGuncelleModalOpen(false)}
                    onMusteriGuncellendi={() => loadData()}
                />
            </Modal>
        </div>
    );
}
