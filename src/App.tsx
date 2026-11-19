import { Link, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import ConceptPage from './pages/ConceptPage'
import HomePage from './pages/HomePage'
import HowBuiltPage from './pages/HowBuiltPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/conceito/:id" element={<ConceptPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/como-foi-feito" element={<HowBuiltPage />} />
          <Route
            path="*"
            element={
              <section className="empty">
                <h1>Página não encontrada</h1>
                <Link to="/">Voltar para os conceitos</Link>
              </section>
            }
          />
        </Routes>
      </main>
      <footer className="footer container">
        Feito por <a href="https://github.com/Azaf3">Azaf3</a> com ajuda do Claude.{' '}
        <Link to="/como-foi-feito">Veja como</Link>.
      </footer>
    </>
  )
}
