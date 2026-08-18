import { useEffect, useState } from "react";

export const ElektronikListesi = () => {
    const [elektronikler, setElektronikler] = useState<{ id: number; isim: string }[]>(() => {
        const kayitli = localStorage.getItem("elektroniklerListesi");
        return kayitli ? JSON.parse(kayitli) : [
            { id: 1, isim: "Laptop" },
            { id: 2, isim: "Kulaklık" },
            { id: 3, isim: "Saat" },
            { id: 4, isim: "Tablet" },
        ];
    });

    const [yeniUrun, setYeniUrun] = useState("");
    const [secilenId, setSecilenId] = useState<number | null>(null);
    const [duzenlenenId, setduzenlenenId] = useState<number | null>(null);

    const urunEkleVeyaGuncelle = () => {
        if (yeniUrun.trim() === "") return;

        if (duzenlenenId !== null) {

            setElektronikler(
                elektronikler.map((alet) =>
                    alet.id === duzenlenenId ? { ...alet, isim: yeniUrun } : alet
                )
            );
            setduzenlenenId(null);
        } else {

            const yeniEleman = { id: Date.now(), isim: yeniUrun };
            setElektronikler([...elektronikler, yeniEleman]);
        }

        setYeniUrun("");
    };


    const urunuSil = (id: number) => {
        setElektronikler(elektronikler.filter((alet) => alet.id !== id));

        if (secilenId === id) setSecilenId(null);
    };

    const urunuDuzenle = (id: number, isim: string) => {
        setduzenlenenId(id);
        setYeniUrun(isim);
    };


    useEffect(() => {
        const kayitliUrunler = localStorage.getItem("elektroniklerListesi");
        if (kayitliUrunler) {
            setElektronikler(JSON.parse(kayitliUrunler));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("elektroniklerListesi", JSON.stringify(elektronikler));
    }, [elektronikler]);


    return (
        <div>
            <h3>Popüler Elektronik Aletler</h3>

            { }
            <p style={{ fontWeight: "bold", color: "purple" }}>
                Seçilen Ürün ID: {secilenId !== null ? secilenId : "Henüz seçilmedi"}
            </p>

            <input
                type="text"
                value={yeniUrun}
                onChange={(e) => setYeniUrun(e.target.value)}
                placeholder="Yeni elektronik ekle..."
            />
            <button onClick={urunEkleVeyaGuncelle}>
                {duzenlenenId !== null ? "Güncelle" : "Ekle"}
            </button>
            <ul>
                {elektronikler.map((alet) => (
                    <li key={alet.id}>
                        { }
                        <span
                            onClick={() => setSecilenId(alet.id)}
                            style={{ cursor: "pointer", marginRight: "10px" }}
                        >
                            {alet.isim}
                        </span>

                        <button onClick={() => urunuDuzenle(alet.id, alet.isim)}>Düzenle</button>
                        <button onClick={() => urunuSil(alet.id)}>Sil</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

