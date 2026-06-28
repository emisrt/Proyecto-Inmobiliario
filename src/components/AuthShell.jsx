import { Building2, CreditCard, FileText, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { agencyConfig } from '../config/agencyConfig'
import BrandLogo from './BrandLogo'

const defaultValueItems = [
  { label: 'Propiedades', icon: Building2 },
  { label: 'Contratos', icon: FileText },
  { label: 'Pagos', icon: CreditCard },
  { label: 'Arreglos', icon: Wrench },
]

function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  showValuePanel = false,
  valuePanelEyebrow = agencyConfig.systemName,
  valuePanelTitle = 'Gestioná tus alquileres en un solo lugar',
  valuePanelDescription = `Centralizá propiedades, contratos, pagos, arreglos y profesionales de ${agencyConfig.name} desde un sistema simple e integral.`,
  valuePanelItems = defaultValueItems,
}) {
  return (
    <div className="auth-shell">
      <header className="auth-brand-bar">
        <div className="auth-brand-inner">
          <div className="auth-brand-cluster">
            <BrandLogo variant="dark" />
            <span>{agencyConfig.tagline}</span>
          </div>
          <Link className="auth-header-link" to="/portal">
            Ver propiedades
          </Link>
        </div>
      </header>
      <main className="auth-shell-main">
        <div className={`auth-layout${showValuePanel ? ' auth-layout-split' : ''}`}>
          {showValuePanel ? (
            <section className="auth-value-panel" aria-label={`Beneficios de ${agencyConfig.systemName}`}>
              <p className="eyebrow">{valuePanelEyebrow}</p>
              <h1>{valuePanelTitle}</h1>
              <p>{valuePanelDescription}</p>
              <div className="auth-value-grid">
                {valuePanelItems.map((item) => {
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
