import { Building2, CreditCard, FileText, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'

const valueItems = [
  { label: 'Propiedades', icon: Building2 },
  { label: 'Contratos', icon: FileText },
  { label: 'Pagos', icon: CreditCard },
  { label: 'Arreglos', icon: Wrench },
]

function AuthShell({ eyebrow, title, description, children, footer, showValuePanel = false }) {
  return (
    <div className="auth-shell">
      <header className="auth-brand-bar">
        <div className="auth-brand-inner">
          <div className="auth-brand-cluster">
            <BrandLogo variant="dark" />
            <span>Sistema interno de gestión inmobiliaria</span>
          </div>
          <Link className="auth-header-link" to="/portal">
            Ver propiedades
          </Link>
        </div>
      </header>
      <main className="auth-shell-main">
        <div className={`auth-layout${showValuePanel ? ' auth-layout-split' : ''}`}>
          {showValuePanel ? (
            <section className="auth-value-panel" aria-label="Beneficios de Locative">
              <p className="eyebrow">Locative</p>
              <h1>Gestioná tus alquileres en un solo lugar</h1>
              <p>
                Centralizá propiedades, contratos, pagos, arreglos y profesionales de la inmobiliaria desde un sistema simple e integral.
              </p>
              <div className="auth-value-grid">
                {valueItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <div className="auth-value-item" key={item.label}>
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          ) : null}
          <section className="auth-panel">
            <div className="auth-card-panel">
              <div className="auth-copy">
                {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
                <h1>{title}</h1>
                {description ? <p className="muted">{description}</p> : null}
              </div>
              {children}
              {footer ? <div className="auth-footer">{footer}</div> : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default AuthShell
