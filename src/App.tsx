import { Routes, Route, Link } from 'react-router-dom';
import { Merhaba } from './components/Merhaba';
import { UrunKarti } from './components/UrunKarti';
import { ElektronikListesi } from './components/ElektronikListesi';
import './App.css';

function App() {
  return (
    <div>

      <nav style={{ display: 'flex', gap: '15px', padding: '15px', background: '#e0e0e0', marginBottom: '20px' }}>
        <Link to="/">Ana Sayfa (Profil)</Link>
        <Link to="/urunler">Ürünler ve Liste</Link>
      </nav>


      <Routes>

        <Route path="/" element={
          <div>
            <p>Kullanıcı Girişi</p>
            <Merhaba name="Ayşe" username="Töre" age={24} city="İstanbul" />
          </div>
        } />



        <Route path="/urunler" element={
          <div>
            <UrunKarti baslik="Laptop" fiyat={10000} adet={10} />
            <UrunKarti baslik="pil" fiyat={25} adet={20} />
            <hr />
            <ElektronikListesi />
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;