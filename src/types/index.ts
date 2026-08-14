export interface MusteriCreate {
    ad: string;
    soyad: string;
}

export interface Musteri {
    id: number;
    ad: string;
    soyad: string;
}

export interface PersonelCreate {
    ad: string;
    soyad: string;
}

export interface Personel {
    id: number;
    ad: string;
    soyad: string;
}

export interface Siparis {
    id: number;
    musterilerId: number;
    personelId: number;
    tarih?: string;
}

export interface Urun {
    urunKodu: string;
    urunAdi: string;
}

export interface SiparisDetay {
    id: number;
    siparisId: number;
    urunKodu?: string;
    adet: number;
}
