import { useEffect, useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Modal from "./Modal";
import PersonelEkleForm from "./PersonellerEkleForm";
import PersonelGuncelleForm from "./PersonellerGuncelleForm";
import { apiFetch } from "../api";
import type { Personel } from "../types";
import { Toast } from "../utils";

export default function PersonellerTablosu() {
    const [personeller, setPersoneller] = useState<Personel[]>([]);
    const [isEkleModalOpen, setIsEkleModalOpen] = useState(false);
    const [isGuncelleModalOpen, setIsGuncelleModalOpen] = useState(false);
    const [seciliPersonel, setSeciliPersonel] = useState<Personel | null>(null);

    const personelleriGetir = () => {
        apiFetch("/Personeller")
            .then((res) => res.json())
            .then((data: unknown) => {
                const responseData = data as {
                    data?: unknown[];
                    Data?: unknown[];
                };
                const hamListe =
                    responseData.data ||
                    responseData.Data ||
                    (Array.isArray(data) ? data : []);

                const duzenlenmisListe: Personel[] = hamListe.map(
                    (item: unknown) => {
                        const rec = item as Record<string, unknown>;
                        return {
                            id: Number(rec.id || 0),
                            ad: String(rec.ad || ""),
                            soyad: String(rec.soyad || ""),
                        };
                    },
                );

                setPersoneller(duzenlenmisListe);
            })
            .catch((err) => console.error("Hata:", err));
    };

    useEffect(() => {
        personelleriGetir();
    }, []);

    const handleDelete = (id: number) => {
        if (
            window.confirm(
                `${id} ID numaralı personeli silmek istediğinize emin misiniz?`,
            )
        ) {
            apiFetch(`/Personeller/${id}`, {
                method: "DELETE",
            })
                .then((res) => {
                    if (res.ok) {
                        personelleriGetir();
                        Toast.fire({
                            icon: "success",
                            title: "Personel silindi!",
                        });
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: "Silinemedi!",
                        });
                    }
                })
                .catch((err) => console.error("Silme hatası:", err));
        }
    };

    const handleEditClick = (personel: Personel) => {
        setSeciliPersonel(personel);
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
                <h2>Personel Listesi</h2>
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
                    + Yeni Personel Ekle
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
                    {personeller.length > 0 ? (
                        personeller.map((p: Personel) => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.ad}</td>
                                <td>{p.soyad}</td>
                                <td>
                                    <button
                                        onClick={() => handleEditClick(p)}
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
                                        onClick={() => handleDelete(p.id)}
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
                baslik="Yeni Personel Ekle"
            >
                <PersonelEkleForm
                    onClose={() => setIsEkleModalOpen(false)}
                    onPersonelEklendi={() => {
                        personelleriGetir();
                    }}
                />
            </Modal>

            {seciliPersonel && (
                <Modal
                    isOpen={isGuncelleModalOpen}
                    onClose={() => setIsGuncelleModalOpen(false)}
                    baslik="Personel Düzenle"
                >
                    <PersonelGuncelleForm
                        seciliPersonel={seciliPersonel}
                        onClose={() => setIsGuncelleModalOpen(false)}
                        onPersonelGuncellendi={() => {
                            personelleriGetir();
                        }}
                    />
                </Modal>
            )}
        </div>
    );
}
