import { useEffect, useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Modal from "./Modal";
import UrunEkleForm from "./UrunEkleForm";
import UrunGuncelleForm from "./UrunGuncelleForm";
import { apiFetch } from "../api";
import type { Urun } from "../types";
import { Toast } from "../utils";

export default function UrunlerTablosu() {
    const [urunler, setUrunler] = useState<Urun[]>([]);
    const [isEkleModalOpen, setIsEkleModalOpen] = useState(false);
    const [isGuncelleModalOpen, setIsGuncelleModalOpen] = useState(false);
    const [seciliUrun, setSeciliUrun] = useState<Urun | null>(null);

    useEffect(() => {
        loadData();
    }, []);
    const loadData = () => {
        apiFetch("/Urunler")
            .then((res) => res.json())
            .then((data) => {
                const liste =
                    data.data || data.Data || (Array.isArray(data) ? data : []);
                setUrunler(liste);
            })
            .catch((err) => console.error("Hata:", err));
    };

    const handleDelete = (urunKodu: string) => {
        if (
            window.confirm(
                `${urunKodu} kodlu ürünü silmek istediğinize emin misiniz?`,
            )
        ) {
            apiFetch(`/urunler/${urunKodu}`, { method: "DELETE" }).then(
                (res) => {
                    if (res.ok) {
                        setUrunler((prev) =>
                            prev.filter((item) => item.urunKodu !== urunKodu),
                        );
                        Toast.fire({
                            icon: "success",
                            title: "Ürün silindi!",
                        });
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: "Silinemedi!",
                        });
                    }
                },
            );
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

            <table
                border={1}
                cellPadding={10}
                style={{ width: "100%", borderCollapse: "collapse" }}
            >
                <thead>
                    <tr style={{ background: "#f4f4f4", textAlign: "left" }}>
                        <th>Ürün Kodu</th>
                        <th>Ürün Adı</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {urunler.length > 0 ? (
                        urunler.map((urun) => (
                            <tr key={urun.urunKodu}>
                                <td>{urun.urunKodu}</td>
                                <td>{urun.urunAdi}</td>
                                <td>
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
                baslik="Yeni Ürün Ekle"
            >
                <UrunEkleForm
                    onClose={() => setIsEkleModalOpen(false)}
                    onUrunEklendi={() => loadData()}
                />
            </Modal>

            <Modal
                isOpen={isGuncelleModalOpen}
                onClose={() => setIsGuncelleModalOpen(false)}
                baslik="Ürün Düzenle"
            >
                <UrunGuncelleForm
                    seciliUrun={seciliUrun}
                    onClose={() => setIsGuncelleModalOpen(false)}
                    onUrunGuncellendi={() => loadData()}
                />
            </Modal>
        </div>
    );
}
