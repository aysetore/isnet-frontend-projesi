import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import UrunlerTablosu from './components/UrunlerTablosu';
import MusterilerTablosu from './components/MusterilerTablosu';
import PersonellerTablosu from './components/PersonellerTablosu';
import SiparislerTablosu from './components/SiparislerTablosu';
import Login from './components/Login';
import './App.css';

function App() {

  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));


  if (!token) {
    return <Login onLoginSuccess={() => setToken(localStorage.getItem('token'))} />;
  }

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#e0e0e0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>

          <Link to="/urunler">Ürünler ve Liste</Link>
          <Link to="/musteriler">Müşteriler</Link>
          <Link to="/personeller">Personeller ve Liste</Link>
          <Link to="/siparisler">Siparisler</Link>
        </div>

        {/* Çıkış Yap Butonu */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            setToken(null);
          }}
          style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Çıkış Yap
        </button>
      </nav>

      <Routes>


        <Route path="/urunler" element={
          <div>
            <UrunlerTablosu />
          </div>
        } />

        <Route path="/musteriler" element={
          <div>
            <MusterilerTablosu />
          </div>
        } />
        <Route path="/personeller" element={
          <div>
            <PersonellerTablosu />
          </div>
        } />
        <Route path="/siparisler" element={
          <div>
            <SiparislerTablosu />
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;