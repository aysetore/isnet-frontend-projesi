import type { FC } from "react";
import { useState } from "react";

type IProps = {
    name: string;
    username: string,
    age: number;
    city: string;
};

export const Merhaba: FC<IProps> = (props) => {

    const { name, username, age, city } = props;
    const [aktifIsim, setaktifIsim] = useState(name);

    return (
        <div>
            <p>Merhaba {aktifIsim} {username}</p>
            <p>Yaş: {age} / Şehir:{city}</p>
            <button onClick={() => setaktifIsim("Ahmet")}>İsmi Değiştir</button>
        </div>
    );
}