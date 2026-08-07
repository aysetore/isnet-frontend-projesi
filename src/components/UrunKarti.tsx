import type { FC } from "react";
import { useState } from "react";

type UrunProps = {
    baslik: string;
    fiyat: number;
    adet: number;
};

export const UrunKarti: FC<UrunProps> = (props) => {
    const { baslik, fiyat, adet } = props;
    const [stokAdedi, setStokAdedi] = useState<number>(adet);

    return (
        <div>
            <h3>{baslik}</h3>
            <p>Fiyat: {fiyat}</p>
            <p>Adet: {stokAdedi}</p>
            <button onClick={() => setStokAdedi(stokAdedi - 1)}>Adeti Azalt</button>
            <button onClick={() => setStokAdedi(stokAdedi + 1)}>Adeti Arttır</button>

        </div>
    );
};