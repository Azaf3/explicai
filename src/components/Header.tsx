import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <NavLink to="/" className="logo" end>
          Explica<span>í</span>
        </NavLink>
        <nav aria-label="Principal">
          <NavLink to="/" end>
            Conceitos
          </NavLink>
          <NavLink to="/como-foi-feito">Como foi feito com IA</NavLink>
          <NavLink to="/configuracoes">Configurações</NavLink>
        </nav>
      </div>
    </header>
  )
}
