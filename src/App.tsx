import './App.css'
import { Merhaba } from './components/Merhaba'
import { UrunKarti } from './components/UrunKarti'
import { ElektronikListesi } from './components/ElektronikListesi'

function App() {
  return (
    <div>

      <p>İlk PROJE</p>


      <Merhaba name="Ayşe" username="Töre" age={25} city="İstanbul" />

      <hr />

      <UrunKarti baslik="Laptop" fiyat={10000} adet={10} />
      <UrunKarti baslik="pil" fiyat={25} adet={20} />

      <ElektronikListesi />

    </div>

  )
}

export default App
