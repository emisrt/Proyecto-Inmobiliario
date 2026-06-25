import BrandLogo from './BrandLogo'

function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="auth-shell">
      <header className="auth-brand-bar">
        <div className="auth-brand-inner">
          <BrandLogo compact />
          <p>Gestion inmobiliaria integral</p>
        </div>
      </header>
      <main className="auth-shell-main">
        <section className="auth-panel">
          <div className="auth-copy">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h1>{title}</h1>
            {description ? <p className="muted">{description}</p> : null}
          </div>
          {children}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </section>
      </main>
    </div>
  )
}

export default AuthShell
