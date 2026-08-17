import { useEffect, useState } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Modal from "./Modal";
import PersonelEkleForm from "./PersonellerEkleForm";
import PersonelGuncelleForm from "./PersonellerGuncelleForm";
import { apiFetch } from "../api";
import type { Personel } from "../types";
import { Toast } from "../utils";
import { useQuery } from "@tanstack/react-query";

export default function PersonellerTablosu() {
    const [isEkleModalOpen, setIsEkleModalOpen] = useState(false);
    const [isGuncelleModalOpen, setIsGuncelleModalOpen] = useState(false);
    const [seciliPersonel, setSeciliPersonel] = useState<Personel | null>(null);

    const {
        data: personeller = [],
        isLoading: personellerYukleniyor,
        refetch: personelleriYenile,
    } = useQuery<Personel[]>({
        queryKey: ["personeller"],
        queryFn: async () => {
            const res = await apiFetch("/Personeller");

            if (!res.ok) {
                throw new Error("Personeller getirilemedi.");
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

            const duzenlenmisListe: Personel[] = hamListe.map(
                (item: unknown) => {
                    const rec = item as Record<string, unknown>;

                    return {
                        id: Number(rec.id ?? rec.Id ?? 0),
                        ad: String(rec.ad ?? rec.Ad ?? ""),
                        soyad: String(rec.soyad ?? rec.Soyad ?? ""),
                        personelAdi: String(
                            rec.personelAdi ??
                                rec.PersonelAdi ??
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

    useEffect(() => {
        personelleriYenile();
    }, [personelleriYenile]);

    const handleDelete = async (id: number) => {
        const onay = window.confirm(
            `${id} ID numaralı personeli silmek istediğinize emin misiniz?`,
        );

        if (!onay) {
            return;
        }

        try {
            const res = await apiFetch(`/Personeller/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                await personelleriYenile();

                Toast.fire({
                    icon: "success",
                    title: "Personel silindi!",
                });
            } else {
                const hata = await res.text();

                console.error("Personel silme hatası:", hata);

                Toast.fire({
                    icon: "error",
                    title: "Personel silinemedi!",
                });
            }
        } catch (err) {
            console.error("Silme hatası:", err);

            Toast.fire({
                icon: "error",
                title: "Sunucuya ulaşılamadı!",
            });
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
            {/* BAŞLIK */}
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

            {/* PERSONEL TABLOSU */}
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
                    {personellerYukleniyor ? (
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
                    ) : personeller.length > 0 ? (
                        personeller.map((personel) => (
                            <tr key={personel.id}>
                                <td>{personel.id}</td>

                                <td>{personel.ad}</td>

                                <td>{personel.soyad}</td>

                                <td>
                                    {/* DÜZENLE */}
                                    <button
                                        onClick={() =>
                                            handleEditClick(personel)
                                        }
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
                                            handleDelete(personel.id)
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
                                colSpan={4}
                                style={{
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                            >
                                Personel bulunamadı.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* PERSONEL EKLE */}
            <Modal
                isOpen={isEkleModalOpen}
                onClose={() => setIsEkleModalOpen(false)}
                baslik="Yeni Personel Ekle"
            >
                <PersonelEkleForm
                    onClose={() => setIsEkleModalOpen(false)}
                    onPersonelEklendi={async () => {
                        await personelleriYenile();
                    }}
                />
            </Modal>

            {/* PERSONEL GÜNCELLE */}
            {seciliPersonel && (
                <Modal
                    isOpen={isGuncelleModalOpen}
                    onClose={() => setIsGuncelleModalOpen(false)}
                    baslik="Personel Düzenle"
                >
                    <PersonelGuncelleForm
                        seciliPersonel={seciliPersonel}
                        onClose={() => setIsGuncelleModalOpen(false)}
                        onPersonelGuncellendi={async () => {
                            await personelleriYenile();
                        }}
                    />
                </Modal>
            )}
        </div>
    );
}
